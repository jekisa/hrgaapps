const test = require('node:test')
const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const path = require('node:path')

const read = (file) => readFileSync(path.resolve(__dirname, '..', file), 'utf8')

test('sidebar keeps its menu scrollable between a fixed header and profile footer', () => {
  const sidebar = read('components/layout/Sidebar.js')
  assert.match(sidebar, /flex-1 min-h-0 overflow-y-auto/)
  assert.match(sidebar, /data-sidebar-footer/)
})

test('admin dashboard defines its own accent and responsive five-tile alert grid', () => {
  const css = read('app/globals.css')
  const page = read('app/(dashboard)/page.js')
  assert.match(css, /--admin-accent\s*:/)
  assert.match(page, /admin-dashboard-alert-grid/)
  assert.match(page, /staff-theme space-y-6/)
})

test('admin dashboard uses compact section spacing and chart heights without changing staff spacing', () => {
  const css = read('app/globals.css')
  const page = read('app/(dashboard)/page.js')
  assert.match(page, /admin-dashboard space-y-4/)
  assert.match(page, /h-\[180px\]/)
  assert.match(css, /\.admin-dashboard \.dashboard-panel\s*\{[^}]*padding:\s*1rem/)
  assert.match(page, /staff-theme space-y-6/)
})

test('admin quick actions stay in one desktop row while dashboard cards shrink to their content', () => {
  const page = read('app/(dashboard)/page.js')
  const css = read('app/globals.css')
  assert.ok(/admin-dashboard-actions/.test(page))
  assert.ok(/admin-dashboard-actions[\s\S]*repeat\(5,minmax\(0,1fr\)/.test(css))
  assert.ok(/admin-dashboard-greeting/.test(page))
  assert.ok(/undraw-business-analytics-indigo\.svg/.test(page))
  assert.ok(/h-\[190px\]/.test(page))
  assert.ok(/--admin-gradient-/.test(css))
  assert.ok(/admin-stat-icon/.test(css))
  assert.ok(/admin-avatar-ring/.test(css))
})
