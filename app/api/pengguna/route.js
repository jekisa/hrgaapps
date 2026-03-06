import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { createAuditLog, getIpAddress } from '@/lib/utils'

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const data = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
  })

  return NextResponse.json(data)
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const hashedPassword = await bcrypt.hash(body.password || 'password123', 10)

    const existing = await prisma.user.findUnique({ where: { email: body.email } })
    if (existing) return NextResponse.json({ error: 'Email sudah digunakan' }, { status: 400 })

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
        role: body.role || 'STAFF',
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })

    await createAuditLog(prisma, session.user.id, 'CREATE', 'USER', `Tambah pengguna: ${body.email}`, getIpAddress(request))
    return NextResponse.json(user, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Gagal membuat pengguna' }, { status: 500 })
  }
}

export async function PUT(request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const updateData = { name: body.name, role: body.role, isActive: body.isActive }

    if (body.password) {
      updateData.password = await bcrypt.hash(body.password, 10)
    }

    const user = await prisma.user.update({
      where: { id: parseInt(body.id) },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, isActive: true },
    })

    await createAuditLog(prisma, session.user.id, 'UPDATE', 'USER', `Update pengguna: ${body.email}`, getIpAddress(request))
    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ error: 'Gagal update pengguna' }, { status: 500 })
  }
}
