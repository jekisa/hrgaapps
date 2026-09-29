const mongoose = require('mongoose')

const leaveTypeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    defaultQuotaPerYear: { type: Number, required: true, min: 0, default: 0 },
    requiresAttachment: { type: Boolean, default: false },
    allowDebt: { type: Boolean, default: false },
    deductsQuota: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

module.exports = mongoose.models.LeaveType || mongoose.model('LeaveType', leaveTypeSchema)
