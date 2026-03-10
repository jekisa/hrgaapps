import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import Kendaraan from '@/models/Kendaraan'
import * as XLSX from 'xlsx'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await dbConnect()

  const data = await Kendaraan.find().sort({ noPol: 1 })

  const rows = data.map((d) => ({
    'No Polisi': d.noPol,
    Merk: d.merk,
    Model: d.model || '',
    Tahun: d.tahun || '',
    Warna: d.warna || '',
    'Jenis Kendaraan': d.jenisKendaraan || '',
    Status: d.status,
    'Pajak Berakhir': d.tanggalPajakBerakhir ? new Date(d.tanggalPajakBerakhir).toLocaleDateString('id-ID') : '',
    'STNK Berakhir': d.tanggalSTNKBerakhir ? new Date(d.tanggalSTNKBerakhir).toLocaleDateString('id-ID') : '',
  }))

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)

  ws['!cols'] = [
    { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 8 },
    { wch: 12 }, { wch: 18 }, { wch: 14 },
    { wch: 16 }, { wch: 16 },
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Data Kendaraan')

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="laporan-kendaraan.xlsx"',
    },
  })
}
