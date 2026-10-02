import mongoose from 'mongoose'

const passwordResetTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tokenHash: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true })

passwordResetTokenSchema.index({ userId: 1 })
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.models.PasswordResetToken || mongoose.model('PasswordResetToken', passwordResetTokenSchema)
