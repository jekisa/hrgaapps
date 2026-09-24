# Manajemen Cuti Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Membangun modul Manajemen Cuti end-to-end untuk ADMIN dan STAFF dengan model Mongoose, API terotorisasi, upload lampiran, notifikasi, dashboard widget, halaman UI, dan export rekap.

**Architecture:** Pertahankan Next.js App Router dan route handler yang sudah ada. Tambahkan model Mongoose terpisah untuk cuti, helper server untuk session/role dan pemetaan STAFF berdasarkan email User–Karyawan, lalu bangun UI dengan DataTable, Modal, PageHeader, Badge, React Query, React Hook Form, dan gaya Tailwind yang sudah dipakai.

**Tech Stack:** Next.js 16 App Router, React 19, NextAuth JWT, Mongoose 9, MongoDB, React Query, React Hook Form, lucide-react, xlsx, node:test, dan storage lokal existing di public/uploads.

**Spec:** docs/superpowers/specs/2026-09-24-manajemen-cuti-design.md

## Global Constraints

- Akun STAFF dibuat ADMIN melalui modul pengguna; tidak ada registrasi mandiri.
- Pemetaan User–Karyawan menggunakan email yang sama setelah trim/lowercase; jangan menambahkan userId ke Karyawan.
- Query STAFF selalu dibatasi employeeId yang ditemukan server dari session; jangan percaya employeeId dari client.
- Hari cuti inklusif dan hanya mengecualikan Sabtu/Minggu.
- Pengajuan yang overlap dengan pengajuan pending atau approved milik karyawan yang sama harus ditolak.
- Pengajuan yang melampaui saldo boleh disubmit, tetapi UI wajib menampilkan peringatan merah.
- Approve hanya boleh menambah LeaveBalance.used sekali; reject tidak mengubah saldo.
- Attachment hanya PDF/JPG/JPEG/PNG, maksimal 5 MB, dan disimpan melalui storage lokal existing.
- Semua label UI menggunakan bahasa Indonesia dan mengikuti warna status existing.
- Mutasi penting harus memakai createAuditLog dan error API tidak membocorkan detail database.
- Perubahan hanya boleh menyentuh file fitur; perubahan .next dan perubahan kerja existing lain harus dibiarkan.

## Review Focus

- Email User tidak punya pasangan Karyawan: endpoint STAFF harus menghasilkan 422, bukan data kosong atau akses semua karyawan. Test pada Task 1.
- Approve dipanggil dua kali atau bersamaan: saldo hanya berubah sekali. Test pada Task 3.
- Rentang tanggal hanya weekend dan batas tanggal lokal: total hari harus benar tanpa pergeseran timezone. Test pada Task 1.
- Upload file dengan MIME palsu, ekstensi tidak didukung, atau ukuran lebih dari 5 MB: request ditolak sebelum file disimpan. Test pada Task 3.
- STAFF mengirim employeeId milik orang lain: server mengabaikannya dan memakai employeeId dari mapping session. Test pada Task 2 dan Task 3.

## File Map

Create:

- models/LeaveType.js — schema jenis cuti.
- models/LeaveBalance.js — schema saldo dan unique index.
- models/LeaveRequest.js — schema pengajuan dan query indexes.
- lib/leave-auth.js — session, role guard, dan mapping email ke Karyawan.
- lib/leave-utils.js — hari kerja, overlap, saldo, dan normalisasi input.
- lib/leave-storage.js — validasi dan penyimpanan attachment.
- app/api/cuti/jenis/route.js — GET/POST jenis cuti.
- app/api/cuti/jenis/[id]/route.js — PATCH/DELETE jenis cuti.
- app/api/cuti/saldo/route.js — saldo STAFF/ADMIN.
- app/api/cuti/pengajuan/route.js — GET/POST pengajuan.
- app/api/cuti/pengajuan/[id]/route.js — PATCH review status.
- app/api/cuti/rekap/route.js — rekap dan XLSX.
- app/api/cuti/upload/route.js — upload attachment.
- app/(dashboard)/cuti/kelola/page.js — daftar pengajuan ADMIN.
- app/(dashboard)/cuti/jenis/page.js — CRUD jenis cuti ADMIN.
- app/(dashboard)/cuti/rekap/page.js — rekap saldo ADMIN.
- app/(dashboard)/cuti/saya/page.js — ringkasan STAFF.
- app/(dashboard)/cuti/saya/ajukan/page.js — form pengajuan STAFF.
- app/(dashboard)/cuti/saya/riwayat/page.js — riwayat STAFF.
- tests/leave-utils.test.js — unit test domain helper.
- tests/leave-api-contract.test.js — contract-level test untuk role dan payload.

