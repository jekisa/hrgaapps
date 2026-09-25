# STAFF Access and Personal Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restrict STAFF to personal HRGA data and present a personal dashboard while preserving ADMIN access and dashboard behavior.

**Architecture:** Keep one `/api/dashboard` endpoint with an early STAFF branch that maps the session User to Karyawan and executes only self-scoped queries; leave the existing ADMIN branch and payload intact. Reuse a role allow-list helper for page/API guards, and add owner/recipient references so STAFF Reminder and Notifikasi APIs can enforce per-user visibility server-side.

**Tech Stack:** Next.js 16 App Router and proxy, NextAuth, React 19, React Query, Mongoose/MongoDB, Node built-in test runner, existing ESLint and Next build.

**Spec:** `docs/superpowers/specs/2026-09-25-dashboard-staff-access-design.md`

## Global Constraints

- ADMIN tetap menggunakan menu, endpoint, dan dashboard perusahaan yang ada.
- Identitas STAFF dipetakan dengan email User/Karyawan yang dinormalisasi; kegagalan mapping tidak boleh jatuh kembali ke query global.
- Data Reminder/Notifikasi lama tidak dimigrasi atau dihapus; dokumen tanpa pemilik/penerima tidak ditampilkan kepada STAFF.
- Filter kepemilikan berasal dari session server; abaikan ID pemilik yang dikirim client.
- STAFF hanya melihat dashboard personal, event ulang tahun sendiri/Reminder sendiri, dan aktivitas LeaveRequest sendiri.
- API modul karyawan, aset, kendaraan, gedung, dan laporan harus menolak STAFF dengan 403 untuk semua metode.
- Pertahankan perubahan kerja yang sudah ada; jangan stage atau ubah `.next` dan file lain di luar task.

## Review Focus

- Session valid tetapi email STAFF tidak cocok ke Karyawan: dashboard harus gagal secara terkendali dan tidak menjalankan query global. Test di Task 7.
- Staff mengubah `createdBy`, `recipientUserId`, atau ID resource pada body/URL: operasi tetap dibatasi pada pemilik dari session. Test di Task 4.
- Staff meminta Reminder/Notifikasi lama tanpa pemilik/penerima: data tidak boleh bocor; ADMIN tetap melihat data lama. Test di Task 4.
- Prefix mirip tetapi bukan modul terlarang (mis. `/karyawan-bantuan`) dan route dalam nested module: hanya route yang tepat dibatasi. Test di Task 1.
- Salah satu handler API nested luput dari guard: test coverage memastikan semua route dan method dalam daftar ADMIN-only dilindungi. Test di Task 3.

## File Map

Create:

- `lib/access-control.js` — helper pure `requireRole(session, allowedRoles)`, pencocokan prefix STAFF-only untuk proxy, dan `getOwnerScope(role, userId, field)`.
- `lib/dashboard-menu.js` — selector array menu sesuai role untuk diuji tanpa render React.
- `lib/staff-dashboard.js` — pure builder untuk payload STAFF yang bisa diuji tanpa Next/Mongo.
- `tests/access-control.test.js` — kontrak role dan route prefix.
- `tests/staff-dashboard-contract.test.js` — kontrak payload dashboard dan komponen data personal.

Modify:

