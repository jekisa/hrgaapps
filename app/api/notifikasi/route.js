import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '20')
  const page = parseInt(searchParams.get('page') || '1')

  const [data, unreadCount, total] = await Promise.all([
    prisma.notifikasi.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notifikasi.count({ where: { status: 'BELUM_DIBACA' } }),
    prisma.notifikasi.count(),
  ])

  return NextResponse.json({ data, unreadCount, total, totalPages: Math.ceil(total / limit) })
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Mark all as read
  const body = await request.json()
  if (body.markAllRead) {
    await prisma.notifikasi.updateMany({
      where: { status: 'BELUM_DIBACA' },
      data: { status: 'SUDAH_DIBACA' },
    })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid' }, { status: 400 })
}
