import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { createAuditLog, getIpAddress } from '@/lib/utils'

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const id = parseInt(params.id)

    const record = await prisma.maintenanceRequest.update({
      where: { id },
      data: {
        judul: body.judul,
        lokasi: body.lokasi || null,
        kategori: body.kategori || null,
        deskripsi: body.deskripsi || null,
        prioritas: body.prioritas,
        status: body.status,
        pelaksana: body.pelaksana || null,
        biaya: body.biaya ? parseFloat(body.biaya) : null,
        tanggalSelesai: body.status === 'SELESAI' ? new Date() : null,
        keterangan: body.keterangan || null,
      },
    })

    await createAuditLog(prisma, session.user.id, 'UPDATE', 'MAINTENANCE', `Update maintenance: ${body.judul}`, getIpAddress(request))
    return NextResponse.json(record)
  } catch {
    return NextResponse.json({ error: 'Gagal update' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await prisma.maintenanceRequest.delete({ where: { id: parseInt(params.id) } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Gagal hapus' }, { status: 500 })
  }
}
