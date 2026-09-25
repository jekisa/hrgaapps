const test = require('node:test')
const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const path = require('node:path')
const { buildStaffDashboardPayload } = require('../lib/staff-dashboard')
const { getEmployeeForSession } = require('../lib/leave-auth')

test('builds four personal dashboard cards, own event categories, and factual leave activities', () => {
  const payload = buildStaffDashboardPayload({
    annualBalance: { quota: 12, used: 5 },
    annualLeaveTypeName: 'Cuti Tahunan',
    activeReminderCount: 3,
    unreadNotificationCount: 2,
    latestLeaveRequest: { status: 'approved' },
    birthdayEvent: { date: '2026-10-20', type: 'ulangTahun', label: 'Ulang tahun Anda' },
    reminderEvents: [
      { date: '2026-10-03', type: 'reminder', label: 'Reminder saya' },
      { date: '2026-10-04', type: 'pajak', label: 'Do not expose' },
    ],
    leaveRequests: [{
      _id: 'request-1',
      status: 'approved',
      leaveTypeId: { name: 'Cuti Tahunan' },
      createdAt: '2026-09-10T08:00:00.000Z',
      reviewedAt: '2026-09-11T09:30:00.000Z',
    }],
  })

  assert.deepEqual(payload.stats, {
    leaveBalanceRemaining: 7,
    leaveBalanceType: 'Cuti Tahunan',
    activeReminderCount: 3,
    unreadNotificationCount: 2,
    latestLeaveStatus: 'approved',
  })
  assert.deepEqual(payload.calendarEvents.map((event) => event.type), ['ulangTahun', 'reminder'])
  assert.deepEqual(payload.activities, [{
    id: 'request-1',
    type: 'cuti',
    status: 'approved',
    label: 'Pengajuan cuti Cuti Tahunan Anda disetujui',
    occurredAt: '2026-09-11T09:30:00.000Z',
    href: '/cuti/saya/ajukan',
  }])
  assert.equal('charts' in payload, false)
  assert.equal('totalKaryawan' in payload.stats, false)
})

test('uses dash for no latest leave request and keeps leave activity timestamps real', () => {
  const payload = buildStaffDashboardPayload({
    annualBalance: null,
    annualLeaveTypeName: null,
    activeReminderCount: 0,
    unreadNotificationCount: 0,
    latestLeaveRequest: null,
    birthdayEvent: null,
    reminderEvents: [],
    leaveRequests: [],
  })

  assert.equal(payload.stats.latestLeaveStatus, '-')
  assert.equal(payload.stats.leaveBalanceRemaining, 0)
  assert.deepEqual(payload.activities, [])
})

test('dashboard STAFF resolves its employee and handles a missing mapping before company queries', () => {
  const route = readFileSync(path.resolve(process.cwd(), 'app/api/dashboard/route.js'), 'utf8')
  const getHandler = route.indexOf('export async function GET')
  const staffBranch = route.indexOf("if (session.user.role === 'STAFF')", getHandler)
  const missingEmployee = route.indexOf('Profil karyawan belum terhubung')
  const companyQuery = route.indexOf('Karyawan.countDocuments', staffBranch)

  assert.notEqual(staffBranch, -1)
  assert.ok(missingEmployee > staffBranch && missingEmployee < companyQuery)
  assert.match(route.slice(staffBranch, companyQuery), /status:\s*422/)
})

test('maps one employee by normalized email without loading every employee email', async () => {
  let employeeQuery
  const employee = { _id: 'employee-7' }
  const result = await getEmployeeForSession({ user: { id: 'user-3' } }, {
    dbConnect: async () => {},
    User: {
      findById: () => ({ select: () => ({ lean: async () => ({ email: ' Staff@Example.com ' }) }) }),
    },
    Karyawan: {
      findOne: (query) => {
        employeeQuery = query
        return { select: () => ({ lean: async () => employee }) }
      },
    },
  })

  assert.deepEqual(employeeQuery, { email: { $regex: '^\\s*staff@example\\.com\\s*$', $options: 'i' } })
  assert.equal(result, employee)
})

test('staff dashboard renders only personal actions and widgets, with a real upload anchor', () => {
  const page = readFileSync(path.resolve(process.cwd(), 'app/(dashboard)/page.js'), 'utf8')
  const form = readFileSync(path.resolve(process.cwd(), 'app/(dashboard)/cuti/saya/ajukan/page.js'), 'utf8')
  const start = page.indexOf('function StaffDashboard')
  assert.ok(start !== -1)
  const staffView = page.slice(start)

  assert.match(page, /if\s*\(!isAdmin\)\s*return\s*<StaffDashboard/)
  assert.match(page, /if\s*\(!response\.ok\)/)
  assert.match(staffView, /Ajukan Cuti/)
  assert.match(staffView, /Upload Surat Dokter/)
  assert.match(staffView, /\/cuti\/saya\/ajukan#lampiran/)
  assert.match(staffView, /Sisa Cuti Tahun Ini/)
  assert.doesNotMatch(staffView, /Reminder Saya|activeReminderCount/)
  assert.match(staffView, /Notifikasi/)
  assert.match(staffView, /Status Pengajuan Cuti Terakhir/)
  assert.match(staffView, /visibleEventTypes/)
  assert.match(staffView, /event\.type === 'ulangTahun'/)
  for (const companyWidget of ['EmployeeTrend', 'ContractStatus', 'InsightPanel', 'AssetDistribution', 'FloatingActions']) {
    assert.equal(staffView.includes(companyWidget), false, `${companyWidget} must not render for STAFF`)
  }
  assert.match(form, /id="lampiran"/)
})
