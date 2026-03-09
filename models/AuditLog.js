import mongoose from 'mongoose'

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    aksi: { type: String, required: true },
    modul: { type: String, required: true },
    detail: { type: String, default: null },
    ipAddress: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  }
)

export default mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema)
