function jakartaDateParts(value) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date(value))
  return Object.fromEntries(parts.filter((part) => part.type !== 'literal').map(({ type, value: partValue }) => [type, Number(partValue)]))
}

function countApprovedAbsenceDays(requests = [], year) {
  let total = 0
  for (const request of requests) {
    if (request.status !== 'approved') continue
    const start = new Date(request.startDate)
    const end = new Date(request.endDate)
    for (let day = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate())); day <= end; day.setUTCDate(day.getUTCDate() + 1)) {
      const local = jakartaDateParts(day)
      const weekday = new Date(Date.UTC(local.year, local.month - 1, local.day)).getUTCDay()
      if (local.year === Number(year) && weekday !== 0 && weekday !== 6) total += 1
    }
  }
  return total
}

async function getTotalDaysAbsent(LeaveRequest, employeeId, year) {
  const requests = await LeaveRequest.find({
    employeeId,
    status: 'approved',
    startDate: { $lt: new Date(Date.UTC(Number(year) + 1, 0, 2)) },
    endDate: { $gte: new Date(Date.UTC(Number(year) - 1, 11, 30)) },
  }).select('startDate endDate status').lean()
  return countApprovedAbsenceDays(requests, year)
}

module.exports = { countApprovedAbsenceDays, getTotalDaysAbsent }
