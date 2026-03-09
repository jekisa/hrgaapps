const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hrga_apps'

// Inline schema definitions for seed script (CommonJS)
const userSchema = new mongoose.Schema({ name: String, email: { type: String, unique: true }, password: String, role: { type: String, default: 'STAFF' }, isActive: { type: Boolean, default: true } }, { timestamps: true })
const karyawanSchema = new mongoose.Schema({ nik: { type: String, unique: true }, nama: String, tempatLahir: String, tanggalLahir: Date, jenisKelamin: String, agama: String, alamat: String, telepon: String, email: String, statusKontrak: { type: String, default: 'PKWTT' }, tanggalMasuk: Date, tanggalKontrakBerakhir: Date, departemen: String, jabatan: String, statusAktif: { type: Boolean, default: true } }, { timestamps: true })
const riwayatJabatanSchema = new mongoose.Schema({ karyawanId: mongoose.Schema.Types.ObjectId, jabatan: String, departemen: String, tanggalMulai: Date, tanggalSelesai: Date, keterangan: String }, { timestamps: true })
const asetSchema = new mongoose.Schema({ kodeAset: { type: String, unique: true }, namaAset: String, kategori: String, merk: String, model: String, serialNumber: String, tahunPerolehan: Number, nilaiPerolehan: Number, kondisi: { type: String, default: 'BAIK' }, status: { type: String, default: 'AKTIF' }, lokasi: String, keterangan: String }, { timestamps: true })
const kendaraanSchema = new mongoose.Schema({ noPol: { type: String, unique: true }, merk: String, model: String, tahun: Number, warna: String, jenisKendaraan: String, noRangka: String, noMesin: String, status: { type: String, default: 'TERSEDIA' }, tanggalPajakBerakhir: Date, tanggalSTNKBerakhir: Date, keterangan: String }, { timestamps: true })
const maintenanceSchema = new mongoose.Schema({ judul: String, lokasi: String, kategori: String, deskripsi: String, prioritas: { type: String, default: 'NORMAL' }, status: { type: String, default: 'PENDING' }, pemohon: String, pelaksana: String, biaya: Number, tanggalRequest: { type: Date, default: Date.now }, tanggalSelesai: Date, keterangan: String }, { timestamps: true })
const utilitasSchema = new mongoose.Schema({ jenis: String, bulan: Number, tahun: Number, tagihan: Number, penggunaan: Number, satuan: String, statusBayar: { type: String, default: 'BELUM' }, tanggalBayar: Date, keterangan: String }, { timestamps: true })
const perawatanSchema = new mongoose.Schema({ kendaraanId: mongoose.Schema.Types.ObjectId, tanggal: Date, jenisPerawatan: String, deskripsi: String, biaya: Number, bengkel: String, kmServis: Number, kmServisBerikutnya: Number, status: { type: String, default: 'TERJADWAL' } }, { timestamps: true })
const pajakSchema = new mongoose.Schema({ kendaraanId: mongoose.Schema.Types.ObjectId, jenisPajak: String, tahun: Number, tanggalJatuhTempo: Date, tanggalBayar: Date, jumlah: Number, status: { type: String, default: 'BELUM' }, keterangan: String }, { timestamps: true })
const notifikasiSchema = new mongoose.Schema({ judul: String, pesan: String, tipe: String, targetId: mongoose.Schema.Types.ObjectId, status: { type: String, default: 'BELUM_DIBACA' } }, { timestamps: true })
const auditLogSchema = new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId, aksi: String, modul: String, detail: String, ipAddress: String }, { timestamps: true })

const User = mongoose.model('User', userSchema)
const Karyawan = mongoose.model('Karyawan', karyawanSchema)
const RiwayatJabatan = mongoose.model('RiwayatJabatan', riwayatJabatanSchema)
const Aset = mongoose.model('Aset', asetSchema)
const Kendaraan = mongoose.model('Kendaraan', kendaraanSchema)
const MaintenanceRequest = mongoose.model('MaintenanceRequest', maintenanceSchema)
const Utilitas = mongoose.model('Utilitas', utilitasSchema)
const PerawatanKendaraan = mongoose.model('PerawatanKendaraan', perawatanSchema)
const PembayaranPajak = mongoose.model('PembayaranPajak', pajakSchema)
const Notifikasi = mongoose.model('Notifikasi', notifikasiSchema)
const AuditLog = mongoose.model('AuditLog', auditLogSchema)