- `proxy.js` — redirect STAFF dari modul terlarang ke `/`, pertahankan redirect halaman cuti yang sudah ada.
- `lib/leave-auth.js` — delegasikan `assertRole` lama ke helper baru agar aturan 401/403 konsisten tanpa memutus caller.
- `components/layout/Sidebar.js` — pilih array STAFF/Admin sebelum render; STAFF hanya Dashboard, Reminder, Notifikasi, Cuti Saya.
- `app/api/karyawan/route.js`, `app/api/karyawan/[id]/route.js`, `app/api/karyawan/riwayat/route.js`, `app/api/karyawan/[id]/dokumen/route.js`, `app/api/karyawan/[id]/dokumen/[docId]/route.js` — ADMIN-only pada setiap exported handler.
- `app/api/aset/route.js`, `app/api/aset/[id]/route.js`, `app/api/aset/peminjaman/route.js` — ADMIN-only pada setiap exported handler.
- `app/api/kendaraan/route.js`, `app/api/kendaraan/[id]/route.js`, `app/api/kendaraan/jadwal/route.js`, `app/api/kendaraan/log-perjalanan/route.js`, `app/api/kendaraan/pajak/route.js`, `app/api/kendaraan/perawatan/route.js` — ADMIN-only pada setiap exported handler.
- `app/api/gedung/maintenance/route.js`, `app/api/gedung/maintenance/[id]/route.js`, `app/api/gedung/utilitas/route.js` — ADMIN-only on every exported handler.
- `app/api/laporan/aset/route.js`, `app/api/laporan/karyawan/route.js`, `app/api/laporan/kendaraan/route.js`, `app/api/laporan/maintenance/route.js` — ADMIN-only pada setiap exported handler.
- `models/Reminder.js`, `app/api/reminder/route.js` — ownership `createdBy` dan filter/update/delete STAFF.
- `models/Notifikasi.js`, `app/api/notifikasi/route.js`, `app/api/notifikasi/[id]/route.js`, `app/api/cuti/pengajuan/[id]/route.js` — recipient scoping dan notifikasi review ke pemohon.
- `app/api/dashboard/route.js` — early personal STAFF response; jangan mengubah query atau payload jalur ADMIN.
- `app/(dashboard)/page.js` — render komponen/actions berdasarkan role dan konsumsi activities/status personal.
- `app/(dashboard)/cuti/saya/ajukan/page.js` — beri anchor `id="lampiran"` pada field attachment yang sudah ada.
- `tests/leave-api-contract.test.js` — tambah kontrak menu dan cuti bila diperlukan tanpa menghapus test existing.

## Tasks

### Task 1: Role helper dan proteksi halaman melalui proxy

**Files:**

- Create: `lib/access-control.js`, `lib/dashboard-menu.js`
- Create: `tests/access-control.test.js`
- Modify: `lib/leave-auth.js`
- Modify: `proxy.js`

**Interfaces:** `requireRole(session, allowedRoles)` menerima session NextAuth atau `null` dan role string array; mengembalikan `null` saat lolos atau `{ error, status }` dengan 401/403. `getStaffRestrictedRedirect(role, pathname)` mengembalikan `/` hanya untuk STAFF pada prefix terlindungi.

**Interfaces tambahan:** `getVisibleSidebarItems(role, adminItems, staffItems)` memilih satu array menu utuh. `getOwnerScope(role, userId, field)` berada di `lib/access-control.js` dan menghasilkan `{}` untuk ADMIN atau `{ [field]: userId }` untuk STAFF.

- [ ] **Step 1: Tulis test helper yang gagal untuk autentikasi, allow-list, dan batas prefix.** Pastikan ADMIN lolos untuk `['ADMIN']`, STAFF mendapat 403, null mendapat 401; `/karyawan/riwayat` dibatasi namun `/karyawan-bantuan` dan `/dashboard` tidak.
- [ ] **Step 2: Jalankan `node --test tests/access-control.test.js`; pastikan gagal karena helper belum ada.**
- [ ] **Step 3: Implementasikan helper pure dan gunakan dari `leave-auth.assertRole` tanpa mengubah signature lama.** Gunakan role uppercase (`ADMIN`, `STAFF`) yang dipakai session saat ini.

```js
function requireRole(session, allowedRoles) {
  if (!session) return { error: 'Unauthorized', status: 401 }
  if (!allowedRoles.includes(session.user?.role)) return { error: 'Forbidden', status: 403 }
  return null
}
```

- [ ] **Step 4: Tambahkan redirect prefix di `proxy.js`; susun agar `getStaffLeaveRedirect` yang sudah ada tetap mengarahkan route ringkasan/riwayat cuti ke `/cuti/saya/ajukan`.**

```js
const STAFF_RESTRICTED_PREFIXES = ['/karyawan', '/aset', '/kendaraan', '/gedung', '/laporan']
// Cocokkan prefix hanya saat path tepat sama atau diikuti "/".
```
- [ ] **Step 5: Jalankan `node --test tests/access-control.test.js tests/leave-api-contract.test.js`; pastikan test role/redirect lulus.**
- [ ] **Step 6: Commit hanya file Task 1 dengan pesan `feat: add reusable role and route guards`.**

### Task 2: Sidebar role-based tanpa menu ADMIN pada STAFF

**Files:** `lib/dashboard-menu.js`, `components/layout/Sidebar.js`, `tests/leave-api-contract.test.js`.

**Interfaces:** ADMIN memilih `menuItems` lengkap; STAFF memilih array terpisah berisi empat item, dengan Cuti Saya direct link ke `/cuti/saya/ajukan`. `adminMenuItems` hanya dirender ADMIN.

