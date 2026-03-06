import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { createAuditLog, getIpAddress } from '@/lib/utils'

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const karyawan = await prisma.karyawan.findUnique({
    where: { id: parseInt(params.id) },
    include: {
      riwayatJabatan: { orderBy: { tanggalMulai: 'desc' } },
      dokumen: { orderBy: { createdAt: 'desc' } },
      peminjaman: {
        where: { status: 'DIPINJAM' },
        include: { aset: { select: { namaAset: true, kodeAset: true } } },
      },
    },
  })

  if (!karyawan) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })
  return NextResponse.json(karyawan)
}

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const id = parseInt(params.id)

    // Check NIK uniqueness if changed
    if (body.nik) {
      const existing = await prisma.karyawan.findFirst({
        where: { nik: body.nik, NOT: { id } },
      })
      if (existing) return NextResponse.json({ error: 'NIK sudah digunakan' }, { status: 400 })
    }

    const karyawan = await prisma.karyawan.update({
      where: { id },
      data: {
        nik: body.nik,
        nama: body.nama,
        tempatLahir: body.tempatLahir || null,
        tanggalLahir: body.tanggalLahir ? new Date(body.tanggalLahir) : null,
        jenisKelamin: body.jenisKelamin || null,
        agama: body.agama || null,
        alamat: body.alamat || null,
        telepon: body.telepon || null,
        email: body.email || null,
        statusKontrak: body.statusKontrak,
        tanggalMasuk: body.tanggalMasuk ? new Date(body.tanggalMasuk) : null,
        tanggalKontrakBerakhir: body.tanggalKontrakBerakhir
          ? new Date(body.tanggalKontrakBerakhir)
          : null,
        departemen: body.departemen || null,
        jabatan: body.jabatan || null,
        statusAktif: body.statusAktif !== undefined ? body.statusAktif : true,
      },
    })

    await createAuditLog(
      prisma,
      session.user.id,
      'UPDATE',
      'KARYAWAN',
      `Update karyawan: ${body.nama}`,
      getIpAddress(request)
    )

    return NextResponse.json(karyawan)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal update karyawan' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const id = parseInt(params.id)
    const karyawan = await prisma.karyawan.findUnique({ where: { id } })
    if (!karyawan) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })

    await prisma.karyawan.delete({ where: { id } })

    await createAuditLog(
      prisma,
      session.user.id,
      'DELETE',
      'KARYAWAN',
      `Hapus karyawan: ${karyawan.nama}`,
      getIpAddress(request)
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus karyawan' }, { status: 500 })
  }
}
