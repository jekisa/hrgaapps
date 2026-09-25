const test = require('node:test')
const assert = require('node:assert/strict')
const { getStaffSelectableLeaveTypes } = require('../lib/staff-leave-types')

test('excludes sick and unpaid leave types from the staff application choices', () => {
  const types = [
    { code: 'annual', name: 'Cuti Tahunan' },
    { code: 'sick', name: 'Cuti Sakit' },
    { code: 'unpaid', name: 'Izin Tidak Dibayar' },
    { code: 'marriage', name: 'Cuti Menikah' },
    { code: 'other', name: 'Cuti Sakit Khusus' },
  ]
  assert.deepEqual(getStaffSelectableLeaveTypes(types).map(({ code }) => code), ['annual', 'marriage', 'other'])
})

test('excludes requested leave types by normalized label when codes differ', () => {
  assert.deepEqual(getStaffSelectableLeaveTypes([
    { code: 'sick-leave', name: ' Cuti SAKIT ' },
    { code: 'unpaid-leave', name: 'Izin Tidak Dibayar' },
  ]), [])
})
