/**
 * seedLeaveManagement.js  (v3 — sesuai model aplikasi: Karyawan / karyawans / statusKontrak)
 *
 * Seed + migrasi fitur Manajemen Cuti (dengan Hutang Cuti) ke MongoDB yang sudah ada.
 *
 * Langkah:
 *  0. Preflight   -> hitung karyawan. Kalau 0, BERHENTI sebelum menulis apa pun.
 *  1. LeaveType   -> upsert jenis cuti + flag `allowDebt` (true hanya Cuti Tahunan).
 *  2. Migrasi     -> LeaveBalance lama tanpa `carriedDebt` diisi 0.
 *  3. LeaveBalance-> buat saldo tahun target per karyawan; hutang tahun lalu
 *                    (saldo minus, allowDebt true) masuk ke `carriedDebt`.
 *  4. LeaveBalanceAdjustment -> hanya didaftarkan + index (riwayat edit admin).
 *
 * Rumus: remaining = quota - carriedDebt - used   (boleh negatif)
 *
 * CARA PAKAI (jalankan dari root project, tempat .env.local berada):
 *   node seedLeaveManagement.js --dry-run     -> simulasi, TIDAK menulis ke database
 *   node seedLeaveManagement.js               -> seed tahun berjalan
 *   node seedLeaveManagement.js 2027          -> seed tahun tertentu
 *   node seedLeaveManagement.js 2027 --dry-run
 *
 * Env dibaca dari .env.local, lalu .env (yang pertama menang). Butuh MONGODB_URI.
 * AMAN dijalankan berulang: saldo yang sudah ada tidak ditimpa.
 */

const path = require('path');
const dotenv = require('dotenv');
// .env.local diprioritaskan (dotenv tidak menimpa variabel yang sudah terisi)
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const mongoose = require('mongoose');

