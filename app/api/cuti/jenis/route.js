import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import LeaveType from '@/models/LeaveType'
import leaveAuth from '@/lib/leave-auth'
import leaveContract from '@/lib/leave-contract'

const { assertRole } = leaveAuth
const { validateLeaveTypePayload } = leaveContract

function errorResponse(error) {
  return NextResponse.json({ error: error.message || 'Gagal memproses jenis cuti' }, { status: error.status || 500 })
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await dbConnect()
    const query = session.user.role === 'ADMIN' ? {} : { isActive: true }
    const data = await LeaveType.find(query).sort({ name: 1 })
    return NextResponse.json({ data })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    const accessError = assertRole(session, 'ADMIN')
    if (accessError) return NextResponse.json({ error: accessError.error }, { status: accessError.status })
    const body = await request.json()
    await dbConnect()
    const data = await LeaveType.create(validateLeaveTypePayload(body))
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    if (error.code === 11000) return NextResponse.json({ error: 'Kode jenis cuti sudah digunakan' }, { status: 409 })
    return errorResponse(error)
  }
}
