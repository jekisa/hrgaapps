function getQuotaWarning(remaining, requestedDays) {
  return Number(requestedDays) > Number(remaining) ? 'Pengajuan melebihi sisa kuota cuti' : null
}

function buildLeaveSubmission(form) {
  return {
    leaveTypeId: String(form.leaveTypeId || '').trim(),
    startDate: String(form.startDate || '').trim(),
    endDate: String(form.endDate || '').trim(),
    reason: String(form.reason || '').trim(),
    attachmentUrl: form.attachmentUrl ? String(form.attachmentUrl).trim() : null,
    doctorName: String(form.doctorName || '').trim() || null,
    certificateNumber: String(form.certificateNumber || '').trim() || null,
    additionalNotes: String(form.additionalNotes || '').trim() || null,
  }
}

function isLeaveAttachmentRequired(leaveType) {
  return leaveType?.requiresAttachment === true
}

module.exports = { getQuotaWarning, buildLeaveSubmission, isLeaveAttachmentRequired }
