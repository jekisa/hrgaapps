import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import Kendaraan from '@/models/Kendaraan'
import JadwalKendaraan from '@/models/JadwalKendaraan'
import { createAuditLog, getIpAddress } from '@/lib/server-utils'

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const status = searchParams.get('status') || ''

  await dbConnect()

  const query = status ? { status } : {}

  const [total, data] = await Promise.all([
    JadwalKendaraan.countDocuments(query),
    JadwalKendaraan.find(query)
      .sort({ tanggalBerangkat: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('kendaraanId', 'noPol merk model'),
  ])

  const result = data.map((d) => {
    const item = d.toJSON()
    item.kendaraan = item.kendaraanId
    delete item.kendaraanId
    return item
  })

  return NextResponse.json({ data: result, total, totalPages: Math.ceil(total / limit) })
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    await dbConnect()

    const record = await JadwalKendaraan.create({
      kendaraanId: body.kendaraanId,
      pengemudi: body.pengemudi || null,
      keperluan: body.keperluan || null,
      tujuan: body.tujuan || null,
      tanggalBerangkat: new Date(body.tanggalBerangkat),
      tanggalKembali: body.tanggalKembali ? new Date(body.tanggalKembali) : null,
      status: 'TERJADWAL',
      keterangan: body.keterangan || null,
    })

    await Kendaraan.findByIdAndUpdate(body.kendaraanId, { status: 'DIGUNAKAN' })
    await createAuditLog(session.user.id, 'CREATE', 'JADWAL_KENDARAAN', 'Buat jadwal kendaraan', getIpAddress(request))
    return NextResponse.json(record, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Gagal membuat jadwal' }, { status: 500 })
  }
}

export async function PATCH(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { id, status } = body
    await dbConnect()

    const record = await JadwalKendaraan.findByIdAndUpdate(
      id,
      { status, ...(status === 'SELESAI' && { tanggalKembali: new Date() }) },
      { new: true }
    )

    if (!record) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })

    if (status === 'SELESAI' || status === 'DIBATALKAN') {
      await Kendaraan.findByIdAndUpdate(record.kendaraanId, { status: 'TERSEDIA' })
    }

    return NextResponse.json(record)
  } catch {
    return NextResponse.json({ error: 'Gagal update status' }, { status: 500 })
  }
}