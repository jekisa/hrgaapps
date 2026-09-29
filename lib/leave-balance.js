function getRemainingBalance(balance = {}) {
  return Number(balance.quota || 0)
    - Number(balance.carriedDebt || 0)
    - Number(balance.used || 0)
    + Number(balance.adminAdjustment || 0)
}

function getCarriedDebt(remaining, allowDebt) {
  return allowDebt ? Math.max(0, -Number(remaining || 0)) : 0
}

function buildBalanceCorrection(balance, newRemaining, allowDebt, reason = '') {
  const nextRemaining = Number(newRemaining)
  const normalizedReason = String(reason || '').trim()
  if (!Number.isInteger(nextRemaining)) throw Object.assign(new RangeError('Saldo harus berupa bilangan bulat'), { status: 422 })
  if (nextRemaining < 0 && !allowDebt) throw Object.assign(new RangeError('Jenis cuti ini tidak mengizinkan saldo minus'), { status: 422 })
  if (nextRemaining < 0 && !normalizedReason) throw Object.assign(new RangeError('Alasan wajib diisi untuk saldo hutang cuti'), { status: 422 })
  const previousRemaining = getRemainingBalance(balance)
  const baseRemaining = Number(balance.quota || 0) - Number(balance.carriedDebt || 0) - Number(balance.used || 0)
  return {
    previousRemaining,
    newRemaining: nextRemaining,
    adminAdjustment: nextRemaining - baseRemaining,
    reason: normalizedReason || null,
  }
}

function buildApprovalBalanceDecision(balance, requestedDays, allowDebt) {
  const projectedRemaining = getRemainingBalance(balance) - Number(requestedDays || 0)
  const requiresDebtConfirmation = allowDebt === true && projectedRemaining < 0
  return {
    projectedRemaining,
    canApprove: allowDebt === true || projectedRemaining >= 0,
    requiresDebtConfirmation,
  }
}

function getJakartaYear(date = new Date()) {
  const year = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jakarta', year: 'numeric' }).format(date)
  return Number(year)
}

function isCronAuthorized(authorization, secret) {
  return Boolean(secret) && authorization === `Bearer ${secret}`
}

function getQuotaForEmployee(leaveType, employee) {
  if (leaveType.code === 'annual' && String(employee.statusKontrak || '').toUpperCase() === 'PROBATION') return 0
  return Number(leaveType.defaultQuotaPerYear || 0)
}

function createRolloverService(repository) {
  return async function rolloverLeaveBalances(targetYear, { employeeId, session } = {}) {
    if (!Number.isInteger(targetYear) || targetYear < 2000 || targetYear > 2100) {
      throw new RangeError('Tahun rollover tidak valid')
    }

    const employees = await repository.listActiveEmployees(employeeId, session)
    const leaveTypes = await repository.listActiveLeaveTypes(session)
    let createdBalances = 0
    let changedBalances = 0
    let carriedDebtBalances = 0
    let carriedDebtDays = 0

    for (const employee of employees) {
      for (const leaveType of leaveTypes) {
        const filter = { employeeId: employee._id, leaveTypeId: leaveType._id, year: targetYear }
        const previous = await repository.findBalance({ ...filter, year: targetYear - 1 }, session)
        const debt = getCarriedDebt(previous ? getRemainingBalance(previous) : 0, leaveType.allowDebt === true)
        const existing = await repository.findBalance(filter, session)

        if (existing) {
          if (Number(existing.carriedDebt || 0) !== debt) {
            await repository.updateCarriedDebt(filter, debt, session)
            changedBalances += 1
          }
        } else {
          const created = await repository.upsertBalanceOnInsert(filter, {
            quota: getQuotaForEmployee(leaveType, employee),
            used: 0,
            carriedDebt: debt,
            adminAdjustment: 0,
          }, session)
          if (created) {
            createdBalances += 1
            changedBalances += 1
          } else if (await repository.updateCarriedDebt(filter, debt, session)) {
            changedBalances += 1
          }
        }

        if (debt > 0) {
          carriedDebtBalances += 1
          carriedDebtDays += debt
        }
      }
    }

    const result = { targetYear, employeesProcessed: employees.length, createdBalances, changedBalances, carriedDebtBalances, carriedDebtDays }
    if (changedBalances > 0) await repository.writeRolloverAudit(result, session)
    return result
  }
}

function createMongooseLeaveBalanceRepository({ Karyawan, LeaveType, LeaveBalance, AuditLog }) {
  const attachSession = (query, session) => session ? query.session(session) : query
  return {
    async listActiveEmployees(employeeId, session) {
      const filter = { statusAktif: true }
      if (employeeId) filter._id = employeeId
      return attachSession(Karyawan.find(filter).select('_id nama statusKontrak'), session).lean()
    },
    async listActiveLeaveTypes(session) {
      return attachSession(LeaveType.find({ isActive: true }).select('_id code defaultQuotaPerYear allowDebt'), session).lean()
    },
    async findBalance(filter, session) {
      return attachSession(LeaveBalance.findOne(filter), session).lean()
    },
    async upsertBalanceOnInsert(filter, values, session) {
      const result = await LeaveBalance.updateOne(filter, { $setOnInsert: values }, { upsert: true, session, setDefaultsOnInsert: true })
      return result.upsertedCount === 1
    },
    async updateCarriedDebt(filter, carriedDebt, session) {
      const result = await LeaveBalance.updateOne(filter, { $set: { carriedDebt } }, { session, runValidators: true })
      return result.modifiedCount > 0
    },
    async writeRolloverAudit(result, session) {
      const detail = `Rollover ${result.targetYear}: ${result.employeesProcessed} karyawan, ${result.createdBalances} saldo baru, ${result.carriedDebtBalances} saldo membawa hutang (${result.carriedDebtDays} hari).`
      const entry = { userId: null, aksi: 'ROLLOVER', modul: 'CUTI', detail }
      if (session) await AuditLog.create([entry], { session })
      else await AuditLog.create(entry)
      console.info(detail)
    },
  }
}

module.exports = {
  createMongooseLeaveBalanceRepository,
  createRolloverService,
  buildApprovalBalanceDecision,
  buildBalanceCorrection,
  getCarriedDebt,
  getJakartaYear,
  isCronAuthorized,
  getQuotaForEmployee,
  getRemainingBalance,
}
