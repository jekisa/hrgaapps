const LEAVE_STATUS_TEXT = {
  pending: 'menunggu persetujuan',
  approved: 'disetujui',
  rejected: 'ditolak',
}

function toIsoString(value) {
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function buildStaffDashboardPayload({
  annualBalance,
  annualLeaveTypeName,
  employeeProfile,
  activeReminderCount = 0,
  unreadNotificationCount = 0,
  latestLeaveRequest,
  birthdayEvent,
  reminderEvents = [],
  leaveRequests = [],
  totalDaysAbsent = 0,
}) {
  const quota = Number(annualBalance?.quota || 0)
  const used = Number(annualBalance?.used || 0)
  const calendarEvents = [birthdayEvent, ...reminderEvents]
    .filter((event) => event && ['ulangTahun', 'reminder'].includes(event.type))

  const activities = leaveRequests
    .map((request) => {
      const statusText = LEAVE_STATUS_TEXT[request.status]
      const occurredAt = toIsoString(request.reviewedAt || request.updatedAt || request.createdAt)
      if (!statusText || !occurredAt) return null
      const leaveTypeName = request.leaveTypeId?.name || 'cuti'
      return {
        id: String(request._id || request.id),
        type: 'cuti',
        status: request.status,
        label: `Pengajuan cuti ${leaveTypeName} Anda ${statusText}`,
        occurredAt,
        href: '/cuti/saya/ajukan',
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
    .slice(0, 5)

  return {
    employee: employeeProfile ? {
      name: String(employeeProfile.nama || ''),
      position: String(employeeProfile.jabatan || ''),
    } : null,
    stats: {
      leaveBalanceRemaining: quota - Number(annualBalance?.carriedDebt || 0) - used + Number(annualBalance?.adminAdjustment || 0),
      leaveBalanceType: annualLeaveTypeName || 'Cuti Tahunan',
      activeReminderCount: Number(activeReminderCount || 0),
      unreadNotificationCount: Number(unreadNotificationCount || 0),
      latestLeaveStatus: latestLeaveRequest?.status || '-',
      totalDaysAbsent: Number(totalDaysAbsent || 0),
    },
    calendarEvents,
    activities,
  }
}

module.exports = { buildStaffDashboardPayload }