- [ ] **Step 1: Tambahkan test untuk `getVisibleSidebarItems`; assert STAFF memakai empat entry yang diberikan dan ADMIN memakai array admin tanpa memfilter section.**
- [ ] **Step 2: Jalankan `node --test tests/leave-api-contract.test.js`; pastikan test menu baru gagal.**
- [ ] **Step 3: Bentuk `staffMenuItems` terpisah di Sidebar, pilih lewat `getVisibleSidebarItems` sebelum loop, dan render hanya array terpilih. Pertahankan filter `roles` item yang sudah ada untuk konfigurasi ADMIN (misalnya Manajemen Cuti); item terlarang tidak dimasukkan ke array STAFF.**

```js
const staffMenuItems = [dashboardItem, reminderItem, notificationItem, staffLeaveItem]
const visibleMenuItems = isAdmin ? menuItems : staffMenuItems
```
- [ ] **Step 4: Jalankan test kontrak dan `npm run lint -- --no-cache`; cek ADMIN tetap punya semua grup dan STAFF tidak punya grup SDM/Aset/Laporan.**
- [ ] **Step 5: Commit Sidebar dan test Task 2.**

### Task 3: Terapkan guard API ADMIN-only ke semua modul perusahaan

**Files:** seluruh route API karyawan, aset, kendaraan, gedung, dan laporan yang dicantumkan di File Map; `tests/access-control.test.js`.

**Interfaces:** Setiap handler tetap mengambil session seperti sekarang, kemudian memanggil `requireRole(session, ['ADMIN'])` sebelum koneksi/query/mutasi dan mengembalikan `NextResponse.json({ error }, { status })` bila helper mengembalikan error. Jangan mengubah kontrak response ADMIN.

- [ ] **Step 1: Tambahkan `protectedRouteFiles` berisi semua 21 file route pada File Map dan kontrak scanner yang memastikan setiap `export async function METHOD` di file tersebut memuat `requireRole(session, ['ADMIN'])` di body handler itu sendiri.**
- [ ] **Step 2: Jalankan `node --test tests/access-control.test.js`; pastikan scanner gagal pada route/method yang belum guarded.**

```js
for (const source of protectedRouteFiles) {
  const text = readFileSync(source, 'utf8')
  const handlers = [...text.matchAll(/export async function (GET|POST|PUT|PATCH|DELETE)\b/g)]
  assert.ok(handlers.length, `${source} exports a protected method`)
  handlers.forEach((handler, index) => {
    const end = handlers[index + 1]?.index ?? text.length
    assert.match(text.slice(handler.index, end), /requireRole\(session,\s*\['ADMIN'\]\)/)
  })
}
```
- [ ] **Step 3: Lindungi seluruh handler Karyawan, termasuk GET/POST, riwayat, upload dokumen, dan hapus dokumen; pastikan guard ditempatkan sebelum query maupun pembacaan file.**
- [ ] **Step 4: Lindungi seluruh handler Aset termasuk peminjaman, semua handler Kendaraan termasuk jadwal/log/pajak/perawatan, seluruh handler Gedung, dan semua handler Laporan. Hapus guard DELETE khusus yang terduplikasi bila helper baru sudah menggantikannya.**

```js
const session = await getServerSession(authOptions)
const accessError = requireRole(session, ['ADMIN'])
if (accessError) return NextResponse.json({ error: accessError.error }, { status: accessError.status })
// Jalankan dbConnect dan query hanya setelah pemeriksaan role lolos.
```

- [ ] **Step 5: Jalankan kontrak route coverage dan `npm run lint`; cek ADMIN tetap mendapat akses dan STAFF mendapat 403 tanpa query bisnis.**
- [ ] **Step 6: Commit hanya API modul dan test Task 3.**

### Task 4: Kepemilikan Reminder dan Notifikasi

**Files:** `models/Reminder.js`, `models/Notifikasi.js`, `app/api/reminder/route.js`, `app/api/notifikasi/route.js`, `app/api/notifikasi/[id]/route.js`, `app/api/cuti/pengajuan/[id]/route.js`, tests.

**Interfaces:** Reminder memakai `createdBy: ObjectId ref User`; Notifikasi memakai `recipientUserId: ObjectId ref User`. ADMIN tetap global. STAFF GET/filter/status mutation/delete selalu memakai ID User session sebagai bagian query. `getOwnerScope(role, userId, field)` menghasilkan `{}` untuk ADMIN atau filter field/userId untuk STAFF.

