import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import LeaveType from '@/models/LeaveType'
import LeaveRequest from '@/models/LeaveRequest'
import leaveAuth from '@/lib/leave-auth'
import leaveContract from '@/lib/leave-contract'

const { assertRole } = leaveAuth
const { validateLeaveTypePayload } = leaveContract

function errorResponse(error) {
  return NextResponse.json({ error: error.message || 'Gagal memproses jenis cuti' }, { status: error.status || 500 })
}

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    const accessError = assertRole(session, 'ADMIN')
    if (accessError) return NextResponse.json({ error: accessError.error }, { status: accessError.status })
    await dbConnect()
    const data = await LeaveType.findByIdAndUpdate(params.id, { $set: validateLeaveTypePayload(await request.json()) }, { new: true, runValidators: true })
    if (!data) return NextResponse.json({ error: 'Jenis cuti tidak ditemukan' }, { status: 404 })
    return NextResponse.json(data)
  } catch (error) {
    return errorResponse(error)
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    const accessError = assertRole(session, 'ADMIN')
    if (accessError) return NextResponse.json({ error: accessError.error }, { status: accessError.status })
    await dbConnect()
    if (await LeaveRequest.exists({ leaveTypeId: params.id })) {
      return NextResponse.json({ error: 'Jenis cuti sudah digunakan. Nonaktifkan jenis cuti sebagai gantinya.' }, { status: 409 })
    }
    const data = await LeaveType.findByIdAndDelete(params.id)
    if (!data) return NextResponse.json({ error: 'Jenis cuti tidak ditemukan' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    return errorResponse(error)
  }
}
