const test = require('node:test')
const assert = require('node:assert/strict')
const { validateDoctorVerificationPayload, getVerificationStatus, validateDoctorSickLeaveDates } = require('../lib/doctor-verification')
const { countApprovedAbsenceDays } = require('../lib/leave-absence')
const { mergeDoctorCertificateRows } = require('../lib/doctor-verification')
const { readFileSync } = require('node:fs')
const path = require('node:path')

test('doctor rejection requires a note and only accepts final verification choices', () => {
  assert.throws(() => validateDoctorVerificationPayload({ verificationStatus: 'rejected' }), (error) => error.status === 422)
  assert.deepEqual(validateDoctorVerificationPayload({ verificationStatus: 'verified' }), { verificationStatus: 'verified', verificationNote: null })
  assert.deepEqual(validateDoctorVerificationPayload({ verificationStatus: 'rejected', verificationNote: 'Tidak terbaca' }), { verificationStatus: 'rejected', verificationNote: 'Tidak terbaca' })
  assert.equal(getVerificationStatus({}), 'pending')
})

test('admin verification queue includes standalone uploads as well as sick leave requests', () => {
  const rows = mergeDoctorCertificateRows(
    [{ _id: 'request-1', employeeId: { nama: 'Ayu' }, verificationStatus: 'pending' }],
    [{ _id: 'upload-1', employeeId: { nama: 'Bima' }, attachmentUrl: '/uploads/cuti/surat.pdf', sickStartDate: '2026-09-28T00:00:00.000Z', sickEndDate: '2026-09-29T00:00:00.000Z', createdAt: '2026-09-29T02:00:00Z' }],
  )
  assert.equal(rows.length, 2)
  assert.equal(rows[1].source, 'standalone')
  assert.equal(rows[1].startDate, '2026-09-28T00:00:00.000Z')
  assert.equal(rows[1].endDate, '2026-09-29T00:00:00.000Z')
  assert.equal(rows[1].verificationStatus, 'pending')
})

