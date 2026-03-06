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
    prisma.peminjamanAset.count({ where }),
    prisma.peminjamanAset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        aset: { select: { namaAset: true, kodeAset: true, kategori: true } },
        karyawan: { select: { nama: true, nik: true, jabatan: true } },
      },
    }),
  ])

  return NextResponse.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) })
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()

    // Check if asset is available
    const aset = await prisma.aset.findUnique({ where: { id: parseInt(body.asetId) } })
    if (!aset) return NextResponse.json({ error: 'Aset tidak ditemukan' }, { status: 404 })
    if (aset.status !== 'AKTIF') {
      return NextResponse.json({ error: `Aset tidak dapat dipinjam (status: ${aset.status})` }, { status: 400 })
    }

    const peminjaman = await prisma.peminjamanAset.create({
      data: {
        asetId: parseInt(body.asetId),
        karyawanId: parseInt(body.karyawanId),
        tanggalPinjam: new Date(body.tanggalPinjam),
        tanggalRencanaKembali: body.tanggalRencanaKembali ? new Date(body.tanggalRencanaKembali) : null,
        keperluan: body.keperluan || null,
        status: 'DIPINJAM',
      },
    })

    // Update aset status
    await prisma.aset.update({ where: { id: parseInt(body.asetId) }, data: { status: 'DIPINJAM' } })

    await createAuditLog(prisma, session.user.id, 'CREATE', 'PEMINJAMAN_ASET', `Peminjaman aset: ${aset.namaAset}`, getIpAddress(request))
    return NextResponse.json(peminjaman, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal membuat peminjaman' }, { status: 500 })
  }
}

export async function PATCH(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { id } = body

    const peminjaman = await prisma.peminjamanAset.update({
      where: { id: parseInt(id) },
      data: {
        status: 'DIKEMBALIKAN',
        tanggalKembali: new Date(),
        keterangan: body.keterangan || null,
      },
    })

    // Update aset back to AKTIF
    await prisma.aset.update({ where: { id: peminjaman.asetId }, data: { status: 'AKTIF' } })

    await createAuditLog(prisma, session.user.id, 'UPDATE', 'PEMINJAMAN_ASET', `Pengembalian aset ID: ${peminjaman.asetId}`, getIpAddress(request))
    return NextResponse.json(peminjaman)
  } catch {
    return NextResponse.json({ error: 'Gagal proses pengembalian' }, { status: 500 })
  }
}
