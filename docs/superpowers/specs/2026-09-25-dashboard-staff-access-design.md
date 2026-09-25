# Spesifikasi: Akses STAFF dan Dashboard Personal

## Status

Menunggu review spesifikasi oleh pengguna. Belum ada perubahan kode aplikasi.

## Tujuan dan batasan

Batasi STAFF pada Dashboard, Reminder, Notifikasi, dan pengajuan cuti; cegah akses ke modul operasional perusahaan melalui URL maupun API; dan tampilkan pada dashboard STAFF hanya data personal. ADMIN tetap menggunakan menu, endpoint, dan dashboard perusahaan yang ada. Data lama tidak dihapus atau dimigrasikan.

Identitas karyawan STAFF tetap dipetakan melalui email User dan Karyawan yang dinormalisasi, sesuai helper cuti yang sudah ada. Bila profil STAFF tidak dapat dipetakan, endpoint personal tidak boleh jatuh kembali ke query global.

## Pendekatan yang dipilih

Dashboard tetap memakai satu endpoint `/api/dashboard`, dengan cabang berdasarkan role di server. STAFF menerima payload personal yang dibentuk dari query terscope; ADMIN meneruskan jalur query dan bentuk data dashboard perusahaan yang sekarang. Ini menjaga permintaan frontend tetap sederhana tanpa mengirim data perusahaan ke browser STAFF.

Otorisasi route halaman mengikuti `proxy.js`/NextAuth yang sudah ada. API memakai helper role reusable dengan allow-list role, diterapkan pada setiap handler di modul yang dibatasi. Tidak ada perubahan ke data atau kemampuan ADMIN selain memakai guard yang sama.

## Sidebar dan route halaman

- STAFF menerima konfigurasi menu khusus yang hanya berisi Dashboard (`/`), Reminder (`/reminder`), Notifikasi (`/notifikasi`), dan Cuti Saya (`/cuti/saya/ajukan`). Item modul ADMIN tidak dimasukkan ke array yang dirender STAFF.
- ADMIN tetap menerima seluruh menu saat ini, termasuk grup Manajemen SDM, Manajemen Aset, dan Laporan.
- Akses STAFF ke `/karyawan/**`, `/aset/**`, `/kendaraan/**`, `/gedung/**`, dan `/laporan/**` dialihkan ke `/` (route dashboard aktual aplikasi). Prefix `/gedung/**` mencakup halaman maintenance dan utilitas yang ada.
- Pembatasan cuti STAFF yang sudah ada tetap berlaku: halaman ringkasan dan riwayat diarahkan ke halaman pengajuan.

## Proteksi API

Helper otorisasi yang menerima daftar role mengembalikan kegagalan terstruktur untuk sesi tanpa autentikasi (`401`) atau role yang tidak diizinkan (`403`). Terapkan ADMIN-only pada seluruh handler API karyawan (termasuk riwayat dan dokumen), aset (termasuk peminjaman), kendaraan (jadwal, log perjalanan, pajak, perawatan), gedung (maintenance dan utilitas), serta laporan (karyawan, aset, kendaraan, maintenance). Pengamanan mencakup GET, POST, PUT, PATCH, DELETE dan route detail; guard yang kini hanya ada pada beberapa operasi mutasi tidak cukup.

Endpoint dashboard, Reminder, dan Notifikasi tetap dapat diakses STAFF, tetapi hasil dan mutasinya harus dibatasi ke pemilik/penerima sebagaimana dijelaskan di bawah. API cuti yang sudah dibatasi role tetap mengikuti aturan sebelumnya.

## Kepemilikan Reminder dan Notifikasi

Saat ini Reminder tidak memiliki pemilik dan Notifikasi tidak memiliki penerima. Tambahkan referensi `createdBy` ke User pada Reminder dan `recipientUserId` ke User pada Notifikasi.

- Reminder yang dibuat STAFF diberi `createdBy` dari sesi server (bukan body request). GET STAFF hanya mengembalikan Reminder miliknya; PATCH dan DELETE harus mencari dengan kombinasi ID dan `createdBy`. ADMIN mempertahankan akses global.
- Kartu dan event dashboard menghitung Reminder milik STAFF dengan status `ACTIVE`; event mendatang hanya Reminder aktif milik STAFF.
- Notifikasi hasil review pengajuan cuti ditujukan kepada User pemohon yang dipetakan dari email Karyawan. GET, hitung unread, mark-all-read, PATCH, dan DELETE untuk STAFF dibatasi pada `recipientUserId` sesi. ADMIN mempertahankan daftar global yang ada.
- Notifikasi pengajuan baru yang ditujukan kepada ADMIN tidak memiliki penerima STAFF. Daftar ADMIN tetap global seperti sekarang, sehingga juga dapat memuat notifikasi status cuti yang ditujukan kepada STAFF.
- Dokumen lama tanpa `createdBy`/`recipientUserId` tidak ditampilkan kepada STAFF. Dokumen tidak diubah atau dihapus; tetap berada dalam akses ADMIN.

