import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import Karyawan from '@/models/Karyawan'
import LeaveType from '@/models/LeaveType'
import LeaveBalance from '@/models/LeaveBalance'
import AuditLog from '@/models/AuditLog'
import leaveAuth from '@/lib/leave-auth'
import leaveBalance from '@/lib/leave-balance'
const { getRemainingBalance } = leaveBalance

const { assertRole } = leaveAuth
const { createMongooseLeaveBalanceRepository, createRolloverService, getJakartaYear } = leaveBalance
const rolloverLeaveBalances = createRolloverService(createMongooseLeaveBalanceRepository({ Karyawan, LeaveType, LeaveBalance, AuditLog }))

function errorResponse(error) {
  return NextResponse.json({ error: error.message || 'Gagal mengambil saldo cuti' }, { status: error.status || 500 })
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const accessError = assertRole(session, 'ADMIN')
    if (accessError) return NextResponse.json({ error: accessError.error }, { status: accessError.status })
    await dbConnect()
    const currentYear = getJakartaYear()
    const year = Number.parseInt(new URL(request.url).searchParams.get('year') || currentYear, 10)
    if (year === currentYear) await rolloverLeaveBalances(year)
    const employees = await Karyawan.find({ statusAktif: true }).select('nama email').lean()
    const types = await LeaveType.find({ isActive: true }).sort({ name: 1 }).lean()
    const data = (await Promise.all(employees.flatMap((item) => types.map(async (type) => {
      const balance = await LeaveBalance.findOneAndUpdate(
        { employeeId: item._id, leaveTypeId: type._id, year },
        { $setOnInsert: { quota: type.defaultQuotaPerYear, used: 0 } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).lean()
      return { ...balance, employee: item, leaveType: type, sisa: getRemainingBalance(balance) }
    })))).filter(Boolean)
    return NextResponse.json({ data, year })
  } catch (error) {
    return errorResponse(error)
  }
}
