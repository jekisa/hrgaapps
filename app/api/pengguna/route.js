import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import { createAuditLog, getIpAddress } from '@/lib/server-utils'

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await dbConnect()
  const data = await User.find().sort({ createdAt: -1 }).select('name email role isActive createdAt')
  return NextResponse.json(data)
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()
    await dbConnect()

    const hashedPassword = await bcrypt.hash(body.password || 'password123', 10)
    const existing = await User.findOne({ email: body.email })
    if (existing) return NextResponse.json({ error: 'Email sudah digunakan' }, { status: 400 })

    const user = await User.create({
      name: body.name,
      email: body.email,
      password: hashedPassword,
      role: body.role || 'STAFF',
    })

    const result = user.toJSON()
    delete result.password

    await createAuditLog(session.user.id, 'CREATE', 'USER', `Tambah pengguna: ${body.email}`, getIpAddress(request))
    return NextResponse.json(result, { status: 201 })
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
    await dbConnect()

    const updateData = { name: body.name, role: body.role, isActive: body.isActive }
    if (body.password) {
      updateData.password = await bcrypt.hash(body.password, 10)
    }

    const user = await User.findByIdAndUpdate(body.id, updateData, { new: true }).select('name email role isActive')
    if (!user) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })

    await createAuditLog(session.user.id, 'UPDATE', 'USER', `Update pengguna: ${body.email}`, getIpAddress(request))
    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ error: 'Gagal update pengguna' }, { status: 500 })
  }
}
