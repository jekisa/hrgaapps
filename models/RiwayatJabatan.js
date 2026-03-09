import mongoose from 'mongoose'

const riwayatJabatanSchema = new mongoose.Schema(
  {
    karyawanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Karyawan', required: true },
    jabatan: { type: String, required: true },
    departemen: { type: String, default: null },
    tanggalMulai: { type: Date, required: true },
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

export default mongoose.models.RiwayatJabatan || mongoose.model('RiwayatJabatan', riwayatJabatanSchema)
