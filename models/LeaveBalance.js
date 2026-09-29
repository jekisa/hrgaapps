const mongoose = require('mongoose')

const leaveBalanceSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Karyawan', required: true },
    leaveTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType', required: true },
    year: { type: Number, required: true, min: 2000 },
    quota: { type: Number, required: true, min: 0, default: 0 },
    used: { type: Number, required: true, min: 0, default: 0 },
    carriedDebt: { type: Number, required: true, min: 0, default: 0 },
    adminAdjustment: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
)

leaveBalanceSchema.index({ employeeId: 1, leaveTypeId: 1, year: 1 }, { unique: true })

module.exports = mongoose.models.LeaveBalance || mongoose.model('LeaveBalance', leaveBalanceSchema)
