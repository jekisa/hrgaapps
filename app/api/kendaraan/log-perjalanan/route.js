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
  const kendaraanId = searchParams.get('kendaraanId') || ''

  const where = kendaraanId ? { kendaraanId: parseInt(kendaraanId) } : {}

  const [total, data] = await Promise.all([
    prisma.logPerjalanan.count({ where }),
    prisma.logPerjalanan.findMany({
      where,
      orderBy: { tanggal: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        kendaraan: { select: { noPol: true, merk: true } },
        karyawan: { select: { nama: true } },
      },
    }),
  ])

  return NextResponse.json({ data, total, totalPages: Math.ceil(total / limit) })
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const kmAwal = body.kmAwal ? parseInt(body.kmAwal) : null
    const kmAkhir = body.kmAkhir ? parseInt(body.kmAkhir) : null

    const record = await prisma.logPerjalanan.create({
      data: {
        kendaraanId: parseInt(body.kendaraanId),
        karyawanId: body.karyawanId ? parseInt(body.karyawanId) : null,
        tanggal: new Date(body.tanggal),
        tujuan: body.tujuan || null,
        keperluan: body.keperluan || null,
        kmAwal,
        kmAkhir,
        totalKm: kmAwal && kmAkhir ? kmAkhir - kmAwal : null,
        bbm: body.bbm ? parseFloat(body.bbm) : null,
        keterangan: body.keterangan || null,
      },
    })

    await createAuditLog(prisma, session.user.id, 'CREATE', 'LOG_PERJALANAN', `Log perjalanan kendaraan`, getIpAddress(request))
    return NextResponse.json(record, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Gagal menyimpan log' }, { status: 500 })
  }
}
