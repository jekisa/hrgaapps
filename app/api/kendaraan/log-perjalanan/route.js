import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import LogPerjalanan from '@/models/LogPerjalanan'
import { createAuditLog, getIpAddress } from '@/lib/server-utils'

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const kendaraanId = searchParams.get('kendaraanId') || ''

  await dbConnect()

  const query = kendaraanId ? { kendaraanId } : {}

  const [total, data] = await Promise.all([
    LogPerjalanan.countDocuments(query),
    LogPerjalanan.find(query)
      .sort({ tanggal: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('kendaraanId', 'noPol merk')
      .populate('karyawanId', 'nama'),
  ])

  const result = data.map((d) => {
    const item = d.toJSON()
    item.kendaraan = item.kendaraanId
    item.karyawan = item.karyawanId
    delete item.kendaraanId
    delete item.karyawanId
    return item
  })

  return NextResponse.json({ data: result, total, totalPages: Math.ceil(total / limit) })
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const kmAwal = body.kmAwal ? parseInt(body.kmAwal) : null
    const kmAkhir = body.kmAkhir ? parseInt(body.kmAkhir) : null
    await dbConnect()

    const record = await LogPerjalanan.create({
      kendaraanId: body.kendaraanId,
      karyawanId: body.karyawanId || null,
      tanggal: new Date(body.tanggal),
      tujuan: body.tujuan || null,
      keperluan: body.keperluan || null,
      kmAwal,
      kmAkhir,
      totalKm: kmAwal && kmAkhir ? kmAkhir - kmAwal : null,
      bbm: body.bbm ? parseFloat(body.bbm) : null,
      keterangan: body.keterangan || null,
    })

    await createAuditLog(session.user.id, 'CREATE', 'LOG_PERJALANAN', 'Log perjalanan kendaraan', getIpAddress(request))
    return NextResponse.json(record, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Gagal menyimpan log' }, { status: 500 })
  }
}