test('doctor modal upload persists an admin-visible certificate record', () => {
  const uploadRoute = readFileSync(path.resolve(__dirname, '../app/api/cuti/upload/route.js'), 'utf8')
  const modal = readFileSync(path.resolve(__dirname, '../components/cuti/DoctorAttachmentModal.js'), 'utf8')
  assert.match(uploadRoute, /DoctorCertificate\.create/)
  assert.match(uploadRoute, /Notifikasi\.create/)
  assert.match(modal, /purpose', 'doctor-certificate'/)
})

test('counts approved absence days in the requested Jakarta calendar year only', () => {
  assert.equal(countApprovedAbsenceDays([
    { status: 'approved', startDate: '2025-12-31T00:00:00.000Z', endDate: '2026-01-05T00:00:00.000Z' },
    { status: 'pending', startDate: '2026-01-01T00:00:00.000Z', endDate: '2026-01-02T00:00:00.000Z' },
  ], 2026), 3)
})

test('verification API is admin-only and updates verification fields independently of approval status', () => {
  const route = readFileSync(path.resolve(__dirname, '../app/api/cuti/surat-dokter/[id]/route.js'), 'utf8')
  assert.match(route, /assertRole\(session, 'ADMIN'\)/)
  assert.match(route, /verificationStatus: 'pending'/)
  assert.match(route, /verifiedBy: verifier\._id/)
  assert.doesNotMatch(route, /status:\s*payload\.verificationStatus/)
})

test('standalone doctor verification records the admin User without requiring a Karyawan mapping', () => {
  const route = readFileSync(path.resolve(__dirname, '../app/api/cuti/surat-dokter/[id]/route.js'), 'utf8')
  const model = require('../models/DoctorCertificate')
  const standaloneBranch = route.split("searchParams.get('source') === 'standalone'")[1].split("const current = await LeaveRequest")[0]
  assert.doesNotMatch(standaloneBranch, /getEmployeeForSession/)
  assert.match(standaloneBranch, /const verifierId = session\?\.user\?\.id/)
  assert.match(standaloneBranch, /verifiedBy: verifierId/)
  assert.equal(model.schema.path('verifiedBy').options.ref, 'User')
})

test('doctor certificate list scopes sick types and applies employee, date, and verification filters', () => {
  const route = readFileSync(path.resolve(__dirname, '../app/api/cuti/surat-dokter/route.js'), 'utf8')
  assert.match(route, /LeaveType\.findOne\(\{ code: 'sick' \}\)/)
  assert.match(route, /query\.employeeId = searchParams\.get\('employeeId'\)/)
  assert.match(route, /searchParams\.get\('from'\)/)
  assert.match(route, /searchParams\.get\('to'\)/)
  assert.match(route, /query\.\$or = \[\{ verificationStatus: 'pending' \}/)
})

test('request model keeps certificate verification status separate from approval status', () => {
  const LeaveRequest = require('../models/LeaveRequest')
  assert.deepEqual(LeaveRequest.schema.path('verificationStatus').options.enum, ['pending', 'verified', 'rejected', null])
  assert.equal(LeaveRequest.schema.path('verifiedBy').options.ref, 'Karyawan')
  assert.equal(LeaveRequest.schema.path('doctorName').defaultValue, null)
})

test('standalone certificate records belong to an employee and begin pending verification', () => {
  const DoctorCertificate = require('../models/DoctorCertificate')
  assert.equal(DoctorCertificate.schema.path('employeeId').options.ref, 'Karyawan')
  assert.equal(DoctorCertificate.schema.path('verificationStatus').defaultValue, 'pending')
  assert.equal(DoctorCertificate.schema.path('attachmentUrl').isRequired, true)
  assert.equal(DoctorCertificate.schema.path('sickStartDate').isRequired, true)
  assert.equal(DoctorCertificate.schema.path('sickEndDate').isRequired, true)
})

test('standalone doctor upload requires a valid sick-leave date range', () => {
  assert.throws(() => validateDoctorSickLeaveDates({}), (error) => error.status === 422)
  assert.throws(() => validateDoctorSickLeaveDates({ sickStartDate: '2026-02-30', sickEndDate: '2026-03-01' }), (error) => error.status === 422)
  assert.throws(() => validateDoctorSickLeaveDates({ sickStartDate: '2026-09-30', sickEndDate: '2026-09-29' }), (error) => error.status === 422)
  assert.deepEqual(validateDoctorSickLeaveDates({ sickStartDate: '2026-09-28', sickEndDate: '2026-09-29' }), {
    sickStartDate: new Date('2026-09-28T00:00:00.000Z'),
    sickEndDate: new Date('2026-09-29T00:00:00.000Z'),
  })
})

test('standalone certificate rows never substitute upload time for missing sickness dates', () => {
  const rows = mergeDoctorCertificateRows([], [{ _id: 'legacy-upload', createdAt: '2026-09-29T04:00:00.000Z' }])
  assert.equal(rows[0].startDate, null)
  assert.equal(rows[0].endDate, null)
})

test('doctor certificate model refreshes a cached schema that lacks sickness dates', () => {
  const mongoose = require('mongoose')
  const modelPath = require.resolve('../models/DoctorCertificate')
  const previousModel = mongoose.models.DoctorCertificate
  if (previousModel) mongoose.deleteModel('DoctorCertificate')
  mongoose.model('DoctorCertificate', new mongoose.Schema({ attachmentUrl: String }))
  delete require.cache[modelPath]

  try {
    const refreshedModel = require(modelPath)
    assert.equal(refreshedModel.schema.path('sickStartDate').isRequired, true)
    assert.equal(refreshedModel.schema.path('sickEndDate').isRequired, true)
  } finally {
    if (mongoose.models.DoctorCertificate) mongoose.deleteModel('DoctorCertificate')
    if (previousModel) mongoose.model('DoctorCertificate', previousModel.schema)
    delete require.cache[modelPath]
  }
})

test('doctor attachment modal submits required sick dates and API stores them', () => {
  const uploadRoute = readFileSync(path.resolve(__dirname, '../app/api/cuti/upload/route.js'), 'utf8')
  const modal = readFileSync(path.resolve(__dirname, '../components/cuti/DoctorAttachmentModal.js'), 'utf8')
  const model = require('../models/DoctorCertificate')
  assert.match(modal, /name="sickStartDate"[^>]*required/)
  assert.match(modal, /name="sickEndDate"[^>]*required/)
  assert.match(modal, /formData\.append\('sickStartDate'/)
  assert.match(modal, /formData\.append\('sickEndDate'/)
  assert.match(uploadRoute, /validateDoctorSickLeaveDates/)
  assert.match(uploadRoute, /formData\.get\('sickStartDate'\)/)
  assert.match(uploadRoute, /formData\.get\('sickEndDate'\)/)
  assert.equal(model.schema.path('sickStartDate').isRequired, true)
  assert.equal(model.schema.path('sickEndDate').isRequired, true)
})

test('doctor certificate table gives the sick-period column a unique TanStack column id', () => {
  const page = readFileSync(path.resolve(__dirname, '../app/(dashboard)/cuti/surat-dokter/page.js'), 'utf8')
  assert.match(page, /id: 'sickPeriod', header: 'Periode Izin Sakit', accessorKey: 'startDate'/)
})

test('private doctor thumbnails bypass the unauthenticated Next image optimizer', () => {
  const page = readFileSync(path.resolve(__dirname, '../app/(dashboard)/cuti/surat-dokter/page.js'), 'utf8')
  assert.match(page, /from 'next\/image'/)
  assert.match(page, /<Image src={url}[^>]*unoptimized/)
})

test('doctor verification table omits optional doctor and letter detail columns', () => {
  const page = readFileSync(path.resolve(__dirname, '../app/(dashboard)/cuti/surat-dokter/page.js'), 'utf8')
  assert.doesNotMatch(page, /header: 'Dokter\/Klinik'|header: 'Nomor Surat'|header: 'Catatan Tambahan'/)
})
