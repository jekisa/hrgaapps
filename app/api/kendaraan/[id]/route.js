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

    const kendaraan = await prisma.kendaraan.update({
      where: { id },
      data: {
        merk: body.merk,
        model: body.model || null,
        tahun: body.tahun ? parseInt(body.tahun) : null,
        warna: body.warna || null,
        jenisKendaraan: body.jenisKendaraan || null,
        noRangka: body.noRangka || null,
        noMesin: body.noMesin || null,
        status: body.status,
        tanggalPajakBerakhir: body.tanggalPajakBerakhir ? new Date(body.tanggalPajakBerakhir) : null,
        tanggalSTNKBerakhir: body.tanggalSTNKBerakhir ? new Date(body.tanggalSTNKBerakhir) : null,
        keterangan: body.keterangan || null,
      },
    })

    await createAuditLog(prisma, session.user.id, 'UPDATE', 'KENDARAAN', `Update kendaraan: ${kendaraan.noPol}`, getIpAddress(request))
    return NextResponse.json(kendaraan)
  } catch {
    return NextResponse.json({ error: 'Gagal update' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const id = parseInt(params.id)
    await prisma.kendaraan.delete({ where: { id } })
    await createAuditLog(prisma, session.user.id, 'DELETE', 'KENDARAAN', `Hapus kendaraan ID: ${id}`, getIpAddress(request))
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Gagal hapus' }, { status: 500 })
  }
}
