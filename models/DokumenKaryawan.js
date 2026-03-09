import mongoose from 'mongoose'

const dokumenKaryawanSchema = new mongoose.Schema(
  {
    karyawanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Karyawan', required: true },
    jenisDokumen: { type: String, required: true },
    noDokumen: { type: String, default: null },
    tanggalTerbit: { type: Date, default: null },
    tanggalBerakhir: { type: Date, default: null },
    fileUrl: { type: String, default: null },
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

export default mongoose.models.DokumenKaryawan || mongoose.model('DokumenKaryawan', dokumenKaryawanSchema)
