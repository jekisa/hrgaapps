const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 10)
  const staffPassword = await bcrypt.hash('staff123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@hrgaapps.com' },
    update: {},
    create: {
      name: 'Administrator',
      email: 'admin@hrgaapps.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  await prisma.user.upsert({
    where: { email: 'staff@hrgaapps.com' },
    update: {},
    create: {
      name: 'Staff HR',
      email: 'staff@hrgaapps.com',
      password: staffPassword,
      role: 'STAFF',
    },
  })

  // Create Karyawan
  const karyawan1 = await prisma.karyawan.upsert({
    where: { nik: '001001' },
    update: {},
    create: {
      nik: '001001',
      nama: 'Budi Santoso',
      tempatLahir: 'Jakarta',
      tanggalLahir: new Date('1990-03-15'),
      jenisKelamin: 'L',
      agama: 'Islam',
      alamat: 'Jl. Merdeka No. 1, Jakarta',
      telepon: '081234567890',
      email: 'budi.santoso@company.com',
      statusKontrak: 'PKWTT',
      tanggalMasuk: new Date('2020-01-15'),
      departemen: 'IT',
      jabatan: 'Software Engineer',
    },
  })

  const karyawan2 = await prisma.karyawan.upsert({
    where: { nik: '001002' },
    update: {},
    create: {
      nik: '001002',
      nama: 'Siti Rahayu',
      tempatLahir: 'Bandung',
      tanggalLahir: new Date('1992-07-20'),
      jenisKelamin: 'P',
      agama: 'Islam',
      alamat: 'Jl. Sudirman No. 5, Bandung',
      telepon: '082345678901',
      email: 'siti.rahayu@company.com',
      statusKontrak: 'PKWT',
      tanggalMasuk: new Date('2023-03-01'),
      tanggalKontrakBerakhir: new Date('2024-12-31'),
      departemen: 'HR',
      jabatan: 'HR Staff',
    },
  })

  const karyawan3 = await prisma.karyawan.upsert({
    where: { nik: '001003' },
    update: {},
    create: {
      nik: '001003',
      nama: 'Ahmad Fauzi',
      tempatLahir: 'Surabaya',
      tanggalLahir: new Date('1988-11-08'),
      jenisKelamin: 'L',
      agama: 'Islam',
      alamat: 'Jl. Ahmad Yani No. 10, Surabaya',
      telepon: '083456789012',
      email: 'ahmad.fauzi@company.com',
      statusKontrak: 'PROBATION',
      tanggalMasuk: new Date('2024-01-01'),
      tanggalKontrakBerakhir: new Date('2024-03-31'),
      departemen: 'Finance',
      jabatan: 'Finance Staff',
    },
  })

  // Riwayat Jabatan
  await prisma.riwayatJabatan.createMany({
    data: [
      {
        karyawanId: karyawan1.id,
        jabatan: 'Junior Developer',
        departemen: 'IT',
        tanggalMulai: new Date('2020-01-15'),
        tanggalSelesai: new Date('2022-01-14'),
        keterangan: 'Posisi awal',
      },
      {
        karyawanId: karyawan1.id,
        jabatan: 'Software Engineer',
        departemen: 'IT',
        tanggalMulai: new Date('2022-01-15'),
        keterangan: 'Promosi jabatan',
      },
    ],
  })

  // Create Aset
  await prisma.aset.createMany({
    data: [
      {
        kodeAset: 'AST-001',
        namaAset: 'Laptop Dell XPS 15',
        kategori: 'ELEKTRONIK',
        merk: 'Dell',
        model: 'XPS 15',
        serialNumber: 'DLL-XPS-001',
        tahunPerolehan: 2022,
        nilaiPerolehan: 25000000,
        kondisi: 'BAIK',
        status: 'AKTIF',
        lokasi: 'Ruang IT',
      },
      {
        kodeAset: 'AST-002',
        namaAset: 'Printer HP LaserJet',
        kategori: 'ELEKTRONIK',
        merk: 'HP',
        model: 'LaserJet Pro',
        serialNumber: 'HP-LJ-002',
        tahunPerolehan: 2021,
        nilaiPerolehan: 5000000,
        kondisi: 'BAIK',
        status: 'AKTIF',
        lokasi: 'Ruang Admin',
      },
      {
        kodeAset: 'AST-003',
        namaAset: 'Meja Kerja',
        kategori: 'PERALATAN',
        merk: 'Olympic',
        tahunPerolehan: 2020,
        nilaiPerolehan: 2000000,
        kondisi: 'BAIK',
        status: 'AKTIF',
        lokasi: 'Ruang Meeting',
      },
    ],
  })

  // Create Kendaraan
  const kendaraan1 = await prisma.kendaraan.upsert({
    where: { noPol: 'B 1234 ABC' },
    update: {},
    create: {
      noPol: 'B 1234 ABC',
      merk: 'Toyota',
      model: 'Innova',
      tahun: 2022,
      warna: 'Putih',
      jenisKendaraan: 'MOBIL',
      noRangka: 'MHFXW9AG4N0001234',
      noMesin: '2GD-001234',
      status: 'TERSEDIA',
      tanggalPajakBerakhir: new Date('2025-08-15'),
      tanggalSTNKBerakhir: new Date('2025-08-15'),
    },
  })

  const kendaraan2 = await prisma.kendaraan.upsert({
    where: { noPol: 'B 5678 DEF' },
    update: {},
    create: {
      noPol: 'B 5678 DEF',
      merk: 'Honda',
      model: 'Vario 125',
      tahun: 2021,
      warna: 'Merah',
      jenisKendaraan: 'MOTOR',
      status: 'TERSEDIA',
      tanggalPajakBerakhir: new Date('2024-12-20'),
      tanggalSTNKBerakhir: new Date('2024-12-20'),
    },
  })

  // Create Maintenance Requests
  await prisma.maintenanceRequest.createMany({
    data: [
      {
        judul: 'Perbaikan AC Ruang Rapat',
        lokasi: 'Lantai 2 - Ruang Rapat',
        kategori: 'AC',
        deskripsi: 'AC tidak dingin, perlu pengecekan freon',
        prioritas: 'HIGH',
        status: 'PROSES',
        pemohon: 'Siti Rahayu',
        pelaksana: 'Tim Teknisi',
        biaya: 500000,
      },
      {
        judul: 'Penggantian Lampu Lobby',
        lokasi: 'Lobby Utama',
        kategori: 'LISTRIK',
        deskripsi: 'Beberapa lampu lobby mati',
        prioritas: 'NORMAL',
        status: 'PENDING',
        pemohon: 'Ahmad Fauzi',
      },
    ],
  })

  // Create Utilitas
  await prisma.utilitas.createMany({
    data: [
      {
        jenis: 'LISTRIK',
        bulan: 1,
        tahun: 2024,
        tagihan: 5500000,
        penggunaan: 2750,
        satuan: 'kWh',
        statusBayar: 'SUDAH',
        tanggalBayar: new Date('2024-02-05'),
      },
      {
        jenis: 'AIR',
        bulan: 1,
        tahun: 2024,
        tagihan: 800000,
        penggunaan: 120,
        satuan: 'm3',
        statusBayar: 'SUDAH',
        tanggalBayar: new Date('2024-02-08'),
      },
      {
        jenis: 'INTERNET',
        bulan: 1,
        tahun: 2024,
        tagihan: 2000000,
        statusBayar: 'SUDAH',
        tanggalBayar: new Date('2024-01-20'),
      },
      {
        jenis: 'LISTRIK',
        bulan: 2,
        tahun: 2024,
        tagihan: 5800000,
        penggunaan: 2900,
        satuan: 'kWh',
        statusBayar: 'BELUM',
      },
    ],
  })

  // Create Perawatan Kendaraan
  await prisma.perawatanKendaraan.createMany({
    data: [
      {
        kendaraanId: kendaraan1.id,
        tanggal: new Date('2024-01-15'),
        jenisPerawatan: 'SERVICE_RUTIN',
        deskripsi: 'Service 10.000 km',
        biaya: 750000,
        bengkel: 'Auto2000',
        kmServis: 10000,
        kmServisBerikutnya: 20000,
        status: 'SELESAI',
      },
      {
        kendaraanId: kendaraan1.id,
        tanggal: new Date('2024-07-15'),
        jenisPerawatan: 'SERVICE_RUTIN',
        deskripsi: 'Service 20.000 km',
        biaya: 850000,
        bengkel: 'Auto2000',
        kmServis: 20000,
        kmServisBerikutnya: 30000,
        status: 'TERJADWAL',
      },
    ],
  })

  // Create Pembayaran Pajak
  await prisma.pembayaranPajak.createMany({
    data: [
      {
        kendaraanId: kendaraan1.id,
        jenisPajak: 'PKB',
        tahun: 2024,
        tanggalJatuhTempo: new Date('2025-08-15'),
        jumlah: 3500000,
        status: 'BELUM',
      },
      {
        kendaraanId: kendaraan2.id,
        jenisPajak: 'PKB',
        tahun: 2024,
        tanggalJatuhTempo: new Date('2024-12-20'),
        jumlah: 800000,
        status: 'BELUM',
      },
    ],
  })

  // Create Notifikasi
  await prisma.notifikasi.createMany({
    data: [
      {
        judul: 'Kontrak Akan Berakhir',
        pesan: 'Kontrak karyawan Siti Rahayu akan berakhir pada 31 Desember 2024',
        tipe: 'KONTRAK',
        status: 'BELUM_DIBACA',
        targetId: karyawan2.id,
      },
      {
        judul: 'Jadwal Servis Kendaraan',
        pesan: 'Kendaraan B 1234 ABC jadwal service di bulan Juli 2024',
        tipe: 'SERVIS',
        status: 'BELUM_DIBACA',
        targetId: kendaraan1.id,
      },
      {
        judul: 'Pajak Kendaraan Jatuh Tempo',
        pesan: 'Pajak kendaraan B 5678 DEF akan jatuh tempo 20 Desember 2024',
        tipe: 'PAJAK',
        status: 'BELUM_DIBACA',
        targetId: kendaraan2.id,
      },
    ],
  })

  // Create Audit Log
  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        aksi: 'LOGIN',
        modul: 'AUTH',
        detail: 'Admin berhasil login',
        ipAddress: '127.0.0.1',
      },
      {
        userId: admin.id,
        aksi: 'CREATE',
        modul: 'KARYAWAN',
        detail: 'Menambah karyawan baru: Budi Santoso',
        ipAddress: '127.0.0.1',
      },
    ],
  })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
