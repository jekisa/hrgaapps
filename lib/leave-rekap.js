const CRITICAL_THRESHOLD_PERCENT = 0.2
const CRITICAL_THRESHOLD_DAYS = 2
const SMALL_LEAVE_QUOTA_DAYS = 3

function filterActiveLeaveBalanceRows(rows = []) {
  return rows.filter((row) => row.employeeIsActive === true)
}

function groupLeaveBalanceRows(rows = []) {
  const employees = new Map()

  for (const row of rows) {
    const employeeId = String(row.employeeId ?? '')
    if (!employeeId) continue

    let employee = employees.get(employeeId)
    if (!employee) {
      employee = {
        employeeId,
        employeeName: row.employeeName || 'Tanpa Nama',
        employeeEmail: row.employeeEmail || '',
        employeeGender: row.employeeGender || null,
        employeePhoto: row.employeePhoto || null,
        leaveBalances: [],
      }
      employees.set(employeeId, employee)
    }

    employee.leaveBalances.push({
      leaveTypeId: String(row.leaveTypeId ?? ''),
      leaveType: row.leaveType || 'Tanpa Jenis',
      leaveTypeCode: row.leaveTypeCode || '',
      quota: Number(row.quota) || 0,
      used: Number(row.used) || 0,
      carriedDebt: Number(row.carriedDebt) || 0,
      adminAdjustment: Number(row.adminAdjustment) || 0,
      allowDebt: row.allowDebt === true,
      remaining: Number(row.remaining) || 0,
    })
  }

  return [...employees.values()]
}

function getBalanceDisplay(value) {
  const remaining = Number(value) || 0
  return {
    value: `${remaining} hari`,
    label: remaining < 0 ? 'Hutang cuti' : 'Sisa',
    tone: remaining < 0 ? 'danger' : 'normal',
  }
}

function getRelevantLeaveTypes(employee, leaveTypes = []) {
  if (employee?.employeeGender !== 'L') return leaveTypes
  return leaveTypes.filter((type) => {
    const code = String(type.leaveTypeCode || type.code || '').toLowerCase()
    const name = String(type.leaveType || type.name || '').toLocaleLowerCase('id-ID')
    return code !== 'maternity' && !name.includes('melahirkan')
  })
}

function isCriticalBalance(balance) {
  const quota = Number(balance.quota) || 0
  const remaining = Math.max(Number(balance.remaining) || 0, 0)
  if (quota <= 0 || remaining >= quota) return false

  if (balance.leaveTypeCode === 'annual') {
    return remaining <= quota * CRITICAL_THRESHOLD_PERCENT || remaining <= CRITICAL_THRESHOLD_DAYS
  }

  return quota <= SMALL_LEAVE_QUOTA_DAYS && remaining <= CRITICAL_THRESHOLD_DAYS
}

function isCriticalEmployee(employee) {
  return (employee.leaveBalances || []).some(isCriticalBalance)
}

function sortLeaveEmployees(employees = []) {
  return [...employees].sort((a, b) => {
    const debtOrder = Number((b.leaveBalances || []).some((balance) => balance.remaining < 0)) - Number((a.leaveBalances || []).some((balance) => balance.remaining < 0))
    if (debtOrder) return debtOrder
    const criticalOrder = Number(isCriticalEmployee(b)) - Number(isCriticalEmployee(a))
    return criticalOrder || String(a.employeeName || '').localeCompare(String(b.employeeName || ''), 'id')
  })
}

module.exports = {
  CRITICAL_THRESHOLD_PERCENT,
  CRITICAL_THRESHOLD_DAYS,
  filterActiveLeaveBalanceRows,
  groupLeaveBalanceRows,
  getBalanceDisplay,
  getRelevantLeaveTypes,
  isCriticalEmployee,
  hasDebt: (employee) => (employee.leaveBalances || []).some((balance) => balance.remaining < 0),
  sortLeaveEmployees,
}
