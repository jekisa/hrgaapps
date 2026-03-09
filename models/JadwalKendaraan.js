import mongoose from 'mongoose'

const jadwalKendaraanSchema = new mongoose.Schema(
  {
    kendaraanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Kendaraan', required: true },
    pengemudi: { type: String, default: null },
    keperluan: { type: String, default: null },
    tujuan: { type: String, default: null },
    tanggalBerangkat: { type: Date, required: true },
    tanggalKembali: { type: Date, default: null },
    status: { type: String, enum: ['TERJADWAL', 'BERLANGSUNG', 'SELESAI', 'DIBATALKAN'], default: 'TERJADWAL' },
    keterangan: { type: String, default: null },
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

export default mongoose.models.JadwalKendaraan || mongoose.model('JadwalKendaraan', jadwalKendaraanSchema)
