/**
 * seedLeaveManagement.js
 *
 * Seed script untuk fitur Manajemen Cuti ke database MongoDB yang sudah ada.
 * Mengisi:
 *  1. Koleksi "leavetypes"    -> jenis-jenis cuti (Cuti Tahunan, Sakit, dll)
 *  2. Koleksi "leavebalances" -> kuota cuti tahun berjalan untuk SETIAP karyawan
 *     yang sudah ada di koleksi Employee/Karyawan kamu.
 *
 * ASUMSI (sesuaikan bagian yang ditandai "// SESUAIKAN" di bawah):
 *  - Kamu pakai Mongoose.
 *  - Koleksi karyawan kamu bernama "Employee" (model), field status kontrak
 *    ada di `contractStatus` dengan nilai 'PROBATION' | 'PKWTT'.
 *  - Karyawan PROBATION dapat kuota lebih kecil dari PKWTT (umum di Indonesia,
 *    tapi ubah sesuai kebijakan HRGA kamu).
 *
 * CARA PAKAI:
 *  1. npm install mongoose dotenv   (kalau belum ada)
 *  2. Pastikan .env berisi MONGODB_URI=mongodb+srv://...
 *  3. node seedLeaveManagement.js
 *
 * Script ini AMAN dijalankan berkali-kali (idempotent):
 *  - LeaveType di-upsert berdasarkan `code`.
 *  - LeaveBalance di-upsert berdasarkan kombinasi (employeeId, leaveTypeId, year),
 *    jadi tidak akan menimpa sisa cuti yang sudah terpakai kalau dijalankan ulang.
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI; // SESUAIKAN kalau nama env var kamu beda
const CURRENT_YEAR = new Date().getFullYear();

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI tidak ditemukan di .env.local');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// SCHEMAS
// ---------------------------------------------------------------------------

const LeaveTypeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true }, // slug unik, misal 'annual'
    name: { type: String, required: true },                // nama tampil, misal 'Cuti Tahunan'
    defaultQuotaPerYear: { type: Number, required: true, default: 0 },
    requiresAttachment: { type: Boolean, default: false },  // wajib upload lampiran/surat dokter
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const LeaveBalanceSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Karyawan', required: true },
    leaveTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType', required: true },
    year: { type: Number, required: true },
    quota: { type: Number, required: true, default: 0 },
    used: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);
LeaveBalanceSchema.index({ employeeId: 1, leaveTypeId: 1, year: 1 }, { unique: true });

const LeaveRequestSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Karyawan', required: true },
    leaveTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalDays: { type: Number, required: true },
    reason: { type: String },
    attachmentUrl: { type: String }, // surat dokter / dokumen pendukung
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    reviewedAt: { type: Date },
    reviewNote: { type: String },
  },
  { timestamps: true }
);

const LeaveType = mongoose.models.LeaveType || mongoose.model('LeaveType', LeaveTypeSchema);
const LeaveBalance = mongoose.models.LeaveBalance || mongoose.model('LeaveBalance', LeaveBalanceSchema);
const LeaveRequest = mongoose.models.LeaveRequest || mongoose.model('LeaveRequest', LeaveRequestSchema);

// Model Employee HANYA di-reference (bukan dibuat ulang) karena kamu sudah
// punya koleksi karyawan. SESUAIKAN nama model & field di bawah agar sama
// persis dengan model Employee/Karyawan yang sudah ada di project kamu.
const Karyawan =
  mongoose.models.Karyawan ||
  mongoose.model(
    'Karyawan',
    new mongoose.Schema(
      {
        nama: String,
        statusKontrak: String,
      },
      { collection: 'karyawans', strict: false }
    )
  );

// ---------------------------------------------------------------------------
// DATA: Jenis Cuti Default
// ---------------------------------------------------------------------------

const leaveTypesSeed = [
  {
    code: 'annual',
    name: 'Cuti Tahunan',
    defaultQuotaPerYear: 12,
    requiresAttachment: false,
  },
  {
    code: 'sick',
    name: 'Cuti Sakit',
    defaultQuotaPerYear: 0, // biasanya tidak dibatasi kuota, tapi wajib surat dokter
    requiresAttachment: true,
  },
  {
    code: 'maternity',
    name: 'Cuti Melahirkan',
    defaultQuotaPerYear: 90, // sesuai UU Ketenagakerjaan (3 bulan)
    requiresAttachment: true,
  },
  {
    code: 'marriage',
    name: 'Cuti Menikah',
    defaultQuotaPerYear: 3,
    requiresAttachment: false,
  },
  {
    code: 'bereavement',
    name: 'Cuti Duka (Keluarga Inti Meninggal)',
    defaultQuotaPerYear: 2,
    requiresAttachment: false,
  },
  {
    code: 'unpaid',
    name: 'Izin Tidak Dibayar',
    defaultQuotaPerYear: 0,
    requiresAttachment: false,
  },
];

// Kuota tahunan berbeda per status kontrak -- SESUAIKAN sesuai kebijakan DTS
function getQuotaForContractStatus(leaveTypeCode, contractStatus) {
  if (leaveTypeCode !== 'annual') {
    return leaveTypesSeed.find((lt) => lt.code === leaveTypeCode).defaultQuotaPerYear;
  }
  if (contractStatus === 'PROBATION') return 0; // umumnya karyawan probation belum dapat cuti tahunan
  return 12; // PKWTT full quota
}

// ---------------------------------------------------------------------------
// SEED FUNCTIONS
// ---------------------------------------------------------------------------

async function seedLeaveTypes() {
  console.log('\n📋 Seeding Leave Types...');
  const results = [];
  for (const lt of leaveTypesSeed) {
    const doc = await LeaveType.findOneAndUpdate(
      { code: lt.code },
      { $set: lt },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    results.push(doc);
    console.log(`  ✔ ${doc.name} (${doc.code}) — kuota default: ${doc.defaultQuotaPerYear}`);
  }
  return results;
}

async function seedLeaveBalances(leaveTypes) {
  console.log('\n👥 Seeding Leave Balances untuk semua karyawan...');
  const employees = await Karyawan.find({}).lean();

  if (employees.length === 0) {
    console.warn('  ⚠ Tidak ada data karyawan ditemukan. Lewati seeding balance.');
    console.warn('    Cek nama koleksi/model Employee di script ini (bagian SESUAIKAN).');
    return;
  }

  let created = 0;
  let skipped = 0;

  for (const emp of employees) {
    for (const lt of leaveTypes) {
      const quota = getQuotaForContractStatus(lt.code, emp.statusKontrak);

      const existing = await LeaveBalance.findOne({
        employeeId: emp._id,
        leaveTypeId: lt._id,
        year: CURRENT_YEAR,
      });

      if (existing) {
        skipped++;
        continue; // jangan timpa data yang sudah ada (biar `used` tidak ke-reset)
      }

      await LeaveBalance.create({
        employeeId: emp._id,
        leaveTypeId: lt._id,
        year: CURRENT_YEAR,
        quota,
        used: 0,
      });
      created++;
    }
  }

  console.log(`  ✔ ${created} leave balance baru dibuat, ${skipped} sudah ada (dilewati).`);
  console.log(`  ℹ Total karyawan diproses: ${employees.length}`);
}

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------

async function main() {
  try {
    console.log('🔌 Menghubungkan ke MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Terhubung.');

    const leaveTypes = await seedLeaveTypes();
    await seedLeaveBalances(leaveTypes);

    console.log('\n🎉 Seeding selesai.');
  } catch (err) {
    console.error('❌ Gagal seeding:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Koneksi ditutup.');
  }
}

main();

module.exports = { LeaveType, LeaveBalance, LeaveRequest };
