const mongoose = require('mongoose')

const leaveBalanceAdjustmentSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Karyawan', required: true },
    leaveTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType', required: true },
    year: { type: Number, required: true, min: 2000 },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    previousRemaining: { type: Number, required: true },
    newRemaining: { type: Number, required: true },
    reason: { type: String, trim: true, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

leaveBalanceAdjustmentSchema.index({ employeeId: 1, year: 1, createdAt: -1 })

module.exports = mongoose.models.LeaveBalanceAdjustment || mongoose.model('LeaveBalanceAdjustment', leaveBalanceAdjustmentSchema)
