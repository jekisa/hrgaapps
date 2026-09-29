# Surat Dokter untuk Cuti Sakit — Spesifikasi Desain

## Tujuan

Tambahkan alur verifikasi surat dokter yang terpisah dari persetujuan pengajuan cuti, sambil memastikan cuti sakit yang disetujui tidak mengurangi saldo cuti tahunan. Hari sakit yang telah disetujui tetap dihitung sebagai hari tidak masuk kerja.

## Kondisi dan pola codebase

- `LeaveRequest` menyimpan pengajuan, rentang tanggal, total hari kerja, lampiran, dan status persetujuan.
- `LeaveType.requiresAttachment` sudah mengharuskan lampiran untuk sakit di form dan API.
- API review saat ini memeriksa saldo dan menaikkan `LeaveBalance.used` untuk setiap jenis cuti; kebijakan pemotongan kuota perlu dibuat kondisional.
- File lampiran disimpan di `public/uploads/cuti` dan dapat dibuka melalui URL statis.
- Notifikasi admin bersifat global bagi role ADMIN, tetapi model/notifikasi UI belum memiliki tautan tujuan.
- Dashboard staf saat ini tidak menampilkan kartu “Total Hari Tidak Masuk Kerja”; fitur ini perlu menambahkannya.

## Desain yang dipilih

### 1. Schema dan migrasi

Tambahkan `LeaveType.deductsQuota` bertipe Boolean dengan default `true`. Untuk jenis `code: 'sick'`, nilai selalu `false`; validator API dan data seeder menjaga kebijakan ini. Halaman Kelola Jenis Cuti menampilkan nilai kebijakan tersebut dan dapat mengaturnya untuk jenis non-sakit, sedangkan jenis sakit tidak dapat diubah menjadi pemotong kuota.

Tambahkan ke `LeaveRequest`:

- metadata opsional `doctorName`, `certificateNumber`, dan `additionalNotes`;
- `verificationStatus` bernilai `pending`, `verified`, atau `rejected`, terpisah dari `status` pengajuan;
- `verifiedBy` mengacu ke `Karyawan`, `verifiedAt`, dan `verificationNote`.

API menetapkan verifikasi `pending` untuk permintaan cuti sakit dan menyimpan metadata hanya bila tipe yang dipilih berkode `sick`. Untuk jenis lain, metadata dan status verifikasi disimpan kosong/null. Metadata dokter tetap opsional; lampiran adalah satu-satunya field tambahan yang wajib untuk cuti sakit. Pengajuan sakit historis yang belum memiliki status verifikasi diperlakukan sebagai `pending` pada API/UI, tanpa menulis ulang dokumen historis.

Seeder migrasi idempoten mengisi `deductsQuota: true` untuk jenis lama yang belum memiliki nilai dan menetapkan jenis `sick` ke `false`. Tidak ada pengajuan, saldo, atau jenis cuti yang dihapus/ditulis ulang.

### 2. Kebijakan kuota dan total hari absen

Saat menyetujui pengajuan:

- Jika `deductsQuota !== false`, jalankan pemeriksaan saldo yang ada dan tambahkan `totalDays` ke `LeaveBalance.used` dalam transaksi.
- Jika `deductsQuota === false`, lewati pemeriksaan saldo dan seluruh mutasi `LeaveBalance`; status pengajuan dan audit tetap diproses seperti biasa.

Buat helper `getTotalDaysAbsent(employeeId, year)` yang menjumlahkan hari kerja dari semua `LeaveRequest` berstatus `approved`, tanpa memandang jenis cuti. Rentang lintas tahun dialokasikan per hari kerja ke tahun kalender `Asia/Jakarta` yang sesuai; aturan hari kerja tetap mengikuti helper aplikasi yang mengecualikan Sabtu/Minggu.

Kartu statistik personal baru di dashboard staf memakai helper ini. API rekap admin mengembalikan agregat hari absen per karyawan dan jumlah surat sakit berstatus verifikasi pending, melalui agregasi server-side (bukan pemfilteran di browser). Angka ini terpisah dari `LeaveBalance.used` dan sisa kuota.

### 3. Verifikasi surat dokter khusus admin

Tambahkan menu admin “Surat Dokter” menuju `/cuti/surat-dokter`. Halaman menampilkan tabel berfilter tanggal, karyawan, dan status verifikasi. API GET hanya mengambil `LeaveRequest` dengan jenis cuti berkode `sick`, serta populate karyawan dan jenis cuti.

