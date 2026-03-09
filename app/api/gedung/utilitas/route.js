import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import Utilitas from '@/models/Utilitas'
import { createAuditLog, getIpAddress } from '@/lib/server-utils'

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const tahun = parseInt(searchParams.get('tahun') || new Date().getFullYear())
  const jenis = searchParams.get('jenis') || ''

  await dbConnect()

  const query = { tahun, ...(jenis && { jenis }) }

  const data = await Utilitas.find(query).sort({ jenis: 1, bulan: -1 })

  const summary = await Utilitas.aggregate([
    { $match: { tahun } },
    {
      $group: {
        _id: '$jenis',
        total: { $sum: '$tagihan' },
        count: { $sum: 1 },
      },
    },
  ])

  const summaryFormatted = summary.map((s) => ({
    jenis: s._id,
    _sum: { tagihan: s.total },
    _count: { id: s.count },
  }))

  return NextResponse.json({ data, summary: summaryFormatted })
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    await dbConnect()

    const record = await Utilitas.create({
      jenis: body.jenis,
      bulan: parseInt(body.bulan),
      tahun: parseInt(body.tahun),
      tagihan: body.tagihan ? parseFloat(body.tagihan) : null,
      penggunaan: body.penggunaan ? parseFloat(body.penggunaan) : null,
      satuan: body.satuan || null,
      statusBayar: body.statusBayar || 'BELUM',
      tanggalBayar: body.tanggalBayar ? new Date(body.tanggalBayar) : null,
      keterangan: body.keterangan || null,
    })

    await createAuditLog(session.user.id, 'CREATE', 'UTILITAS', 'Tambah utilitas', getIpAddress(request))
    return NextResponse.json(record, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Gagal menyimpan utilitas' }, { status: 500 })
  }
}

export async function PUT(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    await dbConnect()

    const record = await Utilitas.findByIdAndUpdate(
      body.id,
      {
        tagihan: body.tagihan ? parseFloat(body.tagihan) : null,
        penggunaan: body.penggunaan ? parseFloat(body.penggunaan) : null,
        statusBayar: body.statusBayar,
        tanggalBayar: body.tanggalBayar ? new Date(body.tanggalBayar) : null,
        keterangan: body.keterangan || null,
      },
      { new: true }
    )

    await createAuditLog(session.user.id, 'UPDATE', 'UTILITAS', 'Update utilitas', getIpAddress(request))
    return NextResponse.json(record)
  } catch {
    return NextResponse.json({ error: 'Gagal update' }, { status: 500 })
  }
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  await dbConnect()
  await Utilitas.findByIdAndDelete(id)
  return NextResponse.json({ success: true })
}