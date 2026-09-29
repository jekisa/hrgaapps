import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import User from '@/models/User'
import Karyawan from '@/models/Karyawan'
import DoctorCertificate from '@/models/DoctorCertificate'
import Notifikasi from '@/models/Notifikasi'
import leaveAuth from '@/lib/leave-auth'
import leaveStorage from '@/lib/leave-storage'
import doctorVerification from '@/lib/doctor-verification'

const { saveLeaveAttachment } = leaveStorage
const { assertRole, getEmployeeForSession } = leaveAuth
const { validateDoctorSickLeaveDates } = doctorVerification

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const formData = await request.formData()
    const file = formData.get('file')
    if (!file || typeof file.arrayBuffer !== 'function') return NextResponse.json({ error: 'File wajib dipilih' }, { status: 422 })
    const isDoctorCertificate = formData.get('purpose') === 'doctor-certificate'
    if (isDoctorCertificate) {
      const accessError = assertRole(session, 'STAFF')
      if (accessError) return NextResponse.json({ error: accessError.error }, { status: accessError.status })
      await dbConnect()
    }
    const sickDates = isDoctorCertificate ? validateDoctorSickLeaveDates({
      sickStartDate: formData.get('sickStartDate'),
      sickEndDate: formData.get('sickEndDate'),
    }) : null
    const employee = isDoctorCertificate ? await getEmployeeForSession(session, { dbConnect, User, Karyawan }) : null
    if (isDoctorCertificate && !employee) return NextResponse.json({ error: 'Profil karyawan belum terhubung dengan akun ini' }, { status: 422 })
    const upload = await saveLeaveAttachment(file, process.cwd())
    if (isDoctorCertificate) {
      const certificate = await DoctorCertificate.create({ employeeId: employee._id, attachmentUrl: upload.attachmentUrl, fileName: upload.fileName, ...sickDates })
      const profile = await Karyawan.findById(employee._id).select('nama').lean()
      await Notifikasi.create({ judul: 'Surat Dokter Menunggu Verifikasi', pesan: `${profile?.nama || 'Karyawan'} mengunggah surat dokter untuk verifikasi`, tipe: 'CUTI', targetId: certificate._id, href: '/cuti/surat-dokter' })
      return NextResponse.json({ ...upload, certificateId: certificate._id, queuedForVerification: true }, { status: 201 })
    }
    return NextResponse.json(upload, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Gagal upload lampiran' }, { status: error.status || 500 })
  }
}
