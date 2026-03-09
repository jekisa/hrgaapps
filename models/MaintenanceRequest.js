import mongoose from 'mongoose'

const maintenanceRequestSchema = new mongoose.Schema(
  {
    judul: { type: String, required: true },
    lokasi: { type: String, default: null },
    kategori: { type: String, default: null },
    deskripsi: { type: String, default: null },
    prioritas: { type: String, enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'], default: 'NORMAL' },
    status: { type: String, enum: ['PENDING', 'PROSES', 'SELESAI', 'DITOLAK'], default: 'PENDING' },
    pemohon: { type: String, default: null },
    pelaksana: { type: String, default: null },
    biaya: { type: Number, default: null },
    tanggalRequest: { type: Date, default: Date.now },
    tanggalSelesai: { type: Date, default: null },
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

export default mongoose.models.MaintenanceRequest || mongoose.model('MaintenanceRequest', maintenanceRequestSchema)
