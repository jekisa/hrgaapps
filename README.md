# HRGA Apps

Human Resources & General Affairs Management System

## Cara Menjalankan

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
```bash
# Isi data awal ke MongoDB sesuai MONGODB_URI di .env.local
npm run db:seed

# Seed jenis dan saldo cuti ke MongoDB
npm run db:seed:leave
```

The app uses MongoDB through Mongoose. Make sure `.env.local` contains a valid
`MONGODB_URI` before running the seed command.

### 3. Jalankan Aplikasi
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Akun Login Demo
| Role  | Email                  | Password  |
|-------|------------------------|-----------|
| Admin | admin@hrgaapps.com     | admin123  |
| Staff | staff@hrgaapps.com     | staff123  |

## Fitur

### Modul
1. **Manajemen Karyawan** - Data master, biodata, riwayat jabatan, status kontrak
2. **Manajemen Aset** - Inventaris, peminjaman aset
3. **Gedung & Fasilitas** - Maintenance request, utilitas (listrik, air, internet, AC)
4. **Manajemen Kendaraan** - Jadwal pemakaian, log perjalanan, perawatan, pajak

### Fitur Umum
- Dashboard ringkasan dengan chart dan statistik
- Notifikasi & reminder (kontrak habis, jadwal servis, pajak)
- Role & permission (Admin dan Staff)
- Laporan & export (CSV/Excel)
- Audit trail (log aktivitas pengguna)
- Mobile-friendly

### Manajemen Cuti

Modul Manajemen Cuti memakai akun User yang dibuat ADMIN. STAFF dipetakan ke
data Karyawan berdasarkan email yang sama pada `User.email` dan
`Karyawan.email`; pastikan kedua email cocok agar menu Cuti Saya dapat digunakan.

Seed cuti menggunakan `.env.local`, membuat enam jenis cuti default, dan
menyiapkan saldo tahun berjalan tanpa menimpa saldo yang sudah terpakai.

## Teknologi
- **Framework**: Next.js 14 (App Router)
- **Database**: SQLite (via Prisma ORM)
- **Auth**: NextAuth.js
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Forms**: React Hook Form
