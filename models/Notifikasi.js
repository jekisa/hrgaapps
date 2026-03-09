import mongoose from 'mongoose'

const notifikasiSchema = new mongoose.Schema(
  {
    judul: { type: String, required: true },
    pesan: { type: String, default: null },
    tipe: { type: String, default: null },
    targetId: { type: mongoose.Schema.Types.ObjectId, default: null },
    status: { type: String, enum: ['BELUM_DIBACA', 'SUDAH_DIBACA'], default: 'BELUM_DIBACA' },
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

export default mongoose.models.Notifikasi || mongoose.model('Notifikasi', notifikasiSchema)
