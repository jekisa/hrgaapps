function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

function parseLocalDate(value) {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) throw new Error('Tanggal harus berformat YYYY-MM-DD')

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  if (
    date.getFullYear() !== Number(match[1]) ||
    date.getMonth() !== Number(match[2]) - 1 ||
    date.getDate() !== Number(match[3])
  ) {
    throw new Error('Tanggal tidak valid')
  }
  return date
}

function countBusinessDays(startDate, endDate) {
  const start = parseLocalDate(startDate)
  const end = parseLocalDate(endDate)
  if (end < start) throw new Error('Tanggal selesai tidak boleh sebelum tanggal mulai')

  let total = 0
  const cursor = new Date(start)
  while (cursor <= end) {
    const day = cursor.getDay()
    if (day !== 0 && day !== 6) total += 1
    cursor.setDate(cursor.getDate() + 1)
  }
  return total
}

function rangesOverlap(startA, endA, startB, endB) {
  const firstStart = parseLocalDate(startA)
  const firstEnd = parseLocalDate(endA)
  const secondStart = parseLocalDate(startB)
  const secondEnd = parseLocalDate(endB)
  return firstStart <= secondEnd && secondStart <= firstEnd
}

const { getRemainingBalance } = require('./leave-balance')

module.exports = {
  normalizeEmail,
  parseLocalDate,
  countBusinessDays,
  rangesOverlap,
  getRemainingBalance,
}
