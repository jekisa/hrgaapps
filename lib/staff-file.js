const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024
const ALLOWED_ATTACHMENT_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png'])
function validateStaffAttachment(file) {
  if (!file) return { valid: true, error: null }
  if (!ALLOWED_ATTACHMENT_TYPES.has(file.type)) return { valid: false, error: 'Format file harus PDF, JPG, atau PNG' }
  if (file.size > MAX_ATTACHMENT_BYTES) return { valid: false, error: 'Ukuran file maksimal 5 MB' }
  return { valid: true, error: null }
}
function formatStaffFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  return `${Number.isInteger(kb) ? kb : kb.toFixed(1)} KB`
}
module.exports = { MAX_ATTACHMENT_BYTES, ALLOWED_ATTACHMENT_TYPES, validateStaffAttachment, formatStaffFileSize }
