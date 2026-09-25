function getVisibleSidebarItems(role, adminItems, staffItems) {
  if (role === 'ADMIN') return adminItems
  if (role === 'STAFF') return staffItems
  return []
}

module.exports = { getVisibleSidebarItems }
