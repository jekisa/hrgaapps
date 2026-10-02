const { encode } = require('next-auth/jwt')

const SHORT_SESSION_SECONDS = 12 * 60 * 60
const REMEMBERED_SESSION_SECONDS = 30 * 24 * 60 * 60

function getSessionMaxAge(rememberMe) {
  return rememberMe === true || rememberMe === 'true'
    ? REMEMBERED_SESSION_SECONDS
    : SHORT_SESSION_SECONDS
}

function matchesLoginRole(expectedRole, actualRole) {
  return !expectedRole || String(expectedRole).toUpperCase() === String(actualRole).toUpperCase()
}

function createEmailLookup(email) {
  const normalizedEmail = String(email || '').trim()
  const escapedEmail = normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`^${escapedEmail}$`, 'i')
}

function encodeSessionToken(params) {
  return encode({
    ...params,
    maxAge: getSessionMaxAge(params.token?.rememberMe),
  })
}

module.exports = { getSessionMaxAge, matchesLoginRole, createEmailLookup, encodeSessionToken }
