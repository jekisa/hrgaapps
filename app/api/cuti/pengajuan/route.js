import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import User from '@/models/User'
import Karyawan from '@/models/Karyawan'
import LeaveType from '@/models/LeaveType'
import LeaveRequest from '@/models/LeaveRequest'
import Notifikasi from '@/models/Notifikasi'
import leaveAuth from '@/lib/leave-auth'
import leaveContract from '@/lib/leave-contract'
import { countBusinessDays, parseLocalDate } from '@/lib/leave-utils'

const { getEmployeeForSession } = leaveAuth
const { buildStaffScope, validateRequestPayload, parsePagination } = leaveContract

function errorResponse(error) {
  return NextResponse.json({ error: error.message || 'Gagal memproses pengajuan cuti' }, { status: error.status || 500 })
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const { page, limit } = parsePagination(searchParams)
    await dbConnect()
    const query = {}
    if (searchParams.get('status')) query.status = searchParams.get('status')
    if (searchParams.get('leaveTypeId')) query.leaveTypeId = searchParams.get('leaveTypeId')
    if (searchParams.get('employeeId') && session.user.role === 'ADMIN') query.employeeId = searchParams.get('employeeId')
    if (searchParams.get('from') || searchParams.get('to')) {
      query.startDate = {}
      if (searchParams.get('from')) query.startDate.$gte = parseLocalDate(searchParams.get('from'))
      if (searchParams.get('to')) query.startDate.$lte = parseLocalDate(searchParams.get('to'))
    }
    if (session.user.role !== 'ADMIN') {
      const employee = await getEmployeeForSession(session, { dbConnect, User, Karyawan })
      Object.assign(query, buildStaffScope(session, 'STAFF', employee))
    }
    const [total, data] = await Promise.all([
      LeaveRequest.countDocuments(query),
      LeaveRequest.find(query).populate('employeeId', 'nama email').populate('leaveTypeId', 'code name requiresAttachment').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    ])
    return NextResponse.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const payload = validateRequestPayload(await request.json())
    await dbConnect()
    const employee = await getEmployeeForSession(session, { dbConnect, User, Karyawan })
    const { employeeId } = buildStaffScope(session, 'STAFF', employee)
    const leaveType = await LeaveType.findOne({ _id: payload.leaveTypeId, isActive: true })
    if (!leaveType) return NextResponse.json({ error: 'Jenis cuti tidak aktif atau tidak ditemukan' }, { status: 422 })
    const totalDays = countBusinessDays(payload.startDate, payload.endDate)
    if (totalDays === 0) return NextResponse.json({ error: 'Rentang tanggal tidak memiliki hari kerja' }, { status: 422 })
    if (leaveType.requiresAttachment && !payload.attachmentUrl) return NextResponse.json({ error: 'Lampiran wajib untuk jenis cuti ini' }, { status: 422 })
    const overlap = await LeaveRequest.exists({ employeeId, status: { $in: ['pending', 'approved'] }, startDate: { $lte: parseLocalDate(payload.endDate) }, endDate: { $gte: parseLocalDate(payload.startDate) } })
    if (overlap) return NextResponse.json({ error: 'Tanggal cuti bertumpuk dengan pengajuan lain' }, { status: 409 })
    const data = await LeaveRequest.create({ ...payload, employeeId, startDate: parseLocalDate(payload.startDate), endDate: parseLocalDate(payload.endDate), totalDays, status: 'pending' })
    await Notifikasi.create({ judul: 'Pengajuan Cuti Baru', pesan: `Pengajuan cuti baru dari ${employee.nama}`, tipe: 'CUTI', targetId: data._id })
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return errorResponse(error)
  }
}
