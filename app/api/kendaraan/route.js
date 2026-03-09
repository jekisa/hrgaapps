import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import Kendaraan from '@/models/Kendaraan'
import PembayaranPajak from '@/models/PembayaranPajak'
import { createAuditLog, getIpAddress } from '@/lib/server-utils'

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')

  await dbConnect()

  const query = {}
  if (search) {
    query.$or = [
      { noPol: { $regex: search, $options: 'i' } },
      { merk: { $regex: search, $options: 'i' } },
    ]
  }
  if (status) query.status = status

  const [total, data] = await Promise.all([
    Kendaraan.countDocuments(query),
    Kendaraan.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
  ])

  return NextResponse.json({ data, total, page, totalPages: Math.ceil(total / limit) })
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    await dbConnect()

    const existing = await Kendaraan.findOne({ noPol: body.noPol })
    if (existing) return NextResponse.json({ error: 'Nomor polisi sudah terdaftar' }, { status: 400 })

    const kendaraan = await Kendaraan.create({
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
    })

    if (body.tanggalPajakBerakhir) {
      await PembayaranPajak.create({
        kendaraanId: kendaraan._id,
        jenisPajak: 'PKB',
        tahun: new Date(body.tanggalPajakBerakhir).getFullYear(),
        tanggalJatuhTempo: new Date(body.tanggalPajakBerakhir),
        status: 'BELUM',
      })
    }

    await createAuditLog(session.user.id, 'CREATE', 'KENDARAAN', 'Tambah kendaraan', getIpAddress(request))
    return NextResponse.json(kendaraan, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menambah kendaraan' }, { status: 500 })
  }
}