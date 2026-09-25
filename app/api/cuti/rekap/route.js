import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import LeaveBalance from '@/models/LeaveBalance'
import leaveAuth from '@/lib/leave-auth'
import leaveContract from '@/lib/leave-contract'

const { assertRole } = leaveAuth
const { buildRekapFilters } = leaveContract

export async function GET(request) {
  const session = await getServerSession(authOptions)
  const accessError = assertRole(session, 'ADMIN')
  if (accessError) return NextResponse.json({ error: accessError.error }, { status: accessError.status })
  try {
    const { searchParams } = new URL(request.url)
    const { year, employeeId, leaveTypeId } = buildRekapFilters({ year: searchParams.get('year'), employeeId: searchParams.get('employeeId'), leaveTypeId: searchParams.get('leaveTypeId') })
    await dbConnect()
    const query = { year }
    if (employeeId) query.employeeId = employeeId
    if (leaveTypeId) query.leaveTypeId = leaveTypeId
    const rows = await LeaveBalance.find(query).populate('employeeId', 'nama email').populate('leaveTypeId', 'name code').lean()
    const data = rows.map((row) => ({
      employeeId: row.employeeId?._id,
      employeeName: row.employeeId?.nama || 'Tanpa Nama',
      employeeEmail: row.employeeId?.email || '',
      leaveType: row.leaveTypeId?.name || 'Tanpa Jenis',
      quota: row.quota,
      used: row.used,
      remaining: Math.max(row.quota - row.used, 0),
      year: row.year,
    }))
    if (searchParams.get('format') === 'xlsx') {
      const sheetData = data.map((row) => ({
        'Nama Karyawan': row.employeeName,
        'Jenis Cuti': row.leaveType,
        Kuota: row.quota,
        Terpakai: row.used,
        Sisa: row.remaining,
        Tahun: row.year,
      }))
      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.json_to_sheet(sheetData)
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Cuti')
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
      return new NextResponse(buffer, { headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': `attachment; filename="rekap-cuti-${year}.xlsx"` } })
    }
    return NextResponse.json({ data, year })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil rekap cuti' }, { status: 500 })
  }
}
