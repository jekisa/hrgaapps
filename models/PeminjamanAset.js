import mongoose from 'mongoose'

const peminjamanAsetSchema = new mongoose.Schema(
  {
    asetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Aset', required: true },
    karyawanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Karyawan', required: true },
    tanggalPinjam: { type: Date, required: true },
    tanggalRencanaKembali: { type: Date, default: null },
    tanggalKembali: { type: Date, default: null },
    keperluan: { type: String, default: null },
    status: { type: String, enum: ['DIPINJAM', 'DIKEMBALIKAN'], default: 'DIPINJAM' },
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

export default mongoose.models.PeminjamanAset || mongoose.model('PeminjamanAset', peminjamanAsetSchema)
