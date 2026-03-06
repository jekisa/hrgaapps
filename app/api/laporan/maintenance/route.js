import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await prisma.maintenanceRequest.findMany({ orderBy: { tanggalRequest: 'desc' } })

  const headers = ['Judul', 'Lokasi', 'Kategori', 'Prioritas', 'Status', 'Pemohon', 'Pelaksana', 'Tgl Request', 'Tgl Selesai', 'Biaya']
  const rows = data.map((d) => [
    d.judul, d.lokasi || '', d.kategori || '', d.prioritas, d.status, d.pemohon || '', d.pelaksana || '',
    new Date(d.tanggalRequest).toLocaleDateString('id-ID'),
    d.tanggalSelesai ? new Date(d.tanggalSelesai).toLocaleDateString('id-ID') : '',
    d.biaya || '',
  ])

  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="laporan-maintenance.csv"',
    },
  })
}
