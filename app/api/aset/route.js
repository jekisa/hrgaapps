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
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const kategori = searchParams.get('kategori') || ''

  const where = {
    AND: [
      search ? { OR: [{ namaAset: { contains: search } }, { kodeAset: { contains: search } }] } : {},
      status ? { status } : {},
      kategori ? { kategori } : {},
    ],
  }

  const [total, data] = await Promise.all([
    prisma.aset.count({ where }),
    prisma.aset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return NextResponse.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) })
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()

    const existing = await prisma.aset.findUnique({ where: { kodeAset: body.kodeAset } })
    if (existing) return NextResponse.json({ error: 'Kode aset sudah digunakan' }, { status: 400 })

    const aset = await prisma.aset.create({
      data: {
        kodeAset: body.kodeAset,
        namaAset: body.namaAset,
        kategori: body.kategori,
        merk: body.merk || null,
        model: body.model || null,
        serialNumber: body.serialNumber || null,
        tahunPerolehan: body.tahunPerolehan ? parseInt(body.tahunPerolehan) : null,
        nilaiPerolehan: body.nilaiPerolehan ? parseFloat(body.nilaiPerolehan) : null,
        kondisi: body.kondisi || 'BAIK',
        status: body.status || 'AKTIF',
        lokasi: body.lokasi || null,
        keterangan: body.keterangan || null,
      },
    })

    await createAuditLog(prisma, session.user.id, 'CREATE', 'ASET', `Tambah aset: ${body.namaAset}`, getIpAddress(request))
    return NextResponse.json(aset, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menambah aset' }, { status: 500 })
  }
}
