const test = require('node:test')
const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const path = require('node:path')
const { createRolloverService, getJakartaYear, getQuotaForEmployee, getRemainingBalance, isCronAuthorized } = require('../lib/leave-balance')

test('accepts only a configured Vercel bearer secret for cron authorization', () => {
  assert.equal(isCronAuthorized('Bearer secret-value', 'secret-value'), true)
  assert.equal(isCronAuthorized('Bearer wrong', 'secret-value'), false)
  assert.equal(isCronAuthorized('Bearer secret-value', ''), false)
  assert.equal(isCronAuthorized(null, 'secret-value'), false)
})

test('schedules yearly rollover at 00:05 Asia/Jakarta using Vercel UTC cron', () => {
  const config = JSON.parse(readFileSync(path.resolve(process.cwd(), 'vercel.json'), 'utf8'))
  assert.deepEqual(config.crons, [{ path: '/api/cron/leave-rollover', schedule: '5 17 31 12 *' }])
})

function memoryRepository() {
  const employees = [{ _id: 'e1', statusAktif: true, statusKontrak: 'PKWTT' }]
  const types = [
    { _id: 'annual', code: 'annual', defaultQuotaPerYear: 12, allowDebt: true, isActive: true },
    { _id: 'marriage', code: 'marriage', defaultQuotaPerYear: 3, allowDebt: false, isActive: true },
  ]
  const balances = new Map()
  const auditEntries = []
  const repository = {
    listActiveEmployees: async () => employees,
    listActiveLeaveTypes: async () => types,
    findBalance: async (filter) => balances.get(`${filter.employeeId}:${filter.leaveTypeId}:${filter.year}`) || null,
    upsertBalanceOnInsert: async (filter, values) => {
      const key = `${filter.employeeId}:${filter.leaveTypeId}:${filter.year}`
      if (balances.has(key)) return false
      balances.set(key, { ...filter, ...values })
      return true
    },
    updateCarriedDebt: async (filter, carriedDebt) => {
      const row = balances.get(`${filter.employeeId}:${filter.leaveTypeId}:${filter.year}`)
      if (row.carriedDebt === carriedDebt) return false
      row.carriedDebt = carriedDebt
      return true
    },
    writeRolloverAudit: async (entry) => auditEntries.push(entry),
  }
  return { repository, balances, auditEntries }
}

test('uses Jakarta calendar year across the UTC new-year boundary', () => {
  assert.equal(getJakartaYear(new Date('2026-12-31T16:59:59.000Z')), 2026)
  assert.equal(getJakartaYear(new Date('2026-12-31T17:00:00.000Z')), 2027)
})

test('gives probation employees zero annual quota and other employees the configured quota', () => {
  assert.equal(getQuotaForEmployee({ code: 'annual', defaultQuotaPerYear: 12 }, { statusKontrak: 'PROBATION' }), 0)
  assert.equal(getQuotaForEmployee({ code: 'annual', defaultQuotaPerYear: 12 }, { statusKontrak: 'PKWT' }), 12)
})

test('rolls forward full quota after positive balance and carries only annual debt', async () => {
  const { repository, balances } = memoryRepository()
  balances.set('e1:annual:2026', { employeeId: 'e1', leaveTypeId: 'annual', year: 2026, quota: 12, used: 7 })
  balances.set('e1:marriage:2026', { employeeId: 'e1', leaveTypeId: 'marriage', year: 2026, quota: 3, used: 1 })
  const rollover = createRolloverService(repository)

  await rollover(2027)

  assert.equal(getRemainingBalance(balances.get('e1:annual:2027')), 12)
  assert.equal(balances.get('e1:annual:2027').carriedDebt, 0)
  assert.equal(getRemainingBalance(balances.get('e1:marriage:2027')), 3)
})

test('carries annual debt of 3 and preserves debt beyond next-year quota', async () => {
  const { repository, balances } = memoryRepository()
  balances.set('e1:annual:2026', { employeeId: 'e1', leaveTypeId: 'annual', year: 2026, quota: 12, used: 15 })
  const rollover = createRolloverService(repository)

  await rollover(2027)
  assert.equal(balances.get('e1:annual:2027').carriedDebt, 3)
  assert.equal(getRemainingBalance(balances.get('e1:annual:2027')), 9)

  balances.set('e1:annual:2026', { employeeId: 'e1', leaveTypeId: 'annual', year: 2026, quota: 12, used: 27 })
  await rollover(2027)
  assert.equal(balances.get('e1:annual:2027').carriedDebt, 15)
  assert.equal(getRemainingBalance(balances.get('e1:annual:2027')), -3)
})

test('is idempotent and recalculates only carried debt after prior-year correction', async () => {
  const { repository, balances, auditEntries } = memoryRepository()
  balances.set('e1:annual:2026', { employeeId: 'e1', leaveTypeId: 'annual', year: 2026, quota: 12, used: 15 })
  const rollover = createRolloverService(repository)

  await rollover(2027)
  balances.get('e1:annual:2027').used = 4
  balances.get('e1:annual:2027').adminAdjustment = 2
  const second = await rollover(2027)
  assert.equal(second.createdBalances, 0)
  assert.equal(second.changedBalances, 0)
  assert.equal(auditEntries.length, 1)
  assert.equal(balances.get('e1:annual:2027').used, 4)
  assert.equal(balances.get('e1:annual:2027').adminAdjustment, 2)
  assert.equal(balances.get('e1:annual:2027').carriedDebt, 3)

  balances.get('e1:annual:2026').used = 20
  await rollover(2027)
  assert.equal(balances.get('e1:annual:2027').carriedDebt, 8)
  assert.equal(balances.get('e1:annual:2027').used, 4)
  assert.equal(balances.get('e1:annual:2027').adminAdjustment, 2)
  assert.equal(auditEntries.length, 2)
})
