import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import LeaveType from '@/models/LeaveType'
import LeaveRequest from '@/models/LeaveRequest'
import Karyawan from '@/models/Karyawan'
import DoctorCertificate from '@/models/DoctorCertificate'
import leaveAuth from '@/lib/leave-auth'
import doctorVerification from '@/lib/doctor-verification'

const { assertRole } = leaveAuth
const { mergeDoctorCertificateRows } = doctorVerification

export async function GET(request) {
  const session = await getServerSession(authOptions)
  const accessError = assertRole(session, 'ADMIN')
  if (accessError) return NextResponse.json({ error: accessError.error }, { status: accessError.status })
  try {
    await dbConnect()
    const sickType = await LeaveType.findOne({ code: 'sick' }).select('_id').lean()
    const employees = await Karyawan.find({ statusAktif: true }).select('nama').sort({ nama: 1 }).lean()
    const { searchParams } = new URL(request.url)
    const query = sickType ? { leaveTypeId: sickType._id } : { _id: { $exists: false } }
    const status = searchParams.get('status')
    const standaloneQuery = {}
    if (status === 'pending') {
      query.$or = [{ verificationStatus: 'pending' }, { verificationStatus: null }]
      standaloneQuery.verificationStatus = 'pending'
    }
    else if (['verified', 'rejected'].includes(status)) query.verificationStatus = status
    if (['verified', 'rejected'].includes(status)) standaloneQuery.verificationStatus = status
    if (searchParams.get('employeeId')) {
      query.employeeId = searchParams.get('employeeId')
      standaloneQuery.employeeId = searchParams.get('employeeId')
    }
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    if (from || to) {
      query.startDate = {}
      if (from) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(from)) return NextResponse.json({ error: 'Tanggal awal tidak valid' }, { status: 422 })
        query.startDate.$gte = new Date(`${from}T00:00:00.000+07:00`)
      }
      if (to) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(to)) return NextResponse.json({ error: 'Tanggal akhir tidak valid' }, { status: 422 })
        query.startDate.$lte = new Date(`${to}T23:59:59.999+07:00`)
      }
      standaloneQuery.sickStartDate = { ...query.startDate }
    }
    const [requests, certificates] = await Promise.all([
      LeaveRequest.find(query).populate('employeeId', 'nama email jabatan').populate('leaveTypeId', 'name code').sort({ createdAt: -1 }).limit(300).lean(),
      DoctorCertificate.find(standaloneQuery).populate('employeeId', 'nama email jabatan').sort({ createdAt: -1 }).limit(300).lean(),
    ])
    return NextResponse.json({ data: mergeDoctorCertificateRows(requests, certificates), employees })
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Gagal memuat surat dokter' }, { status: 500 })
  }
}
