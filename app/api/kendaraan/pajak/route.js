import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { createAuditLog, getIpAddress } from '@/lib/utils'

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || ''

  const where = status ? { status } : {}

  const data = await prisma.pembayaranPajak.findMany({
    where,
    orderBy: { tanggalJatuhTempo: 'asc' },
    include: { kendaraan: { select: { noPol: true, merk: true, model: true } } },
  })

  return NextResponse.json(data)
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const record = await prisma.pembayaranPajak.create({
      data: {
        kendaraanId: parseInt(body.kendaraanId),
        jenisPajak: body.jenisPajak,
        tahun: body.tahun ? parseInt(body.tahun) : null,
        tanggalJatuhTempo: body.tanggalJatuhTempo ? new Date(body.tanggalJatuhTempo) : null,
        jumlah: body.jumlah ? parseFloat(body.jumlah) : null,
        status: body.status || 'BELUM',
        keterangan: body.keterangan || null,
      },
    })
    await createAuditLog(prisma, session.user.id, 'CREATE', 'PAJAK_KENDARAAN', `Tambah pajak kendaraan`, getIpAddress(request))
    return NextResponse.json(record, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Gagal' }, { status: 500 })
  }
}

export async function PATCH(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const record = await prisma.pembayaranPajak.update({
      where: { id: parseInt(body.id) },
      data: {
        status: 'SUDAH',
        tanggalBayar: new Date(),
        jumlah: body.jumlah ? parseFloat(body.jumlah) : undefined,
        keterangan: body.keterangan || null,
      },
    })

    // Update kendaraan's tax date if provided
    if (body.tanggalPajakBaruBerakhir) {
      await prisma.kendaraan.update({
        where: { id: record.kendaraanId },
        data: { tanggalPajakBerakhir: new Date(body.tanggalPajakBaruBerakhir) },
      })
    }

    await createAuditLog(prisma, session.user.id, 'UPDATE', 'PAJAK_KENDARAAN', `Bayar pajak ID: ${body.id}`, getIpAddress(request))
    return NextResponse.json(record)
  } catch {
    return NextResponse.json({ error: 'Gagal bayar pajak' }, { status: 500 })
  }
}