- [ ] **Step 1: Tambahkan unit contract tests untuk query scoping helper (atau builder pure di `lib/access-control.js`): query STAFF menyertakan pemilik sesi dan menolak ID pemilik dari input; ADMIN tidak mendapat batas pemilik.**
- [ ] **Step 2: Jalankan `node --test tests/access-control.test.js`; pastikan kontrak ownership baru gagal.**
- [ ] **Step 3: Tambahkan optional ref field pada dua schema. Tidak ada migrasi, backfill, atau perubahan pada dokumen lama.**
- [ ] **Step 4: Batasi Reminder GET, PATCH, DELETE staff ke `createdBy: session.user.id`; set `createdBy` server-side saat POST oleh STAFF. Batasi per-ID lookup sebelum update/delete agar ID pengguna lain merespons 404. ADMIN tetap tidak dibatasi.**
- [ ] **Step 5: Batasi Notification GET, unread/total counts, mark-all-read, PATCH, DELETE STAFF ke `recipientUserId: session.user.id`; ADMIN tetap membaca/mengelola daftar global saat ini.**

```js
const reminderScope = getOwnerScope(session.user.role, session.user.id, 'createdBy')
const reminder = await Reminder.findOne({ _id: body.id, ...reminderScope })
```

- [ ] **Step 6: Pada review cuti, map pemohon `LeaveRequest.employeeId` ke Karyawan lalu User berdasarkan email normalized; set `recipientUserId` pada notifikasi status review. Biarkan notifikasi pengajuan baru untuk admin tanpa penerima STAFF.**
- [ ] **Step 7: Uji dokumen lama tanpa owner tidak terlihat STAFF, User A tidak bisa membaca/mengubah data User B, dan ADMIN tetap melihat data lama serta baru; jalankan `npm test` dan `npm run lint`.**
- [ ] **Step 8: Commit schema, route, helper/test Task 4.**

### Task 5: Dashboard STAFF backend-only personal payload

**Files:** `app/api/dashboard/route.js`, `lib/staff-dashboard.js`, `tests/staff-dashboard-contract.test.js`.

**Interfaces:** `buildStaffDashboardPayload({ annualBalance, activeReminderCount, unreadNotificationCount, latestLeaveRequest, birthdayEvent, reminderEvents, leaveRequests })` returns personal `stats`, `calendarEvents`, and `activities`. ADMIN keeps exact existing response. STAFF receives only `{ dashboardType: 'staff', stats, calendarEvents, activities }`; no `charts` or company-wide counts. Stats fields: `leaveBalanceRemaining`, `leaveBalanceType`, `activeReminderCount`, `unreadNotificationCount`, `latestLeaveStatus`.

- [ ] **Step 1: Tulis unit test untuk `buildStaffDashboardPayload` (empat statistic keys, event types hanya `ulangTahun`/`reminder`, aktivitas dari status cuti) dan assert output tidak punya chart/stat perusahaan. Tambahkan route test/inspection untuk memastikan mapping kosong menghasilkan 422 sebelum query global.**
- [ ] **Step 2: Jalankan `node --test tests/staff-dashboard-contract.test.js`; pastikan test gagal sebelum staff builder/API branch ada.**
- [ ] **Step 3: Di awal dashboard GET, setelah sesi dan DB connect, untuk STAFF map User ke Karyawan menggunakan `getEmployeeForSession`; jika tidak ditemukan, return controlled 422 dan jangan masuk ke query ADMIN.**
- [ ] **Step 4: Temukan LeaveType `code: 'annual'`; upsert hanya LeaveBalance tahun berjalan untuk employeeId sendiri dengan `$setOnInsert: { quota: annualType.defaultQuotaPerYear, used: 0 }`; hitung `sisa = max(quota - used, 0)`. Hitung Reminder `ACTIVE` dengan `createdBy` sesi, unread Notifikasi dengan `recipientUserId` sesi, dan LeaveRequest terbaru dengan employeeId sendiri.**
- [ ] **Step 5: Ambil hanya tanggal lahir karyawan terpetakan dan Reminder aktif miliknya dalam horizon kalender; bentuk `calendarEvents` hanya `ulangTahun` dan `reminder`. Ambil LeaveRequest terbaru miliknya, populate nama jenis cuti, dan bentuk activities dengan status serta timestamp aktual (reviewedAt atau createdAt).**
- [ ] **Step 6: Return payload staff sebelum deklarasi/eksekusi query agregat perusahaan. Jangan mengubah isi jalur ADMIN.**

