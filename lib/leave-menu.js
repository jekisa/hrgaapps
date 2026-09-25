const ADMIN_LEAVE_MENU = [
  { label: 'Daftar Pengajuan', href: '/cuti/kelola' },
  { label: 'Kelola Jenis Cuti', href: '/cuti/jenis' },
  { label: 'Rekap Cuti Karyawan', href: '/cuti/rekap' },
]

const STAFF_LEAVE_MENU = [
  { label: 'Ringkasan Cuti', href: '/cuti/saya' },
  { label: 'Ajukan Cuti', href: '/cuti/saya/ajukan' },
  { label: 'Riwayat Pengajuan', href: '/cuti/saya/riwayat' },
]

function getLeaveMenuItems(role) {
  return role === 'ADMIN' ? ADMIN_LEAVE_MENU : STAFF_LEAVE_MENU
}

function getLeavePendingTile(role, stats = {}) {
  if (role !== 'ADMIN') return null
  return { label: 'Pengajuan Cuti Pending', href: '/cuti/kelola', value: stats.leavePending || 0 }
}

module.exports = { ADMIN_LEAVE_MENU, STAFF_LEAVE_MENU, getLeaveMenuItems, getLeavePendingTile }
