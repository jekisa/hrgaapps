# Desain Fitur Hutang Cuti

## Tujuan dan batasan

Hutang cuti mengizinkan saldo negatif hanya untuk jenis cuti yang mengaktifkan `allowDebt` (default hanya `annual`). Hutang tahunan dipotong dari kuota tahun berikutnya; sisa positif tahun lalu hangus. Saldo dan audit historis tetap tersimpan. Semua kalender rollover memakai tahun sipil zona `Asia/Jakarta`.

## Model saldo dan rumus

`LeaveType` mendapat `allowDebt: Boolean` default `false`; data `annual` dimigrasikan menjadi `true`. `LeaveBalance` mendapat `carriedDebt` positif dan `adminAdjustment` bertanda, keduanya default `0`. Tidak menyimpan `remaining`.

Rumus saldo efektif: `remaining = quota - carriedDebt - used + adminAdjustment`. `used` tetap hanya konsumsi dari cuti yang disetujui; koreksi saldo admin tidak mengubah histori pemakaian. `LeaveBalanceAdjustment` menyimpan employee, leave type, year, admin User, saldo sebelum/sesudah, alasan, dan waktu. Admin edit saldo tersimpan atomik bersama saldo dan `AuditLog`.

## Perilaku edit admin dan approval

Admin mengisi target sisa saldo (boleh negatif hanya jika `allowDebt`). Server menghitung `adminAdjustment` yang diperlukan. Jika target negatif, alasan wajib dan UI meminta konfirmasi eksplisit. Perubahan saldo tahun sebelumnya menghitung ulang `carriedDebt` pada saldo tahun berikutnya yang sudah ada; `used`, kuota, dan koreksi saldo tahun berikutnya tidak ditimpa.

Saat approval, server menghitung saldo proyeksi di dalam transaksi. Jika tidak cukup dan `allowDebt` false, approval ditolak. Jika `allowDebt` true dan proyeksi negatif, API meminta konfirmasi tambahan; UI menampilkan jumlah hutang dan retry dengan flag eksplisit. Approval, pemakaian saldo, notifikasi dan audit mengikuti batas konsistensi transaksi yang memungkinkan.

## Rollover tahunan

`rolloverLeaveBalances(targetYear, { employeeId? })` memproses karyawan aktif dan jenis cuti aktif (atau satu karyawan untuk fallback). Untuk setiap pasangan, saldo tahun lalu dihitung dengan rumus efektif. `carriedDebt = max(0, -remaining)` hanya jika `allowDebt`, selain itu nol; quota tahun baru mengikuti kuota default, kecuali cuti tahunan karyawan `PROBATION` yang kuotanya nol; `used` dan `adminAdjustment` dimulai nol.

Saldo target dibuat menggunakan unique key `(employeeId, leaveTypeId, year)` dan `$setOnInsert`, sehingga pemanggilan ulang tidak menimpa saldo yang telah dipakai/diedit. Jika saldo tahun target sudah ada dan saldo tahun sebelumnya dikoreksi, hanya `carriedDebt` target yang dihitung ulang. Setiap job mencatat jumlah karyawan, saldo baru, dan hutang yang diteruskan di log aplikasi serta Audit Trail.

## Cron Vercel dan fallback

Endpoint `GET /api/cron/leave-rollover` memerlukan `Authorization: Bearer $CRON_SECRET`, menghitung tahun Jakarta saat dipanggil, dan menjalankan rollover idempotent. `vercel.json` menjadwalkan `5 17 31 12 *` (31 Desember 17:05 UTC = 1 Januari 00:05 Jakarta). Vercel Cron selalu UTC; `CRON_SECRET` dikirim Vercel sebagai Bearer token ([Cron Jobs](https://vercel.com/docs/cron-jobs), [Securing Cron Jobs](https://vercel.com/docs/cron-jobs/manage-cron-jobs)). Pada paket Hobby waktu pemanggilan dapat bergeser dalam rentang satu jam; presisi per menit tersedia pada Pro ([Usage and Pricing](https://vercel.com/docs/cron-jobs/usage-and-pricing)). Instruksi deployment akan meminta `CRON_SECRET` disetel pada Production lalu redeploy.

Fallback saat saldo tahun berjalan diminta memastikan rollover hanya untuk karyawan terkait; API saldo, dashboard STAFF, dan approval memakai service yang sama agar tahun baru tidak kosong meski cron terlewat.

## Tampilan dan export

Semua kalkulasi sisa berhenti melakukan clamp ke nol. Dashboard STAFF dan progress bar menampilkan hutang sebagai nilai negatif dengan indikator merah tanpa lebar progress negatif. Rekap menampilkan badge hutang dan mengurutkan pegawai berhutang di atas status menipis, merinci hutang bawaan, serta tetap menyertakan semua karyawan aktif sesuai filter yang ada. Excel memiliki kolom `Hutang Bawaan Tahun Lalu` dan nilai negatif pada `Sisa` apa adanya.

## Verifikasi

Tes wajib mencakup: annual dapat negatif; non-debt ditolak; alasan wajib; konfirmasi approval hutang; saldo tahun baru positif lama hangus, debt -3 mengurangi quota, debt -15 dengan quota 12 menghasilkan -3 dan carry 15; rollover dua kali idempotent; koreksi tahun lalu memperbarui carried debt target; zona Asia/Jakarta sekitar pergantian tahun; dashboard, rekap dan Excel mempertahankan nilai negatif. Jalankan seluruh tes, ESLint terarah, `git diff --check`, dan build Next.js.
