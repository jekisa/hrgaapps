const { getServerSession } = require('next-auth')
const { normalizeEmail } = require('./leave-utils')
const { requireRole } = require('./access-control')

function httpError(message, status) {
  const error = new Error(message)
  error.status = status
  return error
}

function assertRole(session, role) {
  return requireRole(session, [role])
}

async function requireSession(request, authOptions) {
  const session = await getServerSession(authOptions)
  if (!session) throw httpError('Unauthorized', 401)
  return session
}

async function getEmployeeForSession(session, { dbConnect, User, Karyawan }) {
  if (!session?.user?.id) return null
  await dbConnect()
  const user = await User.findById(session.user.id).select('email').lean()
  if (!user?.email) return null
  const email = normalizeEmail(user.email)
  const escapedEmail = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return Karyawan.findOne({ email: { $regex: `^\\s*${escapedEmail}\\s*$`, $options: 'i' } })
    .select('email')
    .lean()
}

module.exports = { assertRole, requireSession, getEmployeeForSession, httpError }
