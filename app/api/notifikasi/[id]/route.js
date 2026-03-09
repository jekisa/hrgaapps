import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import Notifikasi from '@/models/Notifikasi'

export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await dbConnect()
  const notif = await Notifikasi.findByIdAndUpdate(
    params.id,
    { status: 'SUDAH_DIBACA' },
    { new: true }
  )

  return NextResponse.json(notif)
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await dbConnect()
  await Notifikasi.findByIdAndDelete(params.id)
  return NextResponse.json({ success: true })
}