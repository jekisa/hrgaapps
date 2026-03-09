import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import Notifikasi from '@/models/Notifikasi'

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '20')
  const page = parseInt(searchParams.get('page') || '1')

  await dbConnect()

  const [data, unreadCount, total] = await Promise.all([
    Notifikasi.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Notifikasi.countDocuments({ status: 'BELUM_DIBACA' }),
    Notifikasi.countDocuments(),
  ])

  return NextResponse.json({ data, unreadCount, total, totalPages: Math.ceil(total / limit) })
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  if (body.markAllRead) {
    await dbConnect()
    await Notifikasi.updateMany({ status: 'BELUM_DIBACA' }, { status: 'SUDAH_DIBACA' })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid' }, { status: 400 })
}