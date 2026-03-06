import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { createAuditLog, getIpAddress } from '@/lib/utils'

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const tahun = parseInt(searchParams.get('tahun') || new Date().getFullYear())
  const jenis = searchParams.get('jenis') || ''

  const where = { tahun, ...(jenis && { jenis }) }

  const data = await prisma.utilitas.findMany({
    where,
    orderBy: [{ jenis: 'asc' }, { bulan: 'desc' }],
  })

  // Summary by jenis
  const summary = await prisma.utilitas.groupBy({
    by: ['jenis'],
    where: { tahun },
    _sum: { tagihan: true },
    _count: { id: true },
  })

  return NextResponse.json({ data, summary })
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()

    const record = await prisma.utilitas.create({
      data: {
        jenis: body.jenis,
        bulan: parseInt(body.bulan),
        tahun: parseInt(body.tahun),
        tagihan: body.tagihan ? parseFloat(body.tagihan) : null,
        penggunaan: body.penggunaan ? parseFloat(body.penggunaan) : null,
        satuan: body.satuan || null,
        statusBayar: body.statusBayar || 'BELUM',
        tanggalBayar: body.tanggalBayar ? new Date(body.tanggalBayar) : null,
        keterangan: body.keterangan || null,
      },
    })

    await createAuditLog(prisma, session.user.id, 'CREATE', 'UTILITAS', `Tambah utilitas: ${body.jenis} bulan ${body.bulan}/${body.tahun}`, getIpAddress(request))
    return NextResponse.json(record, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Gagal menyimpan utilitas' }, { status: 500 })
  }
}

export async function PUT(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const record = await prisma.utilitas.update({
      where: { id: parseInt(body.id) },
      data: {
        tagihan: body.tagihan ? parseFloat(body.tagihan) : null,
        penggunaan: body.penggunaan ? parseFloat(body.penggunaan) : null,
        statusBayar: body.statusBayar,
        tanggalBayar: body.tanggalBayar ? new Date(body.tanggalBayar) : null,
        keterangan: body.keterangan || null,
      },
    })
    await createAuditLog(prisma, session.user.id, 'UPDATE', 'UTILITAS', `Update utilitas ID: ${body.id}`, getIpAddress(request))
    return NextResponse.json(record)
  } catch {
    return NextResponse.json({ error: 'Gagal update' }, { status: 500 })
  }
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = parseInt(searchParams.get('id'))
  await prisma.utilitas.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
