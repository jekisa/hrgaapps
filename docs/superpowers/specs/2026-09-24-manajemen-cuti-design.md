# Spesifikasi Teknis: Manajemen Cuti

## Status

Draft untuk review pengguna.

## Tujuan

Menambahkan modul Manajemen Cuti ke HRGA Apps untuk dua peran yang sudah ada:

- ADMIN mengelola jenis cuti, pengajuan, saldo, persetujuan, dan rekap.
- STAFF melihat saldo serta mengajukan dan melacak cuti miliknya sendiri.

Aplikasi menggunakan Next.js App Router, API Route Handlers, NextAuth JWT, Mongoose, dan MongoDB. Akun STAFF dibuat oleh ADMIN melalui modul pengguna; tidak ada registrasi mandiri.

## Keputusan arsitektur

### Identitas STAFF

User dan Karyawan dipetakan menggunakan email yang sama, dengan pencocokan case-insensitive setelah normalisasi trim/lowercase:

```text
User.email === Karyawan.email
```

Tidak ada perubahan `userId` pada model `Karyawan`. Helper server akan mengambil session, memastikan role, lalu mencari Karyawan berdasarkan email User. Jika email belum cocok, endpoint STAFF mengembalikan `422` dengan pesan bahwa profil karyawan belum terhubung.

### Penyimpanan

Model baru mengikuti pola CommonJS/ESM model yang sudah ada di `models/` dan memakai koneksi `lib/db.js`:

- `models/LeaveType.js`
- `models/LeaveBalance.js`
- `models/LeaveRequest.js`

Lampiran disimpan mengikuti storage yang sudah tersedia setelah diverifikasi di codebase. Jika belum tersedia, tahap pertama menggunakan endpoint upload lokal yang aman di luar direktori source dan menyimpan URL relatif; implementasi tidak boleh menyimpan file mentah ke MongoDB.

### Otorisasi

Semua endpoint memerlukan `getServerSession(authOptions)`.

- ADMIN-only: CRUD LeaveType, daftar semua pengajuan, approve/reject, rekap, dan export.
- STAFF: jenis cuti aktif, saldo sendiri, membuat pengajuan, dan riwayat sendiri.
- Query STAFF selalu menambahkan `employeeId` hasil pemetaan email server; client tidak boleh menentukan employeeId sendiri.

## Model data

### LeaveType

Field: `code` (unik), `name`, `defaultQuotaPerYear`, `requiresAttachment`, `isActive`, timestamps.

### LeaveBalance

Field: `employeeId` ref `Karyawan`, `leaveTypeId` ref `LeaveType`, `year`, `quota`, `used`, timestamps.

Unique compound index: `(employeeId, leaveTypeId, year)`.

### LeaveRequest

Field: `employeeId` ref `Karyawan`, `leaveTypeId` ref `LeaveType`, `startDate`, `endDate`, `totalDays`, `reason`, `attachmentUrl`, `status`, `reviewedBy` ref `Karyawan`, `reviewedAt`, `reviewNote`, timestamps.

Status yang diizinkan: `pending`, `approved`, `rejected`.

Index yang direncanakan:

- `(employeeId, startDate, endDate)` untuk validasi overlap.
- `(status, startDate)` untuk antrian admin.
- `(employeeId, createdAt)` untuk riwayat STAFF.

## Aturan bisnis

1. Hari cuti dihitung inklusif dari tanggal mulai sampai tanggal selesai, tidak menghitung Sabtu dan Minggu.
2. Tanggal selesai tidak boleh lebih awal daripada tanggal mulai.
3. Pengajuan STAFF yang overlap dengan pengajuan `pending` atau `approved` milik karyawan yang sama ditolak.
4. Jika jenis cuti memerlukan lampiran, attachment wajib ada sebelum submit.
5. Jika total hari melebihi sisa saldo, UI memberi peringatan merah tetapi submit tetap diizinkan untuk direview ADMIN.
6. Saat approve, saldo `used` bertambah sebesar `totalDays`; saat reject, saldo tidak berubah.
7. Endpoint perubahan status harus idempotent dan mencegah approve kedua kali mengurangi/menambah saldo lagi.
8. Review note wajib untuk reject dan opsional untuk approve.
9. Notifikasi dibuat saat pengajuan baru masuk untuk ADMIN dan saat status pengajuan berubah untuk STAFF, mengikuti model `Notifikasi` yang sudah ada.

