const { startOfWeek, addDays } = require('date-fns')
function getCalendarDays(year, month) {
  const start = startOfWeek(new Date(year, month, 1), { weekStartsOn: 1 })
  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(start, index)
    return { date, inCurrentMonth: date.getMonth() === month }
  })
}
module.exports = { getCalendarDays }
