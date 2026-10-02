const test = require('node:test')
const assert = require('node:assert/strict')
const { decode } = require('next-auth/jwt')
const { readFileSync } = require('node:fs')
const path = require('node:path')
const { getSessionMaxAge, encodeSessionToken, matchesLoginRole, createEmailLookup } = require('../lib/auth-policy')

test('login variants only accept users whose server-authenticated role matches the selected portal', () => {
  assert.equal(matchesLoginRole('ADMIN', 'ADMIN'), true)
  assert.equal(matchesLoginRole('STAFF', 'STAFF'), true)
  assert.equal(matchesLoginRole('ADMIN', 'STAFF'), false)
  assert.equal(matchesLoginRole('STAFF', 'ADMIN'), false)
})

test('login email matching ignores surrounding whitespace and letter case', () => {
  const lookup = createEmailLookup('  Staff.User@Example.COM  ')
  assert.ok(lookup.test('staff.user@example.com'))
  assert.ok(lookup.test('Staff.User@Example.com'))
  assert.equal(lookup.test('staffXuser@example.com'), false)
})

test('remember-me selects 30-day JWT while the default session expires after 12 hours', () => {
  assert.equal(getSessionMaxAge(false), 12 * 60 * 60)
  assert.equal(getSessionMaxAge('true'), 30 * 24 * 60 * 60)
})

test('NextAuth JWT encoding preserves the selected remember-me lifetime', async () => {
  const secret = 'test-only-jwt-secret'
  for (const [rememberMe, expectedSeconds] of [[false, 43200], [true, 2592000]]) {
    const encoded = await encodeSessionToken({ token: { sub: 'account-1', rememberMe }, secret, salt: '' })
    const decoded = await decode({ token: encoded, secret, salt: '' })
    assert.equal(decoded.exp - decoded.iat, expectedSeconds)
  }
})

test('forgot-password stays public instead of being redirected to the login page', () => {
  const proxy = readFileSync(path.resolve(__dirname, '..', 'proxy.js'), 'utf8')
  const matcher = proxy.match(/matcher:\s*\[\s*'([^']+)'/)?.[1]
  const exclusions = matcher?.match(/\(\?!([^)]*)\)/)?.[1].split('|') || []
  assert.ok(exclusions.includes('forgot-password'))
})
