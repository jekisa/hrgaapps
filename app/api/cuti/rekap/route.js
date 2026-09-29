import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import mongoose from 'mongoose'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import LeaveBalance from '@/models/LeaveBalance'
import LeaveBalanceAdjustment from '@/models/LeaveBalanceAdjustment'
import Karyawan from '@/models/Karyawan'
import LeaveType from '@/models/LeaveType'
import LeaveRequest from '@/models/LeaveRequest'
import AuditLog from '@/models/AuditLog'
import leaveAuth from '@/lib/leave-auth'
import leaveContract from '@/lib/leave-contract'
import leaveRekap from '@/lib/leave-rekap'
import leaveBalanceService from '@/lib/leave-balance'
import leaveAbsence from '@/lib/leave-absence'

const { assertRole } = leaveAuth
const { buildRekapFilters, validateBalanceCorrectionPayload } = leaveContract
const { filterActiveLeaveBalanceRows, groupLeaveBalanceRows } = leaveRekap
const { countApprovedAbsenceDays } = leaveAbsence
const { buildBalanceCorrection, createMongooseLeaveBalanceRepository, createRolloverService, getCarriedDebt, getJakartaYear, getRemainingBalance } = leaveBalanceService
const rolloverLeaveBalances = createRolloverService(createMongooseLeaveBalanceRepository({ Karyawan, LeaveType, LeaveBalance, AuditLog }))

