import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import MaintenanceRequest from '@/models/MaintenanceRequest'
import { createAuditLog, getIpAddress } from '@/lib/server-utils'

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const status = searchParams.get('status') || ''
  const prioritas = searchParams.get('prioritas') || ''
  const search = searchParams.get('search') || ''

  await dbConnect()

  const query = {}
  if (search) {
    query.$or = [
      { judul: { $regex: search, $options: 'i' } },
      { lokasi: { $regex: search, $options: 'i' } },
    ]
  }
  if (status) query.status = status
  if (prioritas) query.prioritas = prioritas

  const [total, data] = await Promise.all([
    MaintenanceRequest.countDocuments(query),
    MaintenanceRequest.find(query)
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

    const record = await MaintenanceRequest.create({
      judul: body.judul,
      lokasi: body.lokasi || null,
      kategori: body.kategori || null,
      deskripsi: body.deskripsi || null,
      prioritas: body.prioritas || 'NORMAL',
      status: 'PENDING',
      pemohon: body.pemohon || null,
    })

    await createAuditLog(session.user.id, 'CREATE', 'MAINTENANCE', 'Tambah maintenance request', getIpAddress(request))
    return NextResponse.json(record, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Gagal membuat request' }, { status: 500 })
  }
}