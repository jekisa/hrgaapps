import mongoose from 'mongoose'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import User from '@/models/User'
import Karyawan from '@/models/Karyawan'
import LeaveRequest from '@/models/LeaveRequest'
import LeaveBalance from '@/models/LeaveBalance'
import LeaveType from '@/models/LeaveType'
import Notifikasi from '@/models/Notifikasi'
import leaveAuth from '@/lib/leave-auth'
import leaveReview from '@/lib/leave-review'
import { createAuditLog, getIpAddress } from '@/lib/server-utils'
import { normalizeEmail } from '@/lib/leave-utils'

const { assertRole, getEmployeeForSession } = leaveAuth
const { validateReviewPayload } = leaveReview

export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions)
  const accessError = assertRole(session, 'ADMIN')
  if (accessError) return NextResponse.json({ error: accessError.error }, { status: accessError.status })

  let review
  try {
    review = validateReviewPayload(await request.json())
    await dbConnect()
    const reviewer = await getEmployeeForSession(session, { dbConnect, User, Karyawan })
    const mongoSession = await mongoose.startSession()
    let updatedRequest = null
    try {
      await mongoSession.withTransaction(async () => {
        const current = await LeaveRequest.findOne({ _id: params.id, status: 'pending' }).session(mongoSession).lean()
        if (!current) return
        const leaveType = await LeaveType.findById(current.leaveTypeId).session(mongoSession).lean()
        updatedRequest = await LeaveRequest.findOneAndUpdate(
          { _id: params.id, status: 'pending' },
          { $set: { status: review.status, reviewedAt: new Date(), reviewedBy: reviewer?._id || null, reviewNote: review.reviewNote } },
          { new: true, session: mongoSession }
        ).lean()
        if (review.status === 'approved') {
          await LeaveBalance.findOneAndUpdate(
            { employeeId: current.employeeId, leaveTypeId: current.leaveTypeId, year: current.startDate.getFullYear() },
            { $setOnInsert: { quota: leaveType?.defaultQuotaPerYear || 0 }, $inc: { used: current.totalDays } },
            { upsert: true, new: true, session: mongoSession, setDefaultsOnInsert: true }
          )
        }
      })
    } finally {
      await mongoSession.endSession()
    }
    if (!updatedRequest) return NextResponse.json({ error: 'Pengajuan sudah diproses atau tidak ditemukan' }, { status: 409 })
    const applicant = await Karyawan.findById(updatedRequest.employeeId).select('email').lean()
    const applicantEmail = normalizeEmail(applicant?.email)
    if (applicantEmail) {
      const staffUsers = await User.find({ role: 'STAFF' }).select('_id email').lean()
      const recipient = staffUsers.find((user) => normalizeEmail(user.email) === applicantEmail)
      if (recipient) {
        await Notifikasi.create({
          judul: `Pengajuan Cuti ${review.status === 'approved' ? 'Disetujui' : 'Ditolak'}`,
          pesan: review.reviewNote || 'Status pengajuan cuti diperbarui',
          tipe: 'CUTI',
          targetId: updatedRequest.employeeId,
          recipientUserId: recipient._id,
        })
      }
    }
    await createAuditLog(session.user.id, 'UPDATE', 'CUTI', `Mengubah status pengajuan cuti menjadi ${review.status}`, getIpAddress(request))
    return NextResponse.json(updatedRequest)
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Gagal memproses review cuti' }, { status: error.status || 500 })
  }
}