Lampiran gambar ditampilkan sebagai thumbnail yang membuka file asli pada tab baru; PDF memakai ikon dokumen dan tautan tab baru. Tidak ada mekanisme force-download.

Endpoint PATCH hanya mengubah status verifikasi. Endpoint mengizinkan transisi hanya dari `pending` ke `verified`/`rejected`; penolakan memerlukan catatan. Setiap transisi mengisi `verifiedAt` dan karyawan admin yang dipetakan dari email sesi. Jika admin tidak terpetakan ke dokumen `Karyawan`, endpoint mengembalikan 422 agar identitas verifier tidak hilang. Persetujuan cuti utama tidak disentuh. Halaman dan endpoint sama-sama membatasi akses ke ADMIN.

### 4. Form staf dan notifikasi

Saat memilih jenis `sick`, form menampilkan nama dokter/klinik, nomor surat, catatan tambahan (semuanya opsional), lampiran wajib, dan info bahwa cuti sakit tidak memotong jatah tahunan. API memvalidasi ulang jenis cuti dan lampiran; field metadata dari klien tidak dipercaya untuk tipe lain.

Saat pengajuan sakit dengan lampiran disimpan, buat satu notifikasi global untuk admin dengan pesan “[Nama Staff] mengunggah surat dokter untuk verifikasi” dan tautan `/cuti/surat-dokter`. Tambahkan field tautan opsional pada model notifikasi dan jadikan judul/pesan notifikasi dengan tautan dapat diklik, tanpa mengubah notifikasi yang sudah ada.

### 5. Rekap dan ekspor

Setiap kartu karyawan menampilkan total hari absen tahunan di luar breakdown saldo, serta badge bila ada surat dokter yang menunggu verifikasi. Detail pengajuan dan jenis cuti sakit tetap tersedia di Daftar Pengajuan. Sisa tahunan tetap hanya berasal dari saldo jenis cuti yang memotong kuota. Ekspor saldo cuti yang ada tidak diubah kecuali penambahan kolom total hari absen dianggap perlu; desain ini membatasi perubahan ekspor agar fokus pada kebutuhan tampilan rekap.

## Keputusan, asumsi, dan batasan

- Hanya lampiran wajib untuk jenis sakit; metadata dokter tidak wajib, sesuai instruksi form yang menyebutkan semuanya opsional.
- Tahun statistik memakai hari kalender Jakarta; pengajuan lintas tahun dibagi berdasarkan hari kerja yang jatuh pada masing-masing tahun.
- `verifiedBy` tetap mengacu ke `Karyawan` sebagaimana diminta; verifikasi mensyaratkan admin memiliki pasangan karyawan berdasarkan email.
- Tidak ada perubahan pada status approval/rejection utama saat memverifikasi surat dokter.
- Tidak ada perubahan terhadap saldo atau pengajuan historis akibat migrasi. Pengajuan sakit historis tanpa `verificationStatus` diperlakukan sebagai `pending`; persetujuan sakit di masa mendatang tidak mengubah `used`.

## Error handling dan keamanan

- Tolak metadata lampiran sakit bila tidak ada attachment, baik di UI maupun API.
- Tolak status verifikasi yang tidak dikenal, transisi ulang dari status final, dan penolakan tanpa alasan.
- Semua endpoint verifikasi mensyaratkan sesi dan role ADMIN; route halaman memakai guard role yang sama.
- Query statistik, pending verification, dan daftar Surat Dokter dibatasi di database menurut karyawan/tahun/status sebelum dikirim ke browser.
- Notifikasi dokter tidak menampilkan metadata medis tambahan; hanya nama pengunggah dan tautan ke halaman admin.

## Strategi pengujian

- Persetujuan sakit: status berubah, `LeaveBalance.used` tetap, hari absen bertambah.
- Persetujuan cuti tahunan: `used` bertambah seperti sebelumnya.
- Pengajuan sakit tanpa lampiran ditolak server-side; metadata sakit opsional dan tidak bocor ke jenis lain.
- Verifikasi mengisi verifier/timestamp tanpa mengubah status approval; penolakan tanpa catatan ditolak.
- Filter Surat Dokter untuk rentang tanggal, karyawan, dan status mengembalikan hasil yang tepat; akses non-admin ditolak.
- Migrasi `deductsQuota` dry-run/idempoten tidak menghapus atau mereset data lain.
- Agregat hari absen, pembagian rentang lintas tahun, badge surat pending di rekap, dan tautan notifikasi diuji.

