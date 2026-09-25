import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import accessControl from '@/lib/access-control'
import dbConnect from '@/lib/db'
import Aset from '@/models/Aset'
import { createAuditLog, getIpAddress } from '@/lib/server-utils'

const { requireRole } = accessControl

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const accessError = requireRole(session, ['ADMIN'])
  if (accessError) return NextResponse.json({ error: accessError.error }, { status: accessError.status })

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const kategori = searchParams.get('kategori') || ''

  await dbConnect()

  const query = {}
  if (search) {
    query.$or = [
      { namaAset: { $regex: search, $options: 'i' } },
      { kodeAset: { $regex: search, $options: 'i' } },
    ]
  }
  if (status) query.status = status
  if (kategori) query.kategori = kategori

  const [total, data] = await Promise.all([
    Aset.countDocuments(query),
    Aset.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
  ])

  return NextResponse.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) })
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const accessError = requireRole(session, ['ADMIN'])
  if (accessError) return NextResponse.json({ error: accessError.error }, { status: accessError.status })

  try {
    const body = await request.json()
    await dbConnect()

    const existing = await Aset.findOne({ kodeAset: body.kodeAset })
    if (existing) return NextResponse.json({ error: 'Kode aset sudah digunakan' }, { status: 400 })

    const aset = await Aset.create({
      kodeAset: body.kodeAset,
      namaAset: body.namaAset,
      kategori: body.kategori,
      merk: body.merk || null,
      model: body.model || null,
      serialNumber: body.serialNumber || null,
      tahunPerolehan: body.tahunPerolehan ? parseInt(body.tahunPerolehan) : null,
      nilaiPerolehan: body.nilaiPerolehan ? parseFloat(body.nilaiPerolehan) : null,
      kondisi: body.kondisi || 'BAIK',
      status: body.status || 'AKTIF',
      lokasi: body.lokasi || null,
      keterangan: body.keterangan || null,
    })

    await createAuditLog(session.user.id, 'CREATE', 'ASET', 'Tambah aset', getIpAddress(request))
    return NextResponse.json(aset, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menambah aset' }, { status: 500 })
  }
}
