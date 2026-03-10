import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import Aset from '@/models/Aset'
import * as XLSX from 'xlsx'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await dbConnect()

  const data = await Aset.find().sort({ namaAset: 1 })

  const rows = data.map((d) => ({
    'Kode Aset': d.kodeAset,
    'Nama Aset': d.namaAset,
    Kategori: d.kategori,
    Merk: d.merk || '',
    Model: d.model || '',
    'Serial Number': d.serialNumber || '',
    'Tahun Perolehan': d.tahunPerolehan || '',
    'Nilai Perolehan': d.nilaiPerolehan || '',
    Kondisi: d.kondisi,
    Status: d.status,
    Lokasi: d.lokasi || '',
  }))

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)

  ws['!cols'] = [
    { wch: 16 }, { wch: 30 }, { wch: 18 }, { wch: 16 },
    { wch: 16 }, { wch: 20 }, { wch: 16 },
    { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 24 },
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Inventaris Aset')

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="laporan-aset.xlsx"',
    },
  })
}
