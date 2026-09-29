import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Karyawan from '@/models/Karyawan'
import LeaveType from '@/models/LeaveType'
import LeaveBalance from '@/models/LeaveBalance'
import AuditLog from '@/models/AuditLog'
import leaveBalance from '@/lib/leave-balance'

const { createMongooseLeaveBalanceRepository, createRolloverService, getJakartaYear, isCronAuthorized } = leaveBalance

export const dynamic = 'force-dynamic'

export async function GET(request) {
  if (!isCronAuthorized(request.headers.get('authorization'), process.env.CRON_SECRET)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await dbConnect()
    const repository = createMongooseLeaveBalanceRepository({ Karyawan, LeaveType, LeaveBalance, AuditLog })
    const rolloverLeaveBalances = createRolloverService(repository)
    const result = await rolloverLeaveBalances(getJakartaYear(new Date()))
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error('Leave rollover failed:', error)
    return NextResponse.json({ error: 'Gagal menjalankan rollover saldo cuti' }, { status: 500 })
  }
}
