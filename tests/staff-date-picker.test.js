const test = require('node:test')
const assert = require('node:assert/strict')
const { getCalendarDays } = require('../lib/staff-date-picker')
test('calendar is Monday-first, six weeks, and includes leap day', () => {
  const days = getCalendarDays(2024, 1)
  assert.equal(days.length, 42)
  assert.equal(days[0].date.getDay(), 1)
  assert.ok(days.some(({ date, inCurrentMonth }) => inCurrentMonth && date.getDate() === 29))
})
test('calendar crosses year boundaries using local dates', () => {
  assert.ok(getCalendarDays(2025, 11).some(({ date }) => date.getFullYear() === 2026 && date.getMonth() === 0))
})
