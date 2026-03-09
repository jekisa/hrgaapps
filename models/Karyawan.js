import mongoose from 'mongoose'

const karyawanSchema = new mongoose.Schema(
  {
    nik: { type: String, required: true, unique: true },
    nama: { type: String, required: true },
    tempatLahir: { type: String, default: null },
    tanggalLahir: { type: Date, default: null },
    jenisKelamin: { type: String, default: null },
    agama: { type: String, default: null },
    alamat: { type: String, default: null },
    telepon: { type: String, default: null },
    email: { type: String, default: null },
    foto: { type: String, default: null },
    statusKontrak: { type: String, enum: ['PKWTT', 'PKWT', 'PROBATION'], default: 'PKWTT' },
    tanggalMasuk: { type: Date, default: null },
    tanggalKontrakBerakhir: { type: Date, default: null },
    departemen: { type: String, default: null },
    jabatan: { type: String, default: null },
    statusAktif: { type: Boolean, default: true },
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

export default mongoose.models.Karyawan || mongoose.model('Karyawan', karyawanSchema)
