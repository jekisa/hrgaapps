import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import AuditLog from '@/models/AuditLog'

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search') || ''
  const modul = searchParams.get('modul') || ''

  await dbConnect()

  const query = {}
  if (search) query.detail = { $regex: search, $options: 'i' }
  if (modul) query.modul = modul

  const [total, data] = await Promise.all([
    AuditLog.countDocuments(query),
    AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('userId', 'name email'),
  ])

  const result = data.map((d) => {
    const obj = d.toJSON()
    obj.user = obj.userId
    delete obj.userId
    return obj
  })

  return NextResponse.json({ data: result, total, totalPages: Math.ceil(total / limit) })
}
