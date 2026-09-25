import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import User from '@/models/User'
import Karyawan from '@/models/Karyawan'
import LeaveType from '@/models/LeaveType'
import LeaveBalance from '@/models/LeaveBalance'
import leaveAuth from '@/lib/leave-auth'
import leaveContract from '@/lib/leave-contract'

const { getEmployeeForSession } = leaveAuth
const { buildStaffScope } = leaveContract

function errorResponse(error) {
  return NextResponse.json({ error: error.message || 'Gagal mengambil saldo cuti' }, { status: error.status || 500 })
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await dbConnect()
    const year = Number.parseInt(new URL(request.url).searchParams.get('year') || new Date().getFullYear(), 10)
    const isAdmin = session.user.role === 'ADMIN'
    const employee = isAdmin ? null : await getEmployeeForSession(session, { dbConnect, User, Karyawan })
    const employeeQuery = isAdmin ? {} : buildStaffScope(session, 'STAFF', employee)
    const [employees, types] = await Promise.all([
      isAdmin ? Karyawan.find({ statusAktif: true }).select('nama email').lean() : Promise.resolve([employee]),
      LeaveType.find({ isActive: true }).sort({ name: 1 }).lean(),
    ])
    const data = (await Promise.all(employees.flatMap((item) => types.map(async (type) => {
      const balance = await LeaveBalance.findOneAndUpdate(
        { employeeId: item._id, leaveTypeId: type._id, year },
        { $setOnInsert: { quota: type.defaultQuotaPerYear, used: 0 } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).lean()
      return { ...balance, employee: item, leaveType: type, sisa: Math.max(balance.quota - balance.used, 0) }
    })))).filter((item) => item && (!employeeQuery.employeeId || String(item.employeeId) === String(employeeQuery.employeeId)))
    return NextResponse.json({ data, year })
  } catch (error) {
    return errorResponse(error)
  }
}
