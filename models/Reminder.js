import mongoose from 'mongoose'

const reminderSchema = new mongoose.Schema(
  {
    judul: { type: String, required: true, trim: true },
    kategori: {
      type: String,
      enum: ['LISTRIK', 'AIR', 'INTERNET', 'PAJAK_KENDARAAN', 'PERAWATAN_KENDARAAN', 'LAINNYA'],
      required: true,
    },
    tanggalJatuhTempo: { type: Date, required: true },
    jumlah: { type: Number, default: null },
    prioritas: { type: String, enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'], default: 'NORMAL' },
    status: { type: String, enum: ['ACTIVE', 'DONE', 'CANCELLED'], default: 'ACTIVE' },
    recurrence: { type: String, enum: ['NONE', 'MONTHLY', 'QUARTERLY', 'YEARLY'], default: 'NONE' },
    catatan: { type: String, default: null },
    completedAt: { type: Date, default: null },
    lastCompletedAt: { type: Date, default: null },
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

export default mongoose.models.Reminder || mongoose.model('Reminder', reminderSchema)
