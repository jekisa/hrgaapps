import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await prisma.riwayatJabatan.findMany({
    orderBy: { tanggalMulai: 'desc' },
    include: {
      karyawan: { select: { nama: true, nik: true } },
    },
  })

  return NextResponse.json(data)
}
