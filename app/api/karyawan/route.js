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
  const departemen = searchParams.get('departemen') || ''

  const where = {
    AND: [
      search
        ? {
            OR: [
              { nama: { contains: search } },
              { nik: { contains: search } },
              { jabatan: { contains: search } },
              { departemen: { contains: search } },
            ],
          }
        : {},
      status ? { statusKontrak: status } : {},
      departemen ? { departemen } : {},
    ],
  }

  const [total, data] = await Promise.all([
    prisma.karyawan.count({ where }),
    prisma.karyawan.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        nik: true,
        nama: true,
        jabatan: true,
        departemen: true,
        statusKontrak: true,
        tanggalMasuk: true,
        tanggalKontrakBerakhir: true,
        statusAktif: true,
        telepon: true,
        email: true,
        foto: true,
        tanggalLahir: true,
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

    const existing = await prisma.karyawan.findUnique({ where: { nik: body.nik } })
    if (existing) {
      return NextResponse.json({ error: 'NIK sudah terdaftar' }, { status: 400 })
    }

    const karyawan = await prisma.karyawan.create({
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
        statusKontrak: body.statusKontrak || 'PKWTT',
        tanggalMasuk: body.tanggalMasuk ? new Date(body.tanggalMasuk) : null,
        tanggalKontrakBerakhir: body.tanggalKontrakBerakhir
          ? new Date(body.tanggalKontrakBerakhir)
          : null,
        departemen: body.departemen || null,
        jabatan: body.jabatan || null,
      },
    })

    // Create initial riwayat jabatan
    if (body.jabatan && body.tanggalMasuk) {
      await prisma.riwayatJabatan.create({
        data: {
          karyawanId: karyawan.id,
          jabatan: body.jabatan,
          departemen: body.departemen || null,
          tanggalMulai: new Date(body.tanggalMasuk),
          keterangan: 'Penempatan awal',
        },
      })
    }

    // Create notification if contract-based
    if (body.statusKontrak === 'PKWT' && body.tanggalKontrakBerakhir) {
      await prisma.notifikasi.create({
        data: {
          judul: 'Karyawan PKWT Ditambahkan',
          pesan: `Karyawan ${body.nama} dengan status PKWT, kontrak berakhir ${new Date(body.tanggalKontrakBerakhir).toLocaleDateString('id-ID')}`,
          tipe: 'KONTRAK',
          targetId: karyawan.id,
        },
      })
    }

    await createAuditLog(
      prisma,
      session.user.id,
      'CREATE',
      'KARYAWAN',
      `Menambah karyawan: ${body.nama} (${body.nik})`,
      getIpAddress(request)
    )

    return NextResponse.json(karyawan, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal menambah karyawan' }, { status: 500 })
  }
}
