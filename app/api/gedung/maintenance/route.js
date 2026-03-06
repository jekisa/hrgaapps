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
  const prioritas = searchParams.get('prioritas') || ''
  const search = searchParams.get('search') || ''

  const where = {
    AND: [
      search ? { OR: [{ judul: { contains: search } }, { lokasi: { contains: search } }] } : {},
      status ? { status } : {},
      prioritas ? { prioritas } : {},
    ],
  }

  const [total, data] = await Promise.all([
    prisma.maintenanceRequest.count({ where }),
    prisma.maintenanceRequest.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
  ])

  return NextResponse.json({ data, total, page, totalPages: Math.ceil(total / limit) })
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const record = await prisma.maintenanceRequest.create({
      data: {
        judul: body.judul,
        lokasi: body.lokasi || null,
        kategori: body.kategori || null,
        deskripsi: body.deskripsi || null,
        prioritas: body.prioritas || 'NORMAL',
        status: 'PENDING',
        pemohon: body.pemohon || null,
      },
    })
    await createAuditLog(prisma, session.user.id, 'CREATE', 'MAINTENANCE', `Buat request: ${body.judul}`, getIpAddress(request))
    return NextResponse.json(record, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Gagal membuat request' }, { status: 500 })
  }
}
