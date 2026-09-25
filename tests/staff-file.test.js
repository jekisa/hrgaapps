const test = require('node:test')
const assert = require('node:assert/strict')
const { validateStaffAttachment, formatStaffFileSize } = require('../lib/staff-file')
test('attachment helper accepts allowed formats and rejects oversized or unsupported files', () => {
  assert.equal(validateStaffAttachment({ type: 'application/pdf', size: 5 * 1024 * 1024 }).valid, true)
  assert.equal(validateStaffAttachment({ type: 'image/gif', size: 10 }).valid, false)
  assert.equal(validateStaffAttachment({ type: 'image/png', size: 5 * 1024 * 1024 + 1 }).valid, false)
  assert.equal(validateStaffAttachment(null).valid, true)
})
test('attachment size is readable', () => {
  assert.equal(formatStaffFileSize(0), '0 B')
  assert.equal(formatStaffFileSize(1024), '1 KB')
})
