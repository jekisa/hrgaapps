function getStaffGreeting(hour) {
  const parsed = Number(hour)
  const safeHour = Number.isFinite(parsed) ? Math.min(23, Math.max(0, parsed)) : 0
  if (safeHour < 11) return 'Selamat Pagi'
  if (safeHour < 15) return 'Selamat Siang'
  if (safeHour < 18) return 'Selamat Sore'
  return 'Selamat Malam'
}

function getLeaveBalanceProgress(remaining, quota) {
  const q = Number(quota)
  const r = Number(remaining)
  const safeQuota = Number.isFinite(q) ? Math.max(0, q) : 0
  const safeRemaining = Math.min(safeQuota, Number.isFinite(r) ? Math.max(0, r) : 0)
  const used = safeQuota - safeRemaining
  const remainingPercent = safeQuota ? Math.round(safeRemaining / safeQuota * 100) : 0
  return { quota: safeQuota, remaining: safeRemaining, used, remainingPercent, usedPercent: safeQuota ? 100 - remainingPercent : 0 }
}

module.exports = { getStaffGreeting, getLeaveBalanceProgress }
