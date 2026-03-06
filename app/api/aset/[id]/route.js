import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { createAuditLog, getIpAddress } from '@/lib/utils'

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const aset = await prisma.aset.findUnique({
    where: { id: parseInt(params.id) },
    include: {
      peminjaman: {
        orderBy: { createdAt: 'desc' },
        include: { karyawan: { select: { nama: true, nik: true } } },
      },
    },
  })

  if (!aset) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })
  return NextResponse.json(aset)
}

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const id = parseInt(params.id)

    const aset = await prisma.aset.update({
      where: { id },
      data: {
        namaAset: body.namaAset,
        kategori: body.kategori,
        merk: body.merk || null,
        model: body.model || null,
        serialNumber: body.serialNumber || null,
        tahunPerolehan: body.tahunPerolehan ? parseInt(body.tahunPerolehan) : null,
        nilaiPerolehan: body.nilaiPerolehan ? parseFloat(body.nilaiPerolehan) : null,
        kondisi: body.kondisi,
        status: body.status,
        lokasi: body.lokasi || null,
        keterangan: body.keterangan || null,
      },
    })

    await createAuditLog(prisma, session.user.id, 'UPDATE', 'ASET', `Update aset: ${body.namaAset}`, getIpAddress(request))
    return NextResponse.json(aset)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal update aset' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const id = parseInt(params.id)
    const aset = await prisma.aset.findUnique({ where: { id } })
    if (!aset) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })

    await prisma.aset.delete({ where: { id } })
    await createAuditLog(prisma, session.user.id, 'DELETE', 'ASET', `Hapus aset: ${aset.namaAset}`, getIpAddress(request))
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Gagal menghapus aset' }, { status: 500 })
  }
}
