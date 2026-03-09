import mongoose from 'mongoose'

const pembayaranPajakSchema = new mongoose.Schema(
  {
    kendaraanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Kendaraan', required: true },
    jenisPajak: { type: String, enum: ['PKB', 'STNK', 'SWDKLLJ', 'LAINNYA'], default: 'PKB' },
    tahun: { type: Number, default: null },
    tanggalJatuhTempo: { type: Date, default: null },
    tanggalBayar: { type: Date, default: null },
    jumlah: { type: Number, default: null },
    status: { type: String, enum: ['BELUM', 'SUDAH'], default: 'BELUM' },
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

export default mongoose.models.PembayaranPajak || mongoose.model('PembayaranPajak', pembayaranPajakSchema)
