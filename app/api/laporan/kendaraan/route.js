import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await prisma.kendaraan.findMany({ orderBy: { noPol: 'asc' } })

  const headers = ['No Pol', 'Merk', 'Model', 'Tahun', 'Warna', 'Jenis', 'Status', 'Pajak Berakhir', 'STNK Berakhir']
  const rows = data.map((d) => [
    d.noPol, d.merk, d.model || '', d.tahun || '', d.warna || '', d.jenisKendaraan || '', d.status,
    d.tanggalPajakBerakhir ? new Date(d.tanggalPajakBerakhir).toLocaleDateString('id-ID') : '',
    d.tanggalSTNKBerakhir ? new Date(d.tanggalSTNKBerakhir).toLocaleDateString('id-ID') : '',
  ])

  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="laporan-kendaraan.csv"',
    },
  })
}
