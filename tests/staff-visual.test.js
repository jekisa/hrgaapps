const test = require('node:test')
const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const path = require('node:path')
const { getStaffGreeting, getLeaveBalanceProgress } = require('../lib/staff-visual')

test('staff greeting follows local hour', () => {
  assert.deepEqual([8, 12, 16, 20].map(getStaffGreeting), ['Selamat Pagi', 'Selamat Siang', 'Selamat Sore', 'Selamat Malam'])
})
test('leave progress clamps values and tolerates missing quota', () => {
  assert.deepEqual(getLeaveBalanceProgress(7, 12), { quota: 12, remaining: 7, debtDays: 0, isDebt: false, used: 5, remainingPercent: 58, usedPercent: 42 })
  assert.equal(getLeaveBalanceProgress(20, 12).remaining, 12)
  assert.deepEqual(getLeaveBalanceProgress(-2, 12), { quota: 12, remaining: -2, debtDays: 2, isDebt: true, used: 12, remainingPercent: 0, usedPercent: 100 })
  assert.equal(getLeaveBalanceProgress(3, 0).usedPercent, 0)
  assert.equal(getLeaveBalanceProgress('bad', Infinity).remainingPercent, 0)
})
test('staff primary styling is scoped; admin token remains untouched', () => {
  const css = readFileSync(path.resolve(__dirname, '../app/globals.css'), 'utf8')
  assert.match(css, /--staff-accent:\s*#B54735/i)
  assert.match(css, /\.staff-theme\s+\.btn-primary/)
  assert.match(css, /@keyframes\s+staff-progress-fill/)
  assert.doesNotMatch(css, /(^|\n)\.btn-primary\s*\{[^}]*staff-accent/s)
})
