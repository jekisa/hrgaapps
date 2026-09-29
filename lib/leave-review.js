function validateReviewPayload(body = {}) {
  const status = String(body.status || '').trim()
  const reviewNote = String(body.reviewNote || '').trim()
  if (!['approved', 'rejected'].includes(status)) throw new Error('Status review tidak valid')
  if (status === 'rejected' && !reviewNote) throw new Error('Catatan wajib diisi saat menolak pengajuan')
  return { status, reviewNote: reviewNote || null, confirmDebt: body.confirmDebt === true }
}

function canReviewRequest(status) {
  return status === 'pending'
}

function shouldDeductLeaveQuota(leaveType) {
  return leaveType?.deductsQuota !== false && leaveType?.code !== 'sick'
}

module.exports = { validateReviewPayload, canReviewRequest, shouldDeductLeaveQuota }
