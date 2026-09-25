import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import Notifikasi from '@/models/Notifikasi'
import accessControl from '@/lib/access-control'

const { getOwnerScope } = accessControl

export async function PATCH(request, { params: paramsPromise }) {
  const params = await paramsPromise
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const ownerScope = getOwnerScope(session.user.role, session.user.id, 'recipientUserId')

  await dbConnect()
  const notif = await Notifikasi.findOneAndUpdate(
    { _id: params.id, ...ownerScope },
    { status: 'SUDAH_DIBACA' },
    { new: true }
  )
  if (!notif) return NextResponse.json({ error: 'Notifikasi tidak ditemukan' }, { status: 404 })

  return NextResponse.json(notif)
}

export async function DELETE(request, { params: paramsPromise }) {
  const params = await paramsPromise
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const ownerScope = getOwnerScope(session.user.role, session.user.id, 'recipientUserId')

  await dbConnect()
  const notif = await Notifikasi.findOneAndDelete({ _id: params.id, ...ownerScope })
  if (!notif) return NextResponse.json({ error: 'Notifikasi tidak ditemukan' }, { status: 404 })
  return NextResponse.json({ success: true })
}
