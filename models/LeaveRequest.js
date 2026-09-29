const mongoose = require('mongoose')

const leaveRequestSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Karyawan', required: true },
    leaveTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalDays: { type: Number, required: true, min: 0 },
    reason: { type: String, trim: true, default: '' },
    attachmentUrl: { type: String, trim: true, default: null },
    doctorName: { type: String, trim: true, default: null },
    certificateNumber: { type: String, trim: true, default: null },
    additionalNotes: { type: String, trim: true, default: null },
    verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected', null], default: null },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Karyawan', default: null },
    verifiedAt: { type: Date, default: null },
    verificationNote: { type: String, trim: true, default: null },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Karyawan', default: null },
    reviewedAt: { type: Date, default: null },
    reviewNote: { type: String, trim: true, default: null },
  },
  { timestamps: true }
)

leaveRequestSchema.index({ employeeId: 1, startDate: 1, endDate: 1 })
leaveRequestSchema.index({ status: 1, startDate: 1 })
leaveRequestSchema.index({ employeeId: 1, createdAt: -1 })

module.exports = mongoose.models.LeaveRequest || mongoose.model('LeaveRequest', leaveRequestSchema)
