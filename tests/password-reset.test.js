const test = require('node:test')
const assert = require('node:assert/strict')
const { createResetToken, hashResetToken, issuePasswordResetToken, handlePasswordResetRequest } = require('../lib/password-reset')

test('reset token generation returns an opaque secret and stores only its stable SHA-256 hash', () => {
  const token = createResetToken()
  assert.match(token, /^[a-f0-9]{64}$/)
  assert.equal(hashResetToken(token), hashResetToken(token))
  assert.notEqual(hashResetToken(token), hashResetToken(createResetToken()))
  assert.match(hashResetToken(token), /^[a-f0-9]{64}$/)
})

test('password reset issuance invalidates earlier tokens and stores a one-hour expiry for active account', async () => {
  const now = new Date('2026-10-02T05:00:00.000Z')
  let deletedFilter
  let savedRecord
  const UserModel = { findOne: async (filter) => filter.email === 'person@example.com' && filter.isActive ? { _id: 'user-7' } : null }
  const PasswordResetTokenModel = {
    deleteMany: async (filter) => { deletedFilter = filter },
    create: async (record) => { savedRecord = record },
  }

  const rawToken = await issuePasswordResetToken({
    email: '  PERSON@example.com ',
    UserModel,
    PasswordResetTokenModel,
    now,
  })

  assert.match(rawToken, /^[a-f0-9]{64}$/)
  assert.deepEqual(deletedFilter, { userId: 'user-7' })
  assert.equal(savedRecord.userId, 'user-7')
  assert.equal(savedRecord.tokenHash, hashResetToken(rawToken))
  assert.notEqual(savedRecord.tokenHash, rawToken)
  assert.equal(savedRecord.expiresAt.toISOString(), '2026-10-02T06:00:00.000Z')
})

test('password reset does not create a token for unknown or inactive users', async () => {
  let createCount = 0
  const result = await issuePasswordResetToken({
    email: 'unknown@example.com',
    UserModel: { findOne: async () => null },
    PasswordResetTokenModel: { deleteMany: async () => {}, create: async () => { createCount += 1 } },
  })
  assert.equal(result, null)
  assert.equal(createCount, 0)
})

test('forgot-password response is identical for a matching account and an unknown address', async () => {
  const tokenModel = { deleteMany: async () => {}, create: async () => {} }
  const known = await handlePasswordResetRequest({
    email: 'person@example.com',
    UserModel: { findOne: async () => ({ _id: 'user-7' }) },
    PasswordResetTokenModel: tokenModel,
  })
  const unknown = await handlePasswordResetRequest({
    email: 'missing@example.com',
    UserModel: { findOne: async () => null },
    PasswordResetTokenModel: tokenModel,
  })

  assert.deepEqual(known, { status: 202, message: 'Jika email terdaftar, link reset akan dikirim.' })
  assert.deepEqual(unknown, known)
})
