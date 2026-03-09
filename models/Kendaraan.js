import mongoose from 'mongoose'

const kendaraanSchema = new mongoose.Schema(
  {
    noPol: { type: String, required: true, unique: true },
    merk: { type: String, required: true },
    model: { type: String, default: null },
    tahun: { type: Number, default: null },
    warna: { type: String, default: null },
    jenisKendaraan: { type: String, default: null },
    noRangka: { type: String, default: null },
    noMesin: { type: String, default: null },
    status: { type: String, enum: ['TERSEDIA', 'DIGUNAKAN', 'SERVIS', 'TIDAK_AKTIF'], default: 'TERSEDIA' },
    tanggalPajakBerakhir: { type: Date, default: null },
    tanggalSTNKBerakhir: { type: Date, default: null },
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

export default mongoose.models.Kendaraan || mongoose.model('Kendaraan', kendaraanSchema)