Modify:

- components/layout/Sidebar.js — menu ADMIN/STAFF dan icon cuti.
- app/(dashboard)/page.js — pending leave widget untuk ADMIN.
- app/api/dashboard/route.js — statistik leavePending.
- package.json — script test:leave bila belum ada runner test.
- README.md — dokumentasi seed dan mapping email.

### Task 1: Domain models, mapping auth, dan pure business rules

Files:

- Create: models/LeaveType.js
- Create: models/LeaveBalance.js
- Create: models/LeaveRequest.js
- Create: lib/leave-auth.js
- Create: lib/leave-utils.js
- Create: tests/leave-utils.test.js
- Modify: package.json

Interfaces:

- lib/leave-auth.js menyediakan requireSession(request), requireRole(request, role), dan getEmployeeForSession(session).
- lib/leave-utils.js menyediakan countBusinessDays(startDate, endDate), rangesOverlap(startA, endA, startB, endB), normalizeEmail(email), dan getRemainingBalance(balance).
- Model mengekspor default Mongoose models bernama LeaveType, LeaveBalance, dan LeaveRequest.

- [ ] Step 1: Tulis failing test domain.

~~~js
import test from 'node:test'
import assert from 'node:assert/strict'
import { countBusinessDays, rangesOverlap, normalizeEmail } from '../lib/leave-utils.js'

test('counts inclusive weekdays and excludes Saturday and Sunday', () => {
  assert.equal(countBusinessDays('2026-09-24', '2026-09-28'), 3)
  assert.equal(countBusinessDays('2026-09-26', '2026-09-27'), 0)
})

test('rejects an inverted date range', () => {
  assert.throws(() => countBusinessDays('2026-09-29', '2026-09-28'), /Tanggal selesai/)
})

test('detects inclusive range overlap', () => {
  assert.equal(rangesOverlap('2026-09-24', '2026-09-26', '2026-09-26', '2026-09-28'), true)
  assert.equal(rangesOverlap('2026-09-24', '2026-09-25', '2026-09-26', '2026-09-28'), false)
})

test('normalizes mapping emails', () => {
  assert.equal(normalizeEmail('  Staff@Example.COM '), 'staff@example.com')
})
~~~

- [ ] Step 2: Jalankan node --test tests/leave-utils.test.js dan pastikan gagal karena helper belum ada.
- [ ] Step 3: Implementasikan helper memakai parsing tanggal lokal dari bagian YYYY-MM-DD, iterasi satu hari, skip getDay 0 dan 6, serta error Tanggal selesai tidak boleh sebelum tanggal mulai. Ranges overlap bersifat inclusive.
- [ ] Step 4: Tambahkan tiga schema Mongoose memakai field pada spec, ref Karyawan, enum status pending/approved/rejected, timestamps, dan index berikut:

~~~js
leaveBalanceSchema.index({ employeeId: 1, leaveTypeId: 1, year: 1 }, { unique: true })
leaveRequestSchema.index({ employeeId: 1, startDate: 1, endDate: 1 })
leaveRequestSchema.index({ status: 1, startDate: 1 })
leaveRequestSchema.index({ employeeId: 1, createdAt: -1 })
~~~

