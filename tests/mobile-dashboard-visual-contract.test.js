const test = require('node:test')
const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const path = require('node:path')

const read = (file) => readFileSync(path.resolve(__dirname, '..', file), 'utf8')

test('mobile bottom navigation and menu sheet are mounted from the shared role-aware menu config', () => {
  const sidebar = read('components/layout/Sidebar.js')
  const layout = read('app/(dashboard)/layout.js')
  assert.match(sidebar, /export function MobileBottomNav/)
  assert.match(sidebar, /getVisibleSidebarItems\(role, menuItems, staffMenuItems\)/)
  assert.match(sidebar, /mobile-bottom-nav/)
  assert.match(layout, /<MobileBottomNav\s*\/>/)
})

test('mobile-only nav respects safe areas and page content clears the fixed navigation', () => {
  const css = read('app/globals.css')
  const layout = read('app/(dashboard)/layout.js')
  assert.match(css, /env\(safe-area-inset-bottom\)/)
  assert.match(css, /\.mobile-bottom-nav[^}]*position:\s*fixed/s)
  assert.match(layout, /pb-\[calc\(6rem\+env\(safe-area-inset-bottom\)\)\]/)
  assert.match(layout, /md:pb-6/)
  assert.match(layout, /md:pb-3/)
})

test('admin dashboard uses compact two-column mobile card and action grids without changing desktop grid breakpoints', () => {
  const page = read('app/(dashboard)/page.js')
  const css = read('app/globals.css')
  assert.match(page, /admin-dashboard-alert-grid grid grid-cols-2/)
  assert.match(page, /grid grid-cols-2 gap-4 md:grid-cols-2 xl:grid-cols-4/)
  assert.match(css, /@media \(max-width:\s*767px\)/)
  assert.match(css, /admin-dashboard-action[\s\S]*flex-direction:\s*column/)
  assert.match(css, /grid-column:\s*1\s*\/\s*-1/)
})

test('staff dashboard quick actions and statistics use mobile two-column layout', () => {
  const page = read('app/(dashboard)/page.js')
  assert.match(page, /className="grid grid-cols-2 gap-3 sm:grid-cols-2"/)
  assert.match(page, /className="grid grid-cols-2 gap-3 md:grid-cols-2 xl:grid-cols-3"/)
  assert.match(page, /mobileTile/)
})
