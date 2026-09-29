const VALID_VERIFICATION_STATUSES = new Set(['verified', 'rejected'])

function validateDoctorSickLeaveDates({ sickStartDate, sickEndDate } = {}) {
  const isValidDate = (value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return false
    const date = new Date(`${value}T00:00:00.000Z`)
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  }
  if (!isValidDate(sickStartDate) || !isValidDate(sickEndDate)) {
    throw Object.assign(new Error('Tanggal mulai dan selesai izin sakit wajib diisi dengan tanggal yang valid'), { status: 422 })
  }
  if (sickEndDate < sickStartDate) {
    throw Object.assign(new Error('Tanggal selesai izin sakit tidak boleh sebelum tanggal mulai'), { status: 422 })
  }
  return {
    sickStartDate: new Date(`${sickStartDate}T00:00:00.000Z`),
    sickEndDate: new Date(`${sickEndDate}T00:00:00.000Z`),
  }
}

function validateDoctorVerificationPayload(body = {}) {
  const verificationStatus = String(body.verificationStatus || '').trim()
  const verificationNote = String(body.verificationNote || '').trim()
  if (!VALID_VERIFICATION_STATUSES.has(verificationStatus)) throw Object.assign(new Error('Status verifikasi tidak valid'), { status: 422 })
  if (verificationStatus === 'rejected' && !verificationNote) throw Object.assign(new Error('Catatan wajib diisi saat menolak surat dokter'), { status: 422 })
  return { verificationStatus, verificationNote: verificationNote || null }
}

function getVerificationStatus(request) { return request?.verificationStatus || 'pending' }

function mergeDoctorCertificateRows(leaveRequests = [], standaloneCertificates = []) {
  return [
    ...leaveRequests.map((request) => ({ ...request, source: 'leaveRequest', id: String(request._id), verificationStatus: getVerificationStatus(request) })),
    ...standaloneCertificates.map((certificate) => ({
      ...certificate,
      source: 'standalone',
      id: String(certificate._id),
      startDate: certificate.sickStartDate || null,
      endDate: certificate.sickEndDate || null,
      totalDays: null,
      leaveTypeId: { name: 'Unggah Surat Dokter' },
      verificationStatus: getVerificationStatus(certificate),
    })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

module.exports = { validateDoctorVerificationPayload, validateDoctorSickLeaveDates, getVerificationStatus, mergeDoctorCertificateRows }