## Payload dan tampilan Dashboard STAFF

Server menyelesaikan pemetaan User ke Karyawan berdasarkan email sebelum melakukan query personal. Jika sesi bukan STAFF, jalur ADMIN yang sekarang dipertahankan. Jika pemetaan STAFF gagal, kembalikan error terkontrol tanpa menjalankan query atau mengirim payload perusahaan.

Payload STAFF hanya memuat:

- Empat kartu: sisa saldo cuti tahunan tahun berjalan (tipe `annual`), jumlah Reminder `ACTIVE` milik sendiri, jumlah Notifikasi belum dibaca milik sendiri, dan status pengajuan cuti terbaru (`pending`, `approved`, `rejected`, atau `-`).
- Event ulang tahun Karyawan sendiri dan Reminder aktif miliknya, termasuk event mendatang. Tidak memuat kontrak, pajak, jadwal kendaraan, maintenance, atau ulang tahun karyawan lain. Legend kalender hanya Ulang Tahun dan Reminder.
- Aktivitas terbaru dari LeaveRequest milik sendiri, dengan status dan waktu dari data pengajuan/review yang sebenarnya; bukan event kalender sintetis.
- Quick Actions Ajukan Cuti (`/cuti/saya/ajukan`) dan Upload Surat Dokter (`/cuti/saya/ajukan#lampiran`).

UI STAFF tidak merender kartu statistik perusahaan, tren karyawan, status kontrak, distribusi aset, AI Insight, maupun quick actions perusahaan (termasuk floating actions). ADMIN tetap melihat layout dashboard yang ada.

## Error handling dan keamanan data

Endpoint personal mensyaratkan sesi valid dan identitas karyawan yang terhubung. Kegagalan mapping menghasilkan respons terkendali (422 untuk profil belum terhubung); tidak ada fallback ke query tanpa filter. Untuk resource personal yang tidak dimiliki, gunakan 404 agar keberadaan resource pengguna lain tidak terungkap. Validasi role dijalankan sebelum query bisnis pada modul ADMIN-only.

Filter kepemilikan dibangun dari identitas sesi di server; `employeeId`, `createdBy`, atau `recipientUserId` yang dikirim client tidak dipercaya. Dashboard STAFF tidak menyertakan nama, agregat, maupun record milik karyawan lain pada response jaringan.

## Pengujian dan kriteria penerimaan

- Menu STAFF tepat empat item dan tidak merender section atau item ADMIN; menu ADMIN tidak berubah.
- Proxy mengalihkan STAFF dari semua prefix halaman terlarang; ADMIN tetap dapat masuk.
- Seluruh handler pada API modul terlarang merespons 403 untuk STAFF, termasuk operasi baca, dokumen, peminjaman, jadwal, pajak, dan laporan.
- Pengujian Reminder dan Notifikasi memastikan query, pembaruan, dan penghapusan STAFF selalu terscope serta ID milik pengguna lain tidak dapat dibaca atau dimutasi.
- Uji dashboard sebagai STAFF memastikan hanya payload personal yang dikembalikan, termasuk saat employee mapping tidak tersedia; uji ADMIN memastikan payload dan widget existing tetap bekerja.
- Uji status cuti terbaru/aktivitas, saldo annual, reminder aktif, notifikasi unread, ulang tahun sendiri, dan legend kalender.
- Jalankan test suite, lint, dan build yang tersedia; lakukan pemeriksaan manual kedua role bila lingkungan memungkinkan.

## Di luar cakupan

- Migrasi atau penghapusan Reminder/Notifikasi lama.
- Penugasan Reminder oleh ADMIN kepada STAFF; hanya Reminder yang dibuat oleh STAFF menjadi miliknya pada tahap ini.
- Perubahan dashboard atau hak akses ADMIN.
- Perubahan fitur cuti selain pemakaian datanya untuk dashboard dan penerima notifikasi review.
