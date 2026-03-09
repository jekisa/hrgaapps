import mongoose from 'mongoose'

const utilitasSchema = new mongoose.Schema(
  {
    jenis: { type: String, enum: ['LISTRIK', 'AIR', 'INTERNET', 'LAINNYA'], required: true },
    bulan: { type: Number, required: true },
    tahun: { type: Number, required: true },
    tagihan: { type: Number, default: null },
    penggunaan: { type: Number, default: null },
    satuan: { type: String, default: null },
    statusBayar: { type: String, enum: ['BELUM', 'SUDAH'], default: 'BELUM' },
    tanggalBayar: { type: Date, default: null },
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

export default mongoose.models.Utilitas || mongoose.model('Utilitas', utilitasSchema)
