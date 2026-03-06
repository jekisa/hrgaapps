import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const notif = await prisma.notifikasi.update({
    where: { id: parseInt(params.id) },
    data: { status: 'SUDAH_DIBACA' },
  })

  return NextResponse.json(notif)
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.notifikasi.delete({ where: { id: parseInt(params.id) } })
  return NextResponse.json({ success: true })
}
