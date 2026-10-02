const { createHash, randomBytes } = require('node:crypto')

const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000
const GENERIC_RESET_MESSAGE = 'Jika email terdaftar, link reset akan dikirim.'

function createResetToken() {
  return randomBytes(32).toString('hex')
}

function hashResetToken(token) {
  return createHash('sha256').update(token).digest('hex')
}

async function issuePasswordResetToken({ email, UserModel, PasswordResetTokenModel, now = new Date() }) {
  const normalizedEmail = email.trim().toLowerCase()
  const user = await UserModel.findOne({ email: normalizedEmail, isActive: true })
  if (!user) return null

  const rawToken = createResetToken()
  await PasswordResetTokenModel.deleteMany({ userId: user._id })
  await PasswordResetTokenModel.create({
    userId: user._id,
    tokenHash: hashResetToken(rawToken),
    expiresAt: new Date(now.getTime() + PASSWORD_RESET_TTL_MS),
  })

  return rawToken
}

async function handlePasswordResetRequest({ email, UserModel, PasswordResetTokenModel, now }) {
  await issuePasswordResetToken({ email, UserModel, PasswordResetTokenModel, now })
  return { status: 202, message: GENERIC_RESET_MESSAGE }
}

module.exports = { createResetToken, hashResetToken, issuePasswordResetToken, handlePasswordResetRequest }
