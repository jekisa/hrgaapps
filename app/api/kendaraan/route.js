import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { createAuditLog, getIpAddress } from '@/lib/utils'

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')

  const where = {
    AND: [
      search ? { OR: [{ noPol: { contains: search } }, { merk: { contains: search } }] } : {},
      status ? { status } : {},
    ],
  }

  const [total, data] = await Promise.all([
    prisma.kendaraan.count({ where }),
    prisma.kendaraan.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
  ])

  return NextResponse.json({ data, total, page, totalPages: Math.ceil(total / limit) })
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()

    const existing = await prisma.kendaraan.findUnique({ where: { noPol: body.noPol } })
    if (existing) return NextResponse.json({ error: 'Nomor polisi sudah terdaftar' }, { status: 400 })

    const kendaraan = await prisma.kendaraan.create({
      data: {
        noPol: body.noPol,
        merk: body.merk,
        model: body.model || null,
        tahun: body.tahun ? parseInt(body.tahun) : null,
        warna: body.warna || null,
        jenisKendaraan: body.jenisKendaraan || null,
        noRangka: body.noRangka || null,
        noMesin: body.noMesin || null,
        status: body.status || 'TERSEDIA',
        tanggalPajakBerakhir: body.tanggalPajakBerakhir ? new Date(body.tanggalPajakBerakhir) : null,
        tanggalSTNKBerakhir: body.tanggalSTNKBerakhir ? new Date(body.tanggalSTNKBerakhir) : null,
        keterangan: body.keterangan || null,
      },
    })

    // Create pajak notification if set
    if (body.tanggalPajakBerakhir) {
      await prisma.pembayaranPajak.create({
        data: {
          kendaraanId: kendaraan.id,
          jenisPajak: 'PKB',
          tahun: new Date(body.tanggalPajakBerakhir).getFullYear(),
          tanggalJatuhTempo: new Date(body.tanggalPajakBerakhir),
          status: 'BELUM',
        },
      })
    }

    await createAuditLog(prisma, session.user.id, 'CREATE', 'KENDARAAN', `Tambah kendaraan: ${body.noPol}`, getIpAddress(request))
    return NextResponse.json(kendaraan, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menambah kendaraan' }, { status: 500 })
  }
}
