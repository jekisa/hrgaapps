# HRGA Apps

Human Resources & General Affairs Management System

## Cara Menjalankan

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
```bash
# Buat tabel database
npm run db:push

# Isi data awal (seed)
npm run db:seed
```

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

## Teknologi
- **Framework**: Next.js 14 (App Router)
- **Database**: SQLite (via Prisma ORM)
- **Auth**: NextAuth.js
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Forms**: React Hook Form