async function main() {
  await mongoose.connect(MONGODB_URI, { bufferCommands: false })
  console.log('Connected to MongoDB. Seeding...')

  // Clear existing data
  await Promise.all([
    User.deleteMany({}), Karyawan.deleteMany({}), RiwayatJabatan.deleteMany({}),
    Aset.deleteMany({}), Kendaraan.deleteMany({}), MaintenanceRequest.deleteMany({}),
    Utilitas.deleteMany({}), PerawatanKendaraan.deleteMany({}),
    PembayaranPajak.deleteMany({}), Notifikasi.deleteMany({}), AuditLog.deleteMany({}),
  ])

  const adminPassword = await bcrypt.hash('admin123', 10)
  const staffPassword = await bcrypt.hash('staff123', 10)

  const admin = await User.create({ name: 'Administrator', email: 'admin@hrgaapps.com', password: adminPassword, role: 'ADMIN' })
  await User.create({ name: 'Staff HR', email: 'staff@hrgaapps.com', password: staffPassword, role: 'STAFF' })

  const karyawan1 = await Karyawan.create({ nik: '001001', nama: 'Budi Santoso', tempatLahir: 'Jakarta', tanggalLahir: new Date('1990-03-15'), jenisKelamin: 'L', agama: 'Islam', alamat: 'Jl. Merdeka No. 1, Jakarta', telepon: '081234567890', email: 'budi.santoso@company.com', statusKontrak: 'PKWTT', tanggalMasuk: new Date('2020-01-15'), departemen: 'IT', jabatan: 'Software Engineer' })
  const karyawan2 = await Karyawan.create({ nik: '001002', nama: 'Siti Rahayu', tempatLahir: 'Bandung', tanggalLahir: new Date('1992-07-20'), jenisKelamin: 'P', agama: 'Islam', alamat: 'Jl. Sudirman No. 5, Bandung', telepon: '082345678901', email: 'siti.rahayu@company.com', statusKontrak: 'PKWT', tanggalMasuk: new Date('2023-03-01'), tanggalKontrakBerakhir: new Date('2024-12-31'), departemen: 'HR', jabatan: 'HR Staff' })
  await Karyawan.create({ nik: '001003', nama: 'Ahmad Fauzi', tempatLahir: 'Surabaya', tanggalLahir: new Date('1988-11-08'), jenisKelamin: 'L', agama: 'Islam', alamat: 'Jl. Ahmad Yani No. 10, Surabaya', telepon: '083456789012', email: 'ahmad.fauzi@company.com', statusKontrak: 'PROBATION', tanggalMasuk: new Date('2024-01-01'), tanggalKontrakBerakhir: new Date('2024-03-31'), departemen: 'Finance', jabatan: 'Finance Staff' })

  await RiwayatJabatan.insertMany([
    { karyawanId: karyawan1._id, jabatan: 'Junior Developer', departemen: 'IT', tanggalMulai: new Date('2020-01-15'), tanggalSelesai: new Date('2022-01-14'), keterangan: 'Posisi awal' },
    { karyawanId: karyawan1._id, jabatan: 'Software Engineer', departemen: 'IT', tanggalMulai: new Date('2022-01-15'), keterangan: 'Promosi jabatan' },
  ])

  await Aset.insertMany([
    { kodeAset: 'AST-001', namaAset: 'Laptop Dell XPS 15', kategori: 'ELEKTRONIK', merk: 'Dell', model: 'XPS 15', serialNumber: 'DLL-XPS-001', tahunPerolehan: 2022, nilaiPerolehan: 25000000, kondisi: 'BAIK', status: 'AKTIF', lokasi: 'Ruang IT' },
    { kodeAset: 'AST-002', namaAset: 'Printer HP LaserJet', kategori: 'ELEKTRONIK', merk: 'HP', model: 'LaserJet Pro', serialNumber: 'HP-LJ-002', tahunPerolehan: 2021, nilaiPerolehan: 5000000, kondisi: 'BAIK', status: 'AKTIF', lokasi: 'Ruang Admin' },
    { kodeAset: 'AST-003', namaAset: 'Meja Kerja', kategori: 'PERALATAN', merk: 'Olympic', tahunPerolehan: 2020, nilaiPerolehan: 2000000, kondisi: 'BAIK', status: 'AKTIF', lokasi: 'Ruang Meeting' },
  ])

  const kendaraan1 = await Kendaraan.create({ noPol: 'B 1234 ABC', merk: 'Toyota', model: 'Innova', tahun: 2022, warna: 'Putih', jenisKendaraan: 'MOBIL', noRangka: 'MHFXW9AG4N0001234', noMesin: '2GD-001234', status: 'TERSEDIA', tanggalPajakBerakhir: new Date('2025-08-15'), tanggalSTNKBerakhir: new Date('2025-08-15') })
  const kendaraan2 = await Kendaraan.create({ noPol: 'B 5678 DEF', merk: 'Honda', model: 'Vario 125', tahun: 2021, warna: 'Merah', jenisKendaraan: 'MOTOR', status: 'TERSEDIA', tanggalPajakBerakhir: new Date('2024-12-20'), tanggalSTNKBerakhir: new Date('2024-12-20') })

  await MaintenanceRequest.insertMany([
    { judul: 'Perbaikan AC Ruang Rapat', lokasi: 'Lantai 2 - Ruang Rapat', kategori: 'AC', deskripsi: 'AC tidak dingin, perlu pengecekan freon', prioritas: 'HIGH', status: 'PROSES', pemohon: 'Siti Rahayu', pelaksana: 'Tim Teknisi', biaya: 500000 },
    { judul: 'Penggantian Lampu Lobby', lokasi: 'Lobby Utama', kategori: 'LISTRIK', deskripsi: 'Beberapa lampu lobby mati', prioritas: 'NORMAL', status: 'PENDING', pemohon: 'Ahmad Fauzi' },
  ])

  await Utilitas.insertMany([
    { jenis: 'LISTRIK', bulan: 1, tahun: 2024, tagihan: 5500000, penggunaan: 2750, satuan: 'kWh', statusBayar: 'SUDAH', tanggalBayar: new Date('2024-02-05') },
    { jenis: 'AIR', bulan: 1, tahun: 2024, tagihan: 800000, penggunaan: 120, satuan: 'm3', statusBayar: 'SUDAH', tanggalBayar: new Date('2024-02-08') },
    { jenis: 'INTERNET', bulan: 1, tahun: 2024, tagihan: 2000000, statusBayar: 'SUDAH', tanggalBayar: new Date('2024-01-20') },
    { jenis: 'LISTRIK', bulan: 2, tahun: 2024, tagihan: 5800000, penggunaan: 2900, satuan: 'kWh', statusBayar: 'BELUM' },
  ])

  await PerawatanKendaraan.insertMany([
    { kendaraanId: kendaraan1._id, tanggal: new Date('2024-01-15'), jenisPerawatan: 'SERVICE_RUTIN', deskripsi: 'Service 10.000 km', biaya: 750000, bengkel: 'Auto2000', kmServis: 10000, kmServisBerikutnya: 20000, status: 'SELESAI' },
    { kendaraanId: kendaraan1._id, tanggal: new Date('2024-07-15'), jenisPerawatan: 'SERVICE_RUTIN', deskripsi: 'Service 20.000 km', biaya: 850000, bengkel: 'Auto2000', kmServis: 20000, kmServisBerikutnya: 30000, status: 'TERJADWAL' },
  ])

  await PembayaranPajak.insertMany([
    { kendaraanId: kendaraan1._id, jenisPajak: 'PKB', tahun: 2024, tanggalJatuhTempo: new Date('2025-08-15'), jumlah: 3500000, status: 'BELUM' },
    { kendaraanId: kendaraan2._id, jenisPajak: 'PKB', tahun: 2024, tanggalJatuhTempo: new Date('2024-12-20'), jumlah: 800000, status: 'BELUM' },
  ])

  await Notifikasi.insertMany([
    { judul: 'Kontrak Akan Berakhir', pesan: 'Kontrak karyawan Siti Rahayu akan berakhir pada 31 Desember 2024', tipe: 'KONTRAK', status: 'BELUM_DIBACA', targetId: karyawan2._id },
    { judul: 'Jadwal Servis Kendaraan', pesan: 'Kendaraan B 1234 ABC jadwal service di bulan Juli 2024', tipe: 'SERVIS', status: 'BELUM_DIBACA', targetId: kendaraan1._id },
    { judul: 'Pajak Kendaraan Jatuh Tempo', pesan: 'Pajak kendaraan B 5678 DEF akan jatuh tempo 20 Desember 2024', tipe: 'PAJAK', status: 'BELUM_DIBACA', targetId: kendaraan2._id },
  ])

  await AuditLog.insertMany([
    { userId: admin._id, aksi: 'LOGIN', modul: 'AUTH', detail: 'Admin berhasil login', ipAddress: '127.0.0.1' },
    { userId: admin._id, aksi: 'CREATE', modul: 'KARYAWAN', detail: 'Menambah karyawan baru: Budi Santoso', ipAddress: '127.0.0.1' },
  ])

  console.log('Database seeded successfully!')
  await mongoose.disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
