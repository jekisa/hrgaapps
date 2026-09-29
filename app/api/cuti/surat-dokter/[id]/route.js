import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import User from '@/models/User'
import Karyawan from '@/models/Karyawan'
import LeaveType from '@/models/LeaveType'
import LeaveRequest from '@/models/LeaveRequest'
import DoctorCertificate from '@/models/DoctorCertificate'
import leaveAuth from '@/lib/leave-auth'
import doctorVerification from '@/lib/doctor-verification'

const { assertRole, getEmployeeForSession } = leaveAuth
const { validateDoctorVerificationPayload } = doctorVerification

export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions)
  const accessError = assertRole(session, 'ADMIN')
  if (accessError) return NextResponse.json({ error: accessError.error }, { status: accessError.status })
  try {
    const { id } = await params
    const payload = validateDoctorVerificationPayload(await request.json())
    await dbConnect()
    if (new URL(request.url).searchParams.get('source') === 'standalone') {
      const verifierId = session?.user?.id
      if (!verifierId) return NextResponse.json({ error: 'Identitas admin tidak ditemukan' }, { status: 401 })
      const result = await DoctorCertificate.findOneAndUpdate(
        { _id: id, verificationStatus: 'pending' },
        { $set: { ...payload, verifiedBy: verifierId, verifiedAt: new Date() } },
        { new: true, runValidators: true },
      ).lean()
      if (!result) return NextResponse.json({ error: 'Surat dokter sudah diverifikasi atau tidak ditemukan' }, { status: 409 })
      return NextResponse.json(result)
    }
    const current = await LeaveRequest.findById(id).lean()
    if (!current) return NextResponse.json({ error: 'Pengajuan cuti tidak ditemukan' }, { status: 404 })
    const type = await LeaveType.findById(current.leaveTypeId).select('code').lean()
    if (type?.code !== 'sick') return NextResponse.json({ error: 'Hanya surat cuti sakit yang dapat diverifikasi' }, { status: 422 })
    if (current.verificationStatus && current.verificationStatus !== 'pending') return NextResponse.json({ error: 'Surat dokter sudah diverifikasi' }, { status: 409 })
    const verifier = await getEmployeeForSession(session, { dbConnect, User, Karyawan })
    if (!verifier) return NextResponse.json({ error: 'Profil karyawan admin belum terhubung' }, { status: 422 })
    const result = await LeaveRequest.findOneAndUpdate(
      { _id: id, leaveTypeId: current.leaveTypeId, $or: [{ verificationStatus: 'pending' }, { verificationStatus: null }] },
      { $set: { ...payload, verifiedBy: verifier._id, verifiedAt: new Date() } },
      { new: true, runValidators: true },
    ).lean()
    if (!result) return NextResponse.json({ error: 'Surat dokter sudah diverifikasi' }, { status: 409 })
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Gagal memverifikasi surat dokter' }, { status: error.status || 500 })
  }
}
