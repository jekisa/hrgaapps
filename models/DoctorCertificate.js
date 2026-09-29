const mongoose = require('mongoose')

const cachedDoctorCertificate = mongoose.models.DoctorCertificate
const cachedVerifierRef = cachedDoctorCertificate?.schema.path('verifiedBy')?.options.ref
if (cachedDoctorCertificate && (
  !cachedDoctorCertificate.schema.path('sickStartDate')
  || !cachedDoctorCertificate.schema.path('sickEndDate')
  || cachedVerifierRef !== 'User'
)) {
  mongoose.deleteModel('DoctorCertificate')
}

const doctorCertificateSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Karyawan', required: true, index: true },
  attachmentUrl: { type: String, trim: true, required: true },
  fileName: { type: String, trim: true, default: null },
  sickStartDate: { type: Date, required: true },
  sickEndDate: { type: Date, required: true },
  verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending', index: true },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  verifiedAt: { type: Date, default: null },
  verificationNote: { type: String, trim: true, default: null },
}, { timestamps: true })

doctorCertificateSchema.index({ createdAt: -1 })

module.exports = mongoose.models.DoctorCertificate || mongoose.model('DoctorCertificate', doctorCertificateSchema)
