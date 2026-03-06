import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { createAuditLog, getIpAddress } from '@/lib/utils'

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const status = searchParams.get('status') || ''

  const where = status ? { status } : {}

  const [total, data] = await Promise.all([
    prisma.jadwalKendaraan.count({ where }),
    prisma.jadwalKendaraan.findMany({
      where,
      orderBy: { tanggalBerangkat: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { kendaraan: { select: { noPol: true, merk: true, model: true } } },
    }),
  ])

  return NextResponse.json({ data, total, totalPages: Math.ceil(total / limit) })
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()

    const record = await prisma.jadwalKendaraan.create({
      data: {
        kendaraanId: parseInt(body.kendaraanId),
        pengemudi: body.pengemudi || null,
        keperluan: body.keperluan || null,
        tujuan: body.tujuan || null,
        tanggalBerangkat: new Date(body.tanggalBerangkat),
        tanggalKembali: body.tanggalKembali ? new Date(body.tanggalKembali) : null,
        status: 'TERJADWAL',
        keterangan: body.keterangan || null,
      },
    })

    await prisma.kendaraan.update({ where: { id: parseInt(body.kendaraanId) }, data: { status: 'DIGUNAKAN' } })
    await createAuditLog(prisma, session.user.id, 'CREATE', 'JADWAL_KENDARAAN', `Buat jadwal kendaraan`, getIpAddress(request))
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

    const record = await prisma.jadwalKendaraan.update({
      where: { id: parseInt(id) },
      data: { status, ...(status === 'SELESAI' && { tanggalKembali: new Date() }) },
      include: { kendaraan: true },
    })

    if (status === 'SELESAI' || status === 'DIBATALKAN') {
      await prisma.kendaraan.update({ where: { id: record.kendaraanId }, data: { status: 'TERSEDIA' } })
    }

    return NextResponse.json(record)
  } catch {
    return NextResponse.json({ error: 'Gagal update status' }, { status: 500 })
  }
}
