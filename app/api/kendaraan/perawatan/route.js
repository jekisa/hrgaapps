import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import PerawatanKendaraan from '@/models/PerawatanKendaraan'
import { createAuditLog, getIpAddress } from '@/lib/server-utils'

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const status = searchParams.get('status') || ''

  await dbConnect()

  const query = status ? { status } : {}

  const [total, data] = await Promise.all([
    PerawatanKendaraan.countDocuments(query),
    PerawatanKendaraan.find(query)
      .sort({ tanggal: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('kendaraanId', 'noPol merk model'),
  ])

  const result = data.map((d) => {
    const item = d.toJSON()
    item.kendaraan = item.kendaraanId
    delete item.kendaraanId
    return item
  })

  return NextResponse.json({ data: result, total, totalPages: Math.ceil(total / limit) })
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    await dbConnect()

    const record = await PerawatanKendaraan.create({
      kendaraanId: body.kendaraanId,
      tanggal: new Date(body.tanggal),
      jenisPerawatan: body.jenisPerawatan || null,
      deskripsi: body.deskripsi || null,
      biaya: body.biaya ? parseFloat(body.biaya) : null,
      bengkel: body.bengkel || null,
      kmServis: body.kmServis ? parseInt(body.kmServis) : null,
      kmServisBerikutnya: body.kmServisBerikutnya ? parseInt(body.kmServisBerikutnya) : null,
      status: body.status || 'TERJADWAL',
    })

    await createAuditLog(session.user.id, 'CREATE', 'PERAWATAN_KENDARAAN', 'Tambah jadwal perawatan', getIpAddress(request))
    return NextResponse.json(record, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Gagal' }, { status: 500 })
  }
}

export async function PUT(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    await dbConnect()

    const record = await PerawatanKendaraan.findByIdAndUpdate(
      body.id,
      {
        tanggal: new Date(body.tanggal),
        jenisPerawatan: body.jenisPerawatan || null,
        deskripsi: body.deskripsi || null,
        biaya: body.biaya ? parseFloat(body.biaya) : null,
        bengkel: body.bengkel || null,
        kmServis: body.kmServis ? parseInt(body.kmServis) : null,
        kmServisBerikutnya: body.kmServisBerikutnya ? parseInt(body.kmServisBerikutnya) : null,
        status: body.status || 'TERJADWAL',
      },
      { new: true }
    )

    return NextResponse.json(record)
  } catch {
    return NextResponse.json({ error: 'Gagal update' }, { status: 500 })
  }
}