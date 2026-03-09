import mongoose from 'mongoose'

const perawatanKendaraanSchema = new mongoose.Schema(
  {
    kendaraanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Kendaraan', required: true },
    tanggal: { type: Date, required: true },
    jenisPerawatan: { type: String, default: null },
    deskripsi: { type: String, default: null },
    biaya: { type: Number, default: null },
    bengkel: { type: String, default: null },
    kmServis: { type: Number, default: null },
    kmServisBerikutnya: { type: Number, default: null },
    status: { type: String, enum: ['TERJADWAL', 'SELESAI'], default: 'TERJADWAL' },
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

export default mongoose.models.PerawatanKendaraan || mongoose.model('PerawatanKendaraan', perawatanKendaraanSchema)
