import mongoose from 'mongoose'

const asetSchema = new mongoose.Schema(
  {
    kodeAset: { type: String, required: true, unique: true },
    namaAset: { type: String, required: true },
    kategori: { type: String, required: true },
    merk: { type: String, default: null },
    model: { type: String, default: null },
    serialNumber: { type: String, default: null },
    tahunPerolehan: { type: Number, default: null },
    nilaiPerolehan: { type: Number, default: null },
    kondisi: { type: String, enum: ['BAIK', 'RUSAK_RINGAN', 'RUSAK_BERAT', 'DISPOSAL'], default: 'BAIK' },
    status: { type: String, enum: ['AKTIF', 'DIPINJAM', 'RUSAK', 'DISPOSAL'], default: 'AKTIF' },
    lokasi: { type: String, default: null },
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

export default mongoose.models.Aset || mongoose.model('Aset', asetSchema)
