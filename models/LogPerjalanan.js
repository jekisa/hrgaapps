import mongoose from 'mongoose'

const logPerjalananSchema = new mongoose.Schema(
  {
    kendaraanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Kendaraan', required: true },
    karyawanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Karyawan', default: null },
    tanggal: { type: Date, required: true },
    tujuan: { type: String, default: null },
    keperluan: { type: String, default: null },
    kmAwal: { type: Number, default: null },
    kmAkhir: { type: Number, default: null },
    totalKm: { type: Number, default: null },
    bbm: { type: Number, default: null },
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

export default mongoose.models.LogPerjalanan || mongoose.model('LogPerjalanan', logPerjalananSchema)
