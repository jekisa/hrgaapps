const test = require('node:test')
const assert = require('node:assert/strict')
const { filterActiveLeaveBalanceRows, getBalanceDisplay, groupLeaveBalanceRows, getRelevantLeaveTypes, hasDebt, isCriticalEmployee, sortLeaveEmployees } = require('../lib/leave-rekap')

test('filters inactive employees from the display rows without mutating export rows', () => {
  const rows = [
    { employeeId: 'active', employeeName: 'Ani', employeeIsActive: true },
    { employeeId: 'inactive', employeeName: 'Budi', employeeIsActive: false },
    { employeeId: 'unknown', employeeName: 'Cici' },
  ]

  assert.deepEqual(filterActiveLeaveBalanceRows(rows), [rows[0]])
  assert.equal(rows.length, 3)
})

test('groups balance rows by employee without dropping any leave type', () => {
  const rows = [
    { employeeId: 'e1', employeeName: 'Budi', employeeGender: 'L', leaveTypeId: 'annual', leaveType: 'Cuti Tahunan', leaveTypeCode: 'annual', quota: 12, used: 10, remaining: 2 },
    { employeeId: 'e1', employeeName: 'Budi', employeeGender: 'L', leaveTypeId: 'marriage', leaveType: 'Cuti Menikah', leaveTypeCode: 'marriage', quota: 2, used: 0, remaining: 2 },
    { employeeId: 'e2', employeeName: 'Ani', employeeGender: 'P', leaveTypeId: 'annual', leaveType: 'Cuti Tahunan', leaveTypeCode: 'annual', quota: 12, used: 0, remaining: 12 },
  ]

  assert.deepEqual(groupLeaveBalanceRows(rows).map((employee) => [employee.employeeId, employee.leaveBalances.length]), [['e1', 2], ['e2', 1]])
})

test('hides maternity leave only for employees recorded as male', () => {
  const types = [
    { leaveTypeId: 'annual', leaveType: 'Cuti Tahunan', leaveTypeCode: 'annual' },
    { leaveTypeId: 'maternity', leaveType: 'Cuti Melahirkan', leaveTypeCode: 'maternity' },
  ]

  assert.deepEqual(getRelevantLeaveTypes({ employeeGender: 'L' }, types).map((type) => type.leaveTypeId), ['annual'])
  assert.deepEqual(getRelevantLeaveTypes({ employeeGender: 'P' }, types).map((type) => type.leaveTypeId), ['annual', 'maternity'])
  assert.deepEqual(getRelevantLeaveTypes({ employeeGender: null }, types).map((type) => type.leaveTypeId), ['annual', 'maternity'])
})

test('marks low annual balances and depleted small leave quotas as critical, but not unused small quotas', () => {
  assert.equal(isCriticalEmployee({ leaveBalances: [{ leaveTypeCode: 'annual', quota: 10, remaining: 2 }] }), true)
  assert.equal(isCriticalEmployee({ leaveBalances: [{ leaveTypeCode: 'marriage', quota: 3, remaining: 2 }] }), true)
  assert.equal(isCriticalEmployee({ leaveBalances: [{ leaveTypeCode: 'bereavement', quota: 2, remaining: 2 }] }), false)
  assert.equal(isCriticalEmployee({ leaveBalances: [{ leaveTypeCode: 'annual', quota: 10, remaining: 3 }] }), false)
})

test('sorts critical employees first and all employees alphabetically within each group', () => {
  const employees = [
    { employeeName: 'Zaki', leaveBalances: [{ leaveTypeCode: 'annual', quota: 10, remaining: 10 }] },
    { employeeName: 'Budi', leaveBalances: [{ leaveTypeCode: 'annual', quota: 10, remaining: 2 }] },
    { employeeName: 'Ani', leaveBalances: [{ leaveTypeCode: 'annual', quota: 10, remaining: 8 }] },
  ]

  assert.deepEqual(sortLeaveEmployees(employees).map((employee) => employee.employeeName), ['Budi', 'Ani', 'Zaki'])
})

test('preserves negative remaining balances and sorts debt ahead of low-but-positive balances', () => {
  const employees = groupLeaveBalanceRows([
    { employeeId: 'a', employeeName: 'Ani', leaveType: 'Tahunan', quota: 12, used: 10, remaining: 2 },
    { employeeId: 'z', employeeName: 'Zaki', leaveType: 'Tahunan', quota: 12, used: 13, carriedDebt: 1, remaining: -2 },
  ])
  assert.equal(employees[1].leaveBalances[0].remaining, -2)
  assert.equal(employees[1].leaveBalances[0].carriedDebt, 1)
  assert.equal(hasDebt(employees[1]), true)
  assert.deepEqual(sortLeaveEmployees(employees).map((employee) => employee.employeeName), ['Zaki', 'Ani'])
})

test('labels negative remaining balances as debt with a danger tone', () => {
  assert.deepEqual(getBalanceDisplay(-3), { value: '-3 hari', label: 'Hutang cuti', tone: 'danger' })
  assert.deepEqual(getBalanceDisplay(4), { value: '4 hari', label: 'Sisa', tone: 'normal' })
})

test('balance editor close handler references its active mutation', () => {
  const source = require('node:fs').readFileSync(require('node:path').resolve(__dirname, '../components/cuti/LeaveBalanceCard.js'), 'utf8')
  assert.match(source, /onClose=\{\(\) => \{ if \(!updateBalance\.isPending\) setEditingBalance\(null\) \}\}/)
  assert.doesNotMatch(source, /updateQuota/)
})
