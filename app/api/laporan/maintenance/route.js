import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import MaintenanceRequest from '@/models/MaintenanceRequest'
import * as XLSX from 'xlsx'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await dbConnect()

  const data = await MaintenanceRequest.find().sort({ tanggalRequest: -1 })

  const rows = data.map((d) => ({
    Judul: d.judul,
    Lokasi: d.lokasi || '',
    Kategori: d.kategori || '',
    Prioritas: d.prioritas,
    Status: d.status,
    Pemohon: d.pemohon || '',
    Pelaksana: d.pelaksana || '',
    'Tgl Request': new Date(d.tanggalRequest).toLocaleDateString('id-ID'),
    'Tgl Selesai': d.tanggalSelesai ? new Date(d.tanggalSelesai).toLocaleDateString('id-ID') : '',
    'Biaya (Rp)': d.biaya || '',
  }))

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)

  ws['!cols'] = [
    { wch: 30 }, { wch: 20 }, { wch: 18 }, { wch: 12 },
    { wch: 12 }, { wch: 20 }, { wch: 20 },
    { wch: 14 }, { wch: 14 }, { wch: 14 },
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Data Maintenance')

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="laporan-maintenance.xlsx"',
    },
  })
}
