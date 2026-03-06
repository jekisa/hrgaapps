import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await prisma.aset.findMany({
    orderBy: { namaAset: 'asc' },
  })

  const headers = ['Kode Aset', 'Nama Aset', 'Kategori', 'Merk', 'Model', 'SN', 'Tahun', 'Nilai', 'Kondisi', 'Status', 'Lokasi']
  const rows = data.map((d) => [
    d.kodeAset, d.namaAset, d.kategori, d.merk || '', d.model || '', d.serialNumber || '',
    d.tahunPerolehan || '', d.nilaiPerolehan || '', d.kondisi, d.status, d.lokasi || '',
  ])

  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="laporan-aset.csv"',
    },
  })
}
