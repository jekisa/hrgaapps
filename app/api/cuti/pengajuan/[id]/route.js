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
import AuditLog from '@/models/AuditLog'
import leaveAuth from '@/lib/leave-auth'
import leaveReview from '@/lib/leave-review'
import { normalizeEmail } from '@/lib/leave-utils'
import leaveBalanceService from '@/lib/leave-balance'

const { assertRole, getEmployeeForSession } = leaveAuth
const { validateReviewPayload, shouldDeductLeaveQuota } = leaveReview
const { buildApprovalBalanceDecision, createMongooseLeaveBalanceRepository, createRolloverService, getJakartaYear } = leaveBalanceService
const rolloverLeaveBalances = createRolloverService(createMongooseLeaveBalanceRepository({ Karyawan, LeaveType, LeaveBalance, AuditLog }))

export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions)
  const accessError = assertRole(session, 'ADMIN')
  if (accessError) return NextResponse.json({ error: accessError.error }, { status: accessError.status })

  let review
  try {
    const { id } = await params
    review = validateReviewPayload(await request.json())
    await dbConnect()
    const pendingRequest = await LeaveRequest.findOne({ _id: id, status: 'pending' }).lean()
    const pendingType = pendingRequest ? await LeaveType.findById(pendingRequest.leaveTypeId).select('code deductsQuota').lean() : null
    if (pendingRequest && shouldDeductLeaveQuota(pendingType)) {
      const year = getJakartaYear(pendingRequest.startDate)
      const balanceExists = await LeaveBalance.exists({ employeeId: pendingRequest.employeeId, leaveTypeId: pendingRequest.leaveTypeId, year })
      if (!balanceExists) await rolloverLeaveBalances(year, { employeeId: pendingRequest.employeeId })
    }
    const reviewer = await getEmployeeForSession(session, { dbConnect, User, Karyawan })
    const mongoSession = await mongoose.startSession()
    let updatedRequest = null
    let approvalIssue = null
    try {
      await mongoSession.withTransaction(async () => {
        const current = await LeaveRequest.findOne({ _id: id, status: 'pending' }).session(mongoSession).lean()
        if (!current) return
        const leaveType = await LeaveType.findById(current.leaveTypeId).session(mongoSession).lean()
        let balance = null
        let approvalDecision = null
        const deductsQuota = shouldDeductLeaveQuota(leaveType)
        if (review.status === 'approved' && deductsQuota) {
          balance = await LeaveBalance.findOne({ employeeId: current.employeeId, leaveTypeId: current.leaveTypeId, year: getJakartaYear(current.startDate) }).session(mongoSession).lean()
          if (!balance || !leaveType) {
            approvalIssue = { error: 'Saldo cuti tahun pengajuan tidak ditemukan', status: 409 }
            return
          }
          approvalDecision = buildApprovalBalanceDecision(balance, current.totalDays, leaveType.allowDebt === true)
          if (!approvalDecision.canApprove) {
            approvalIssue = { error: `Saldo tidak cukup untuk ${leaveType.name}; jenis cuti ini tidak mengizinkan hutang`, status: 409 }
            return
          }
          if (approvalDecision.requiresDebtConfirmation && !review.confirmDebt) {
            approvalIssue = {
              error: `Approve ini akan membuat sisa cuti menjadi ${approvalDecision.projectedRemaining} hari (hutang cuti)`,
              status: 409,
              requiresDebtConfirmation: true,
              projectedRemaining: approvalDecision.projectedRemaining,
            }
            return
          }
        }
        updatedRequest = await LeaveRequest.findOneAndUpdate(
          { _id: id, status: 'pending' },
          { $set: { status: review.status, reviewedAt: new Date(), reviewedBy: reviewer?._id || null, reviewNote: review.reviewNote } },
          { new: true, session: mongoSession }
        ).lean()
        if (updatedRequest && review.status === 'approved' && deductsQuota) {
          await LeaveBalance.updateOne(
            { employeeId: current.employeeId, leaveTypeId: current.leaveTypeId, year: getJakartaYear(current.startDate) },
            { $inc: { used: current.totalDays } },
            { session: mongoSession, runValidators: true }
          )
        }
        if (updatedRequest) {
          await AuditLog.create([{
            userId: session.user.id,
            aksi: 'UPDATE',
            modul: 'CUTI',
            detail: `Mengubah status pengajuan cuti menjadi ${review.status}${approvalDecision?.requiresDebtConfirmation ? ` dengan saldo akhir ${approvalDecision.projectedRemaining} hari` : ''}`,
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1',
          }], { session: mongoSession })
        }
      })
    } finally {
      await mongoSession.endSession()
    }
    if (approvalIssue) return NextResponse.json(approvalIssue, { status: approvalIssue.status })
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
    return NextResponse.json(updatedRequest)
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Gagal memproses review cuti' }, { status: error.status || 500 })
  }
}
