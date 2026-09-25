const EXCLUDED_CODES = new Set(['sick', 'unpaid'])
const EXCLUDED_NAMES = new Set(['cuti sakit', 'izin tidak dibayar'])

function getStaffSelectableLeaveTypes(types = []) {
  return types.filter((type) => {
    const code = String(type?.code || '').trim().toLowerCase()
    const name = String(type?.name || '').trim().toLowerCase()
    return !EXCLUDED_CODES.has(code) && !EXCLUDED_NAMES.has(name)
  })
}

module.exports = { getStaffSelectableLeaveTypes }