export async function GET(request) {
  const session = await getServerSession(authOptions)
  const accessError = assertRole(session, 'ADMIN')
  if (accessError) return NextResponse.json({ error: accessError.error }, { status: accessError.status })
  try {
    const { searchParams } = new URL(request.url)
    const { year, employeeId, leaveTypeId } = buildRekapFilters({ year: searchParams.get('year') || getJakartaYear(), employeeId: searchParams.get('employeeId'), leaveTypeId: searchParams.get('leaveTypeId') })
    await dbConnect()
    if (year === getJakartaYear()) await rolloverLeaveBalances(year)
    const query = { year }
    if (employeeId) query.employeeId = employeeId
    if (leaveTypeId) query.leaveTypeId = leaveTypeId
    const rows = await LeaveBalance.find(query).populate('employeeId', 'nama email foto jenisKelamin statusAktif').populate('leaveTypeId', 'name code allowDebt').lean()
    const flatData = rows.map((row) => ({
      employeeId: row.employeeId?._id?.toString(),
      employeeName: row.employeeId?.nama || 'Tanpa Nama',
      employeeEmail: row.employeeId?.email || '',
      employeeGender: row.employeeId?.jenisKelamin || null,
      employeePhoto: row.employeeId?.foto || null,
      employeeIsActive: row.employeeId?.statusAktif === true,
      leaveTypeId: row.leaveTypeId?._id?.toString(),
      leaveType: row.leaveTypeId?.name || 'Tanpa Jenis',
      leaveTypeCode: row.leaveTypeId?.code || '',
      quota: row.quota,
      used: row.used,
      carriedDebt: Number(row.carriedDebt || 0),
      adminAdjustment: Number(row.adminAdjustment || 0),
      allowDebt: row.leaveTypeId?.allowDebt === true,
      remaining: getRemainingBalance(row),
      year: row.year,
    }))
    if (searchParams.get('format') === 'xlsx') {
      const sheetData = flatData.map((row) => ({
        'Nama Karyawan': row.employeeName,
        'Jenis Cuti': row.leaveType,
        Kuota: row.quota,
        Terpakai: row.used,
        'Hutang Bawaan': row.carriedDebt,
        'Koreksi Admin': row.adminAdjustment,
        Sisa: row.remaining,
        Tahun: row.year,
      }))
      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.json_to_sheet(sheetData)
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Cuti')
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
      return new NextResponse(buffer, { headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': `attachment; filename="rekap-cuti-${year}.xlsx"` } })
    }
    const employeeIds = [...new Set(flatData.map((row) => row.employeeId).filter(Boolean))]
    const yearRequests = employeeIds.length ? await LeaveRequest.find({
      employeeId: { $in: employeeIds }, status: 'approved',
      startDate: { $lt: new Date(Date.UTC(year + 1, 0, 2)) },
      endDate: { $gte: new Date(Date.UTC(year - 1, 11, 30)) },
    }).select('employeeId startDate endDate status').lean() : []
    const pendingSickType = await LeaveType.findOne({ code: 'sick' }).select('_id').lean()
    const pendingSick = pendingSickType && employeeIds.length ? await LeaveRequest.find({
      employeeId: { $in: employeeIds }, leaveTypeId: pendingSickType._id, status: 'pending',
      $or: [{ verificationStatus: 'pending' }, { verificationStatus: null }],
    }).select('employeeId').lean() : []
    const employees = groupLeaveBalanceRows(filterActiveLeaveBalanceRows(flatData))
    for (const employee of employees) {
      employee.totalDaysAbsent = countApprovedAbsenceDays(yearRequests.filter((item) => String(item.employeeId) === employee.employeeId), year)
      employee.pendingDoctorCertificateCount = pendingSick.filter((item) => String(item.employeeId) === employee.employeeId).length
    }
    return NextResponse.json({ data: employees, year })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil rekap cuti' }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions)
    const accessError = assertRole(session, 'ADMIN')
    if (accessError) return NextResponse.json({ error: accessError.error }, { status: accessError.status })

    const payload = validateBalanceCorrectionPayload(await request.json())
    if (!mongoose.isValidObjectId(payload.employeeId) || !mongoose.isValidObjectId(payload.leaveTypeId)) {
      return NextResponse.json({ error: 'Karyawan atau jenis cuti tidak valid' }, { status: 422 })
    }
    await dbConnect()
    const mongoSession = await mongoose.startSession()
    let result
    try {
      await mongoSession.withTransaction(async () => {
        const filter = { employeeId: payload.employeeId, leaveTypeId: payload.leaveTypeId, year: payload.year }
        const balance = await LeaveBalance.findOne(filter).session(mongoSession).lean()
        if (!balance) throw Object.assign(new Error('Saldo cuti tidak ditemukan'), { status: 404 })
        const leaveType = await LeaveType.findById(payload.leaveTypeId).session(mongoSession).lean()
        if (!leaveType) throw Object.assign(new Error('Jenis cuti tidak ditemukan'), { status: 404 })
        const correction = buildBalanceCorrection(balance, payload.remaining, leaveType.allowDebt === true, payload.reason)
        await LeaveBalance.updateOne(filter, { $set: { adminAdjustment: correction.adminAdjustment } }, { session: mongoSession, runValidators: true })
        await LeaveBalanceAdjustment.create([{
          employeeId: payload.employeeId,
          leaveTypeId: payload.leaveTypeId,
          year: payload.year,
          adminId: session.user.id,
          previousRemaining: correction.previousRemaining,
          newRemaining: correction.newRemaining,
          reason: correction.reason,
        }], { session: mongoSession })
        await AuditLog.create([{
          userId: session.user.id,
          aksi: 'UPDATE',
          modul: 'CUTI',
          detail: `Koreksi saldo ${leaveType.name}: ${correction.previousRemaining} menjadi ${correction.newRemaining} hari${correction.reason ? `. Alasan: ${correction.reason}` : ''}`,
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1',
        }], { session: mongoSession })

        const nextYearFilter = { employeeId: payload.employeeId, leaveTypeId: payload.leaveTypeId, year: payload.year + 1 }
        const nextYearBalance = await LeaveBalance.findOne(nextYearFilter).session(mongoSession).lean()
        if (nextYearBalance) {
          await LeaveBalance.updateOne(nextYearFilter, { $set: { carriedDebt: getCarriedDebt(correction.newRemaining, leaveType.allowDebt === true) } }, { session: mongoSession, runValidators: true })
        }
        result = { ...balance, adminAdjustment: correction.adminAdjustment, remaining: correction.newRemaining }
      })
    } finally {
      await mongoSession.endSession()
    }
    return NextResponse.json({ data: result })
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Gagal memperbarui kuota cuti' }, { status: error.status || 500 })
  }
}