```js
if (session.user.role === 'STAFF') {
  const employee = await getEmployeeForSession(session, { dbConnect, User, Karyawan })
  if (!employee) return NextResponse.json({ error: 'Profil karyawan belum terhubung' }, { status: 422 })
  const personalPayload = await loadStaffDashboard({ session, employee, now: new Date() })
  return NextResponse.json({ dashboardType: 'staff', ...personalPayload })
}
// Query dashboard global yang sudah ada tetap di bawah branch ini untuk ADMIN.
```
- [ ] **Step 7: Jalankan test dashboard contract, `npm run lint`, dan `npm run build`; review respons STAFF dan ADMIN terhadap kontrak.**
- [ ] **Step 8: Commit endpoint, builder, dan tests Task 5.**

### Task 6: Dashboard STAFF frontend personal

**Files:** `app/(dashboard)/page.js`, `app/(dashboard)/cuti/saya/ajukan/page.js`, `tests/staff-dashboard-contract.test.js`.

- [ ] **Step 1: Tambahkan anchor `id="lampiran"` di field attachment form Ajukan Cuti; verifikasi URL dengan hash mendarat pada field tersebut.**
- [ ] **Step 2: Return cabang PersonalDashboard lebih awal untuk STAFF; biarkan return tree dashboard ADMIN saat ini utuh di bawahnya agar markup dan perilakunya tidak berubah.**
- [ ] **Step 3: Buat tampilan STAFF dengan Quick Actions Ajukan Cuti dan Upload Surat Dokter; tampilkan empat kartu personal dari response Task 5, dengan `-` untuk status kosong.**
- [ ] **Step 4: Render kalender dan event mendatang menggunakan hanya response personal; berikan daftar legend STAFF `ulangTahun`/`reminder`. Render RecentActivity dari activities LeaveRequest dan sembunyikan trend, kontrak, aset, AI Insight, alert perusahaan, dan FloatingActions ADMIN.**

```jsx
if (!isAdmin) return <StaffDashboard data={data} session={session} />
// return JSX dashboard ADMIN yang sudah ada, tanpa mengubah subtree-nya.
```
- [ ] **Step 5: Pastikan error response dashboard tidak berubah menjadi payload kosong sukses di React Query; tampilkan pesan gagal memuat yang sederhana, tanpa mencetak data company.**
- [ ] **Step 6: Jalankan `npm run lint`, `npm run build`, dan test suite; cek manual dashboard kedua role.**
- [ ] **Step 7: Commit hanya halaman dashboard dan form cuti Task 6.**

### Task 7: Matriks akses dan verifikasi akhir

**Files:** `tests/access-control.test.js`, `tests/staff-dashboard-contract.test.js`, tests yang relevan; tidak menambah scope fitur.

- [ ] **Step 1: Jalankan `npm test` dan pastikan seluruh test baru dan test cuti existing lulus.**
- [ ] **Step 2: Jalankan `npm run lint` dan `npm run build`; simpan hasil aktual, jangan mengklaim lolos jika perintah gagal.**
- [ ] **Step 3: Verifikasi manual/HTTP dengan session ADMIN dan STAFF: prefix halaman, satu GET dan satu mutasi tiap modul terlarang, Reminder/Notifikasi silang-user, dashboard, link Quick Actions, dan notifikasi review cuti.**
- [ ] **Step 4: Verifikasi working tree; stage hanya file feature yang direncanakan dan jangan menyertakan `.next` atau perubahan existing. Jalankan `git diff --cached --check`.**
- [ ] **Step 5: Commit test/penyesuaian akhir secara terpisah; laporkan keterbatasan verifikasi manual jika akun/database test tidak tersedia.**

## Self-review

- Spec coverage: route protection, seluruh handler API modul, sidebar, scope Reminder/Notifikasi, backend dashboard payload, kartu/kalender/aktivitas/quick actions, ADMIN unchanged, dan pengujian memiliki task eksplisit.
- Placeholder scan: semua task menyebut file, kontrak, behavior, atau command; tidak ada TBD/TODO atau langkah “tambahkan test” tanpa cakupan yang disebut.
- Type consistency: role uppercase, pemilik `createdBy`, penerima `recipientUserId`, payload `dashboardType: 'staff'`, dan stats memakai nama konsisten.
- Risk inputs: missing employee mapping, forged owner ID, legacy unowned records, near-prefix paths, dan handler nested terlewat dipetakan ke Review Focus serta test task.
- Working-tree safety: setiap commit dibatasi pada path Task terkait; perubahan `.next`/existing tidak boleh ikut staging.