// ---------------------------------------------------------------------------
// KONFIGURASI — sesuai aplikasi HRGA Apps
// ---------------------------------------------------------------------------
const MONGODB_URI = process.env.MONGODB_URI;
const EMPLOYEE_MODEL = 'Karyawan';
const EMPLOYEE_COLLECTION = 'karyawans';
const CONTRACT_FIELD = 'statusKontrak'; // nilai: 'PROBATION' | 'PKWTT'

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const POLICY_MIGRATION_ONLY = args.includes('--migrate-quota-policy-only');
const TARGET_YEAR = parseInt(args.find((a) => /^\d{4}$/.test(a)), 10) || new Date().getFullYear();

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI tidak ditemukan di .env.local maupun .env');
  console.error(`   Folder kerja saat ini: ${process.cwd()}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// SCHEMAS
// ---------------------------------------------------------------------------
const LeaveTypeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    defaultQuotaPerYear: { type: Number, required: true, default: 0 },
    requiresAttachment: { type: Boolean, default: false },
    allowDebt: { type: Boolean, default: false },
    deductsQuota: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const LeaveBalanceSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: EMPLOYEE_MODEL, required: true },
    leaveTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType', required: true },
    year: { type: Number, required: true },
    quota: { type: Number, required: true, default: 0 },
    used: { type: Number, required: true, default: 0 },
    carriedDebt: { type: Number, required: true, default: 0 },
    adminAdjustment: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);
LeaveBalanceSchema.index({ employeeId: 1, leaveTypeId: 1, year: 1 }, { unique: true });

const LeaveRequestSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: EMPLOYEE_MODEL, required: true },
    leaveTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalDays: { type: Number, required: true },
    reason: { type: String },
    attachmentUrl: { type: String },
    doctorName: { type: String, trim: true, default: null },
    certificateNumber: { type: String, trim: true, default: null },
    additionalNotes: { type: String, trim: true, default: null },
    verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected', null], default: null },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: EMPLOYEE_MODEL, default: null },
    verifiedAt: { type: Date, default: null },
    verificationNote: { type: String, trim: true, default: null },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: EMPLOYEE_MODEL },
    reviewedAt: { type: Date },
    reviewNote: { type: String },
  },
  { timestamps: true }
);

const LeaveBalanceAdjustmentSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: EMPLOYEE_MODEL, required: true },
    leaveTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType', required: true },
    year: { type: Number, required: true },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    previousRemaining: { type: Number, required: true },
    newRemaining: { type: Number, required: true },
    reason: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
LeaveBalanceAdjustmentSchema.index({ employeeId: 1, year: 1, createdAt: -1 });

const LeaveType = mongoose.models.LeaveType || mongoose.model('LeaveType', LeaveTypeSchema);
const LeaveBalance = mongoose.models.LeaveBalance || mongoose.model('LeaveBalance', LeaveBalanceSchema);
const LeaveRequest = mongoose.models.LeaveRequest || mongoose.model('LeaveRequest', LeaveRequestSchema);
const LeaveBalanceAdjustment =
  mongoose.models.LeaveBalanceAdjustment ||
  mongoose.model('LeaveBalanceAdjustment', LeaveBalanceAdjustmentSchema);

// Model karyawan milik aplikasi: hanya dibaca (strict:false), tidak diubah.
const Karyawan =
  mongoose.models[EMPLOYEE_MODEL] ||
  mongoose.model(
    EMPLOYEE_MODEL,
    new mongoose.Schema({}, { collection: EMPLOYEE_COLLECTION, strict: false })
  );

// ---------------------------------------------------------------------------
// DATA
// ---------------------------------------------------------------------------
const leaveTypesSeed = [
  { code: 'annual',      name: 'Cuti Tahunan',                        defaultQuotaPerYear: 12, requiresAttachment: false, allowDebt: true,  deductsQuota: true },
  { code: 'sick',        name: 'Cuti Sakit',                          defaultQuotaPerYear: 0,  requiresAttachment: true,  allowDebt: false, deductsQuota: false },
  { code: 'maternity',   name: 'Cuti Melahirkan',                     defaultQuotaPerYear: 90, requiresAttachment: true,  allowDebt: false, deductsQuota: true },
  { code: 'marriage',    name: 'Cuti Menikah',                        defaultQuotaPerYear: 3,  requiresAttachment: false, allowDebt: false, deductsQuota: true },
  { code: 'bereavement', name: 'Cuti Duka (Keluarga Inti Meninggal)', defaultQuotaPerYear: 2,  requiresAttachment: false, allowDebt: false, deductsQuota: true },
  { code: 'unpaid',      name: 'Izin Tidak Dibayar',                  defaultQuotaPerYear: 0,  requiresAttachment: false, allowDebt: false, deductsQuota: true },
];

function getContractStatus(emp) {
  return String(emp[CONTRACT_FIELD] || '').trim().toUpperCase();
}

// Kuota per status kontrak -- SESUAIKAN kebijakan DTS (PROBATION = 0 cuti tahunan)
function getQuota(leaveType, emp) {
  if (leaveType.code !== 'annual') return leaveType.defaultQuotaPerYear;
  if (getContractStatus(emp) === 'PROBATION') return 0;
  return leaveType.defaultQuotaPerYear;
}

// ---------------------------------------------------------------------------
// PREFLIGHT
// ---------------------------------------------------------------------------
async function preflight() {
  const db = mongoose.connection.db;
  console.log(`🗄  Database: ${db.databaseName}${DRY_RUN ? '   [DRY-RUN: tidak ada yang ditulis]' : ''}`);

  const employees = await Karyawan.find({}).lean();
  if (employees.length === 0) {
    const names = (await db.listCollections().toArray()).map((c) => c.name);
    console.error(`\n❌ Koleksi "${EMPLOYEE_COLLECTION}" kosong / tidak ditemukan. Tidak ada yang diubah.`);
    console.error(`   Koleksi yang ada: ${names.join(', ') || '(kosong)'}`);
    console.error('   Periksa MONGODB_URI (database yang benar?) dan EMPLOYEE_COLLECTION di bagian KONFIGURASI.');
    process.exit(1);
  }

  const dist = {};
  employees.forEach((e) => {
    const s = getContractStatus(e) || '(kosong)';
    dist[s] = (dist[s] || 0) + 1;
  });
  console.log(`👥 ${employees.length} karyawan ditemukan. Sebaran ${CONTRACT_FIELD}:`, dist);
  if (dist['(kosong)']) {
    console.warn(`  ⚠ ${dist['(kosong)']} karyawan tanpa ${CONTRACT_FIELD} — diperlakukan sebagai non-probation.`);
  }
  return employees;
}

// ---------------------------------------------------------------------------
// SEED
// ---------------------------------------------------------------------------
async function seedLeaveTypes() {
  console.log('\n📋 Leave Types...');
  const results = [];
  for (const lt of leaveTypesSeed) {
    if (DRY_RUN) {
      const existing = await LeaveType.findOne({ code: lt.code });
      console.log(`  ~ ${lt.name} (${lt.code}) — ${existing ? 'akan di-update' : 'akan dibuat'}, allowDebt: ${lt.allowDebt}`);
      results.push(existing ? Object.assign(existing, lt) : { ...lt }); // tanpa _id kalau belum ada
      continue;
    }
    const doc = await LeaveType.findOneAndUpdate(
      { code: lt.code },
      { $set: lt },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
    results.push(doc);
    console.log(`  ✔ ${doc.name} (${doc.code}) — kuota: ${doc.defaultQuotaPerYear}, allowDebt: ${doc.allowDebt}`);
  }
  return results;
}

async function migrateExistingBalances() {
  console.log('\n🔧 Migrasi LeaveBalance lama...');
  const filter = { carriedDebt: { $exists: false } };
  const adjustmentFilter = { adminAdjustment: { $exists: false } };
  if (DRY_RUN) {
    console.log(`  ~ ${await LeaveBalance.countDocuments(filter)} dokumen akan diberi carriedDebt = 0.`);
    console.log(`  ~ ${await LeaveBalance.countDocuments(adjustmentFilter)} dokumen akan diberi adminAdjustment = 0.`);
    return;
  }
  const res = await LeaveBalance.updateMany(filter, { $set: { carriedDebt: 0 } });
  const adjustmentRes = await LeaveBalance.updateMany(adjustmentFilter, { $set: { adminAdjustment: 0 } });
  console.log(`  ✔ ${res.modifiedCount} dokumen diberi carriedDebt = 0.`);
  console.log(`  ✔ ${adjustmentRes.modifiedCount} dokumen diberi adminAdjustment = 0.`);
}

async function migrateQuotaPolicy() {
  console.log('\n🔧 Migrasi kebijakan pemotongan kuota...');
  const legacyFilter = { deductsQuota: { $exists: false }, code: { $ne: 'sick' } };
  const sickFilter = { code: 'sick', deductsQuota: { $ne: false } };
  if (DRY_RUN) {
    console.log(`  ~ ${await LeaveType.countDocuments(legacyFilter)} jenis cuti lama akan disetel deductsQuota = true.`);
    console.log(`  ~ ${await LeaveType.countDocuments(sickFilter)} jenis cuti sakit akan disetel deductsQuota = false.`);
    return;
  }
  const legacy = await LeaveType.updateMany(legacyFilter, { $set: { deductsQuota: true } });
  const sick = await LeaveType.updateMany(sickFilter, { $set: { deductsQuota: false } });
  console.log(`  ✔ ${legacy.modifiedCount} jenis lama diaktifkan pemotongan kuota; ${sick.modifiedCount} jenis sakit dikecualikan.`);
}

async function seedLeaveBalances(employees, leaveTypes) {
  console.log(`\n📒 Leave Balances tahun ${TARGET_YEAR}...`);
  let created = 0, skipped = 0, withDebt = 0;

  for (const emp of employees) {
    for (const lt of leaveTypes) {
      const existing = lt._id
        ? await LeaveBalance.findOne({ employeeId: emp._id, leaveTypeId: lt._id, year: TARGET_YEAR })
        : null;
      if (existing) { skipped++; continue; }

      let carriedDebt = 0;
      if (lt.allowDebt && lt._id) {
        const prev = await LeaveBalance.findOne({
          employeeId: emp._id, leaveTypeId: lt._id, year: TARGET_YEAR - 1,
        }).lean();
        if (prev) {
          const prevRemaining = prev.quota - (prev.carriedDebt || 0) - prev.used + (prev.adminAdjustment || 0);
          carriedDebt = Math.max(0, -prevRemaining);
        }
      }

      if (!DRY_RUN) {
        await LeaveBalance.create({
          employeeId: emp._id, leaveTypeId: lt._id, year: TARGET_YEAR,
          quota: getQuota(lt, emp), used: 0, carriedDebt,
        });
      }
      created++;
      if (carriedDebt > 0) {
        withDebt++;
        console.log(`  ↳ ${emp.nama || emp.name || emp._id}: ${lt.name} — hutang bawaan ${carriedDebt} hari`);
      }
    }
  }

  const verb = DRY_RUN ? 'akan dibuat' : 'dibuat';
  console.log(`  ✔ ${created} balance ${verb}, ${skipped} sudah ada (dilewati), ${withDebt} dengan hutang bawaan.`);
}

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------
async function main() {
  try {
    console.log('🔌 Menghubungkan ke MongoDB...');
    await mongoose.connect(MONGODB_URI);

    if (POLICY_MIGRATION_ONLY) {
      await migrateQuotaPolicy();
      console.log(`\nSelesai${DRY_RUN ? ' (dry-run, database tidak diubah)' : ''}.`);
      return;
    }

    const employees = await preflight(); // berhenti di sini kalau data karyawan tidak ketemu

    if (!DRY_RUN) {
      await Promise.all([
        LeaveType.init(), LeaveBalance.init(), LeaveRequest.init(), LeaveBalanceAdjustment.init(),
      ]);
    }

    const leaveTypes = await seedLeaveTypes();
    await migrateQuotaPolicy();
    await migrateExistingBalances();
    await seedLeaveBalances(employees, leaveTypes);

    console.log(`\n🎉 Selesai${DRY_RUN ? ' (dry-run, database tidak diubah)' : ''}.`);
  } catch (err) {
    console.error('❌ Gagal:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) main();

module.exports = { LeaveType, LeaveBalance, LeaveRequest, LeaveBalanceAdjustment, migrateQuotaPolicy };
