const { httpError } = require('./leave-auth')

function buildStaffScope(session, scope = 'STAFF', employee = null) {
  if (!session) throw httpError('Unauthorized', 401)
  if (scope === 'ADMIN' && session.user?.role !== 'ADMIN') throw httpError('Forbidden', 403)
  if (scope === 'STAFF' && !employee) throw httpError('Profil karyawan belum terhubung dengan akun ini', 422)
  return scope === 'STAFF' ? { employeeId: employee._id } : {}
}

function validateLeaveTypePayload(body = {}) {
  const code = String(body.code || '').trim().toLowerCase()
  const name = String(body.name || '').trim()
  const quota = Number(body.defaultQuotaPerYear)
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(code) || !name || !Number.isInteger(quota) || quota < 0) {
    throw httpError('Jenis cuti dan kuota default tidak valid', 422)
  }
  return {
    code,
    name,
    defaultQuotaPerYear: quota,
    requiresAttachment: code === 'sick' ? true : Boolean(body.requiresAttachment),
    deductsQuota: code === 'sick' ? false : body.deductsQuota !== false,
    isActive: body.isActive !== false,
  }
}

function validateBalanceCorrectionPayload(body = {}) {
  const employeeId = String(body.employeeId || '').trim()
  const leaveTypeId = String(body.leaveTypeId || '').trim()
  const year = Number(body.year)
  const remaining = Number(body.remaining)
  if (!employeeId || !leaveTypeId || !Number.isInteger(year) || year < 2000 || year > 2100 || body.remaining === '' || body.remaining == null || !Number.isInteger(remaining)) {
    throw httpError('Data perubahan saldo cuti tidak valid', 422)
  }
  return { employeeId, leaveTypeId, year, remaining, reason: String(body.reason || '').trim() }
}

function validateRequestPayload(body = {}, { leaveTypeCode = null } = {}) {
  const leaveTypeId = String(body.leaveTypeId || '').trim()
  const startDate = String(body.startDate || '').trim()
  const endDate = String(body.endDate || '').trim()
  if (!leaveTypeId || !/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    throw httpError('Jenis cuti dan rentang tanggal wajib diisi', 422)
  }
  return {
    leaveTypeId,
    startDate,
    endDate,
    reason: String(body.reason || '').trim(),
    attachmentUrl: body.attachmentUrl ? String(body.attachmentUrl).trim() : null,
    doctorName: leaveTypeCode === 'sick' ? String(body.doctorName || '').trim() || null : null,
    certificateNumber: leaveTypeCode === 'sick' ? String(body.certificateNumber || '').trim() || null : null,
    additionalNotes: leaveTypeCode === 'sick' ? String(body.additionalNotes || '').trim() || null : null,
  }
}

function parsePagination(searchParams) {
  const page = Math.max(Number.parseInt(searchParams.get?.('page') || searchParams.page || '1', 10) || 1, 1)
  const limit = Math.min(Math.max(Number.parseInt(searchParams.get?.('limit') || searchParams.limit || '10', 10) || 10, 1), 100)
  return { page, limit }
}

function buildRekapFilters(params = {}) {
  const year = Number.parseInt(params.year || new Date().getFullYear(), 10)
  if (!Number.isInteger(year) || year < 2000 || year > 2100) throw httpError('Tahun rekap tidak valid', 422)
  return { year, employeeId: params.employeeId || '', leaveTypeId: params.leaveTypeId || '' }
}

module.exports = { buildStaffScope, validateLeaveTypePayload, validateBalanceCorrectionPayload, validateRequestPayload, parsePagination, buildRekapFilters }