- [ ] Step 5: Implementasikan requireSession dengan getServerSession(authOptions), requireRole untuk role ADMIN, dan getEmployeeForSession yang mengambil User dari session.user.id lalu mencari Karyawan berdasarkan email ter-normalisasi. Jangan menerima employeeId dari caller.
- [ ] Step 6: Jalankan node --test tests/leave-utils.test.js dan tambahkan script package.json: test:leave = node --test tests/leave-utils.test.js tests/leave-api-contract.test.js.
- [ ] Step 7: Commit:

~~~bash
git add models/LeaveType.js models/LeaveBalance.js models/LeaveRequest.js lib/leave-auth.js lib/leave-utils.js tests/leave-utils.test.js package.json
git commit -m "feat: add leave management domain models"
~~~

### Task 2: Leave type, balance, dan request read/create APIs

Files:

- Create: app/api/cuti/jenis/route.js
- Create: app/api/cuti/jenis/[id]/route.js
- Create: app/api/cuti/saldo/route.js
- Create: app/api/cuti/pengajuan/route.js
- Create: tests/leave-api-contract.test.js

Interfaces:

- GET /api/cuti/jenis returns { data }; ADMIN receives active and inactive types, STAFF only active types.
- POST /api/cuti/jenis accepts code, name, defaultQuotaPerYear, requiresAttachment, isActive and returns 201.
- GET /api/cuti/saldo?year=YYYY&employeeId=... returns { data, year }; employeeId is honored only for ADMIN.
- GET /api/cuti/pengajuan returns pagination plus populated employee and leave type fields.
- POST /api/cuti/pengajuan accepts leaveTypeId, startDate, endDate, reason, attachmentUrl and creates pending status.

- [ ] Step 1: Tulis contract tests untuk session 401, role 403, mapping email 422, filter invalid 422, dan pastikan employeeId STAFF selalu berasal dari server.
- [ ] Step 2: Jalankan npm run test:leave dan pastikan contract test gagal sebelum route/helper tersedia.
- [ ] Step 3: Implementasikan GET/POST jenis dan PATCH/DELETE jenis/[id]. Validasi code slug lowercase, nama wajib, quota integer non-negatif, dan tolak delete bila sudah dipakai LeaveRequest.
- [ ] Step 4: Implementasikan saldo dengan findOneAndUpdate upsert dan $setOnInsert quota/default used 0. STAFF hanya menerima saldo Karyawan hasil mapping; ADMIN menerima semua saldo dengan nama Karyawan dan jenis cuti.
- [ ] Step 5: Implementasikan GET pengajuan dengan page, limit, status, employeeId, leaveTypeId, from, to; populate nama Karyawan dan nama LeaveType; query STAFF selalu dioverride employeeId mapped.
- [ ] Step 6: Implementasikan POST pengajuan: load jenis aktif, map STAFF, hitung hari kerja, tolak zero-day, cek overlap status pending/approved, wajibkan attachment sesuai jenis, buat pending, buat Notifikasi, dan abaikan employeeId/status/used/reviewer dari body.
- [ ] Step 7: Jalankan npm run test:leave dan npm run lint. Manual cek ADMIN melihat semua data, STAFF hanya data sendiri, dan employeeId palsu tidak mengubah hasil.
- [ ] Step 8: Commit:

~~~bash
git add app/api/cuti/jenis app/api/cuti/saldo app/api/cuti/pengajuan tests/leave-api-contract.test.js
git commit -m "feat: add leave type balance and request APIs"
~~~

### Task 3: Review transitions, upload, notification, dan export API

Files:

- Create: app/api/cuti/pengajuan/[id]/route.js
- Create: app/api/cuti/upload/route.js
- Create: app/api/cuti/rekap/route.js
- Create: lib/leave-storage.js
- Modify: tests/leave-utils.test.js

Interfaces:

- PATCH /api/cuti/pengajuan/[id] accepts status approved/rejected and reviewNote.
- POST /api/cuti/upload accepts multipart field file and returns attachmentUrl, fileName, size, mimeType.
- GET /api/cuti/rekap?year=YYYY&format=json|xlsx returns JSON or XLSX binary.

- [ ] Step 1: Tambahkan failing tests untuk reject tanpa note, approve pending menambah used sekali, approve kedua tidak menambah used, MIME palsu, extension tidak didukung, file di atas 5 MB, dan batas tepat 5 MB.
- [ ] Step 2: Jalankan node --test tests/leave-utils.test.js dan pastikan case baru gagal.
- [ ] Step 3: Implementasikan storage di public/uploads/cuti dengan UUID filename, validasi extension dan MIME PDF/JPG/JPEG/PNG, batas 5 MB, mkdir recursive, dan URL /uploads/cuti/...; jangan pakai nama file client sebagai path.
- [ ] Step 4: Implementasikan PATCH approval menggunakan filter status pending. Approve mengubah request sekali lalu $inc LeaveBalance.used. Jika database mendukung session transaction, bungkus request dan balance; bila tidak, gunakan guard compare-and-set dan jalur kompensasi/log saat update saldo gagal. Reject tidak menyentuh saldo dan wajib reviewNote.
- [ ] Step 5: Buat Notifikasi untuk pemilik pengajuan dan createAuditLog(session.user.id, UPDATE, CUTI, detail, getIpAddress(request)).
- [ ] Step 6: Implementasikan rekap agregasi tahun berjalan, hitung sisa, dan export XLSX memakai XLSX.utils.json_to_sheet, book_new, book_append_sheet, dan XLSX.write type buffer. Header harus Nama Karyawan, Jenis Cuti, Kuota, Terpakai, Sisa, Tahun.
- [ ] Step 7: Jalankan npm run test:leave, npm run lint, npm run build; cek file upload valid, invalid tidak tersimpan, approval idempotent, dan workbook bisa dibuka.
- [ ] Step 8: Commit:

~~~bash
git add app/api/cuti/pengajuan/[id] app/api/cuti/upload app/api/cuti/rekap lib/leave-storage.js tests/leave-utils.test.js
git commit -m "feat: add leave review upload and export APIs"
~~~

### Task 4: Admin navigation, pages, dan dashboard widget

Files:

- Create: app/(dashboard)/cuti/kelola/page.js
- Create: app/(dashboard)/cuti/jenis/page.js
- Create: app/(dashboard)/cuti/rekap/page.js
- Modify: components/layout/Sidebar.js
- Modify: app/api/dashboard/route.js
- Modify: app/(dashboard)/page.js

- [ ] Step 1: Tambahkan count LeaveRequest pending ke dashboard response sebagai stats.leavePending, hanya untuk ADMIN; tambahkan assertion contract.
- [ ] Step 2: Tambahkan CalendarDays dan menu ADMIN Manajemen Cuti dengan Daftar Pengajuan, Kelola Jenis Cuti, Rekap Cuti Karyawan; tambahkan menu STAFF Cuti Saya dengan Ringkasan, Ajukan, Riwayat. Pertahankan collapsed/mobile behavior.
- [ ] Step 3: Bangun halaman kelola memakai PageHeader, filter status/jenis/tanggal, DataTable, Badge, Modal reviewNote, aksi approve/reject, link attachment, toast, dan invalidate React Query.
- [ ] Step 4: Bangun CRUD jenis memakai Modal dan react-hook-form untuk code, nama, quota, requiresAttachment, aktif/nonaktif.
- [ ] Step 5: Bangun rekap memakai year/employee/type filters, DataTable, totals, dan tombol download blob dari API XLSX.
- [ ] Step 6: Tambahkan AlertTile berlabel Pengajuan Cuti Pending di dashboard ADMIN yang link ke /cuti/kelola.
- [ ] Step 7: Jalankan npm run lint dan npm run build; verifikasi seluruh alur ADMIN secara manual.
- [ ] Step 8: Commit:

~~~bash
git add components/layout/Sidebar.js app/api/dashboard/route.js app/(dashboard)/page.js app/(dashboard)/cuti
git commit -m "feat: add admin leave management UI"
~~~

### Task 5: STAFF pages dan leave submission workflow

Files:

- Create: app/(dashboard)/cuti/saya/page.js
- Create: app/(dashboard)/cuti/saya/ajukan/page.js
- Create: app/(dashboard)/cuti/saya/riwayat/page.js

- [ ] Step 1: Bangun ringkasan dengan kartu Sisa Cuti Tahunan, Cuti Terpakai Tahun Ini, Total Hari Tidak Masuk, serta status pengajuan terbaru.
- [ ] Step 2: Bangun form react-hook-form: dropdown jenis aktif, tanggal mulai/selesai, alasan, file PDF/JPG/JPEG/PNG; hitung hari kerja client-side, tampilkan warning zero-day dan over-quota, wajibkan file sesuai requiresAttachment.
- [ ] Step 3: Upload via FormData ke /api/cuti/upload lalu POST hanya leaveTypeId, startDate, endDate, reason, attachmentUrl. Setelah sukses toast dan arahkan ke /cuti/saya/riwayat; tampilkan error overlap/mapping/validasi.
- [ ] Step 4: Bangun riwayat dengan date range, jenis, total hari, timeline pending → approved/rejected, link attachment, dan reviewer note.
- [ ] Step 5: Jalankan npm run lint dan npm run build; verifikasi privacy, required attachment, weekend, over-quota, overlap, dan mapping email dengan akun STAFF.
- [ ] Step 6: Commit:

~~~bash
git add app/(dashboard)/cuti/saya
git commit -m "feat: add staff leave request UI"
~~~

### Task 6: Seed data, end-to-end verification, dan handoff

Files:

- Modify: Seedleavemanagement .js atau pindahkan logikanya ke scripts/seedLeaveManagement.js setelah memastikan convention.
- Modify: README.md.
- Modify: tests/leave-utils.test.js bila ditemukan regresi.

- [ ] Step 1: Dokumentasikan seed dengan pemuatan .env.local, pertahankan upsert enam LeaveType, inisialisasi saldo Karyawan, dan jangan mengubah used yang sudah ada. Jangan menghapus script lama sebelum logiknya dipindahkan.
- [ ] Step 2: Jalankan npm run test:leave, npm run lint, npm run build, dan command seed yang terdokumentasi. Semua harus exit 0.
- [ ] Step 3: Verifikasi matrix role pada setiap route dan direct URL: STAFF tidak bisa melihat employee lain, approve/reject, rekap, atau mutasi jenis.
- [ ] Step 4: Verifikasi desktop/mobile dan satu flow end-to-end: ADMIN membuat jenis → STAFF submit → ADMIN approve → STAFF melihat status approved dan saldo berubah.
- [ ] Step 5: Jalankan git status --short dan pastikan perubahan .next serta perubahan existing lain tidak staged; jalankan git diff --cached --check; commit hanya feature work.
- [ ] Step 6: Handoff dengan daftar route, hasil test/build/seed, aturan mapping email, dan batasan perhitungan hanya weekend.

## Self-review checklist

- Spec coverage: seluruh model, auth mapping, API, UI ADMIN/STAFF, upload, notification, dashboard, export, seed, dan testing dipetakan ke Task 1–6.
- Placeholder scan: tidak ada unfinished marker atau instruksi kosong; setiap langkah menyebut file, behavior, command, atau payload konkret.
- Type/contract consistency: nama model, helper, route, field, status, query parameter, dan response yang dipakai lintas task konsisten.
- Existing changes safety: plan tidak meminta reset, checkout, atau penghapusan perubahan .next/unrelated.
- Execution boundary: implementasi belum dimulai; executor wajib memakai executing-plans atau subagent-driven-development setelah plan disetujui.
