const test = require('node:test')
const assert = require('node:assert/strict')
const { readFileSync, statSync } = require('node:fs')
const path = require('node:path')
const { APP_NAME, APP_LOGO_SRC, getPageTitle } = require('../lib/app-brand')

test('builds consistent product and login titles from the Dea Trans HRGA brand', () => {
  assert.equal(getPageTitle(), 'Dea Trans HRGA')
  assert.equal(getPageTitle('Login'), 'Login - Dea Trans HRGA')
  assert.equal(APP_NAME, 'Dea Trans HRGA')
})

test('uses the uploaded company logo asset as the shared app mark', () => {
  assert.equal(APP_LOGO_SRC, '/dea-trans-logo.png')
  assert.ok(statSync(path.resolve(process.cwd(), 'public', APP_LOGO_SRC.slice(1))).size > 0)
})

test('leaves only the public brand images outside auth middleware matching', () => {
  const proxy = readFileSync(path.resolve(process.cwd(), 'proxy.js'), 'utf8')
  const matcher = proxy.match(/matcher:\s*\[\s*'([^']+)'/)?.[1]
  assert.ok(matcher, 'middleware matcher is defined')
  const appliesMiddleware = (pathname) => new RegExp(`^${matcher}`).test(pathname)

  assert.equal(appliesMiddleware('/dea-trans-logo.png'), false)
  assert.equal(appliesMiddleware('/icon.png'), false)
  assert.equal(appliesMiddleware('/logo.svg'), false)
  assert.equal(appliesMiddleware('/api/cron/leave-rollover'), false)
  assert.equal(appliesMiddleware('/cuti/rekap'), true)
})