## API

Route baru mengikuti pola `app/api/**/route.js`:

### `GET/POST /api/cuti/jenis`

- GET: ADMIN melihat semua; STAFF hanya jenis aktif.
- POST: ADMIN membuat LeaveType dengan validasi code/name/quota.

### `PATCH/DELETE /api/cuti/jenis/[id]`

ADMIN memperbarui atau menghapus jenis cuti. Penghapusan sebaiknya ditolak bila sudah dipakai pengajuan; gunakan nonaktifkan sebagai pengganti.

### `GET/POST /api/cuti/pengajuan`

- GET ADMIN: pagination, filter status/employee/leaveType/date range.
- GET STAFF: pengajuan milik Karyawan hasil pemetaan email.
- POST STAFF: validasi tanggal, hari kerja, overlap, jenis aktif, lampiran, lalu membuat status `pending`.

### `PATCH /api/cuti/pengajuan/[id]`

ADMIN mengubah status menjadi approved/rejected dengan transaksi atau mekanisme compare-and-set agar saldo konsisten.

### `GET /api/cuti/saldo`

Saldo tahun berjalan. ADMIN dapat meminta semua karyawan; STAFF hanya saldo sendiri.

### `GET /api/cuti/rekap`

ADMIN-only, tabel saldo tahun berjalan dengan filter employee/leave type dan mode export Excel bila `format=xlsx`.

### `POST /api/cuti/upload`

STAFF-only, menerima PDF/JPG/PNG maksimal 5 MB, memvalidasi MIME dan ukuran, kemudian mengembalikan `attachmentUrl`.

## UI dan navigasi

Sidebar di `components/layout/Sidebar.js` menggunakan icon `CalendarDays`/`CalendarCheck` dari `lucide-react`.

ADMIN:

- Grup Manajemen SDM → Manajemen Cuti
- `/cuti/kelola` Daftar Pengajuan
- `/cuti/jenis` Kelola Jenis Cuti
- `/cuti/rekap` Rekap Cuti Karyawan

STAFF:

- Menu Cuti Saya
- `/cuti/saya` Ringkasan Cuti
- `/cuti/saya/ajukan` Ajukan Cuti
- `/cuti/saya/riwayat` Riwayat Pengajuan

Halaman mengikuti `PageHeader`, `DataTable`, `Modal`, `Badge`, pagination, warna status existing, dan layout dashboard. Tidak membuat primitive UI duplikat bila komponen existing dapat digunakan.

Admin dashboard menampilkan widget jumlah pengajuan `pending` dan tautan ke `/cuti/kelola`.

## Upload dan export

Sebelum implementasi upload, periksa konfigurasi storage existing. Validasi dilakukan di server, nama file dibuat aman, dan URL tidak boleh membuka traversal path. Export memakai dependency `xlsx` yang sudah ada, mengikuti pola laporan existing.

## Error handling dan audit

- `401` untuk session tidak ada.
- `403` untuk role tidak sesuai.
- `422` untuk profil STAFF tidak terhubung atau validasi bisnis.
- `404` untuk resource tidak ditemukan.
- `409` untuk konflik overlap/status atau unique index.
- `500` untuk kegagalan tak terduga tanpa membocorkan detail database.

Mutasi penting memakai `createAuditLog` seperti API Karyawan yang sudah ada.

## Testing dan verifikasi

Minimum:

- Unit test helper hitung hari kerja dan overlap.
- API test untuk role ADMIN/STAFF dan pembatasan employeeId.
- Test transisi approve/reject dan idempotensi saldo.
- Test validasi attachment dan batas 5 MB.
- Lint dan build Next.js.
- Verifikasi manual halaman admin dan STAFF pada desktop/mobile.

## Tahapan implementasi

1. Model, helper auth/employee mapping, dan API jenis cuti.
2. API pengajuan, saldo, approval, notifikasi, dan upload.
3. UI admin dan sidebar role-based.
4. UI STAFF dan dashboard widget.
5. Rekap/export, test, seed data, dan verifikasi end-to-end.

## Di luar cakupan tahap pertama

- Registrasi mandiri atau reset password publik.
- Perhitungan hari libur nasional; hanya weekend yang dikecualikan.
- Integrasi payroll/attendance.
- Perubahan model User/Karyawan selain mapping email.
