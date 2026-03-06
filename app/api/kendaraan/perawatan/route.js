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
    prisma.perawatanKendaraan.count({ where }),
    prisma.perawatanKendaraan.findMany({
      where,
      orderBy: { tanggal: 'desc' },
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
    const record = await prisma.perawatanKendaraan.create({
      data: {
        kendaraanId: parseInt(body.kendaraanId),
        tanggal: new Date(body.tanggal),
        jenisPerawatan: body.jenisPerawatan || null,
        deskripsi: body.deskripsi || null,
        biaya: body.biaya ? parseFloat(body.biaya) : null,
        bengkel: body.bengkel || null,
        kmServis: body.kmServis ? parseInt(body.kmServis) : null,
        kmServisBerikutnya: body.kmServisBerikutnya ? parseInt(body.kmServisBerikutnya) : null,
        status: body.status || 'TERJADWAL',
      },
    })

    await createAuditLog(prisma, session.user.id, 'CREATE', 'PERAWATAN_KENDARAAN', `Tambah jadwal perawatan`, getIpAddress(request))
    return NextResponse.json(record, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Gagal' }, { status: 500 })
  }
}

export async function PUT(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const record = await prisma.perawatanKendaraan.update({
      where: { id: parseInt(body.id) },
      data: {
        tanggal: new Date(body.tanggal),
        jenisPerawatan: body.jenisPerawatan || null,
        deskripsi: body.deskripsi || null,
        biaya: body.biaya ? parseFloat(body.biaya) : null,
        bengkel: body.bengkel || null,
        kmServis: body.kmServis ? parseInt(body.kmServis) : null,
        kmServisBerikutnya: body.kmServisBerikutnya ? parseInt(body.kmServisBerikutnya) : null,
        status: body.status || 'TERJADWAL',
      },
    })
    return NextResponse.json(record)
  } catch {
    return NextResponse.json({ error: 'Gagal update' }, { status: 500 })
  }
}
