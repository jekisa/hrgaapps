import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import Karyawan from '@/models/Karyawan'
import * as XLSX from 'xlsx'

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await dbConnect()

  const data = await Karyawan.find()
    .sort({ nama: 1 })
    .select('nik nama jabatan departemen statusKontrak tanggalMasuk tanggalKontrakBerakhir telepon email statusAktif')

  const rows = data.map((d) => ({
    NIK: d.nik,
    Nama: d.nama,
    Jabatan: d.jabatan || '',
    Departemen: d.departemen || '',
    'Status Kontrak': d.statusKontrak,
    'Tgl Masuk': d.tanggalMasuk ? new Date(d.tanggalMasuk).toLocaleDateString('id-ID') : '',
    'Kontrak Berakhir': d.tanggalKontrakBerakhir ? new Date(d.tanggalKontrakBerakhir).toLocaleDateString('id-ID') : '',
    Telepon: d.telepon || '',
    Email: d.email || '',
    Status: d.statusAktif ? 'Aktif' : 'Non-Aktif',
  }))

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)

  // Column widths
  ws['!cols'] = [
    { wch: 18 }, { wch: 30 }, { wch: 20 }, { wch: 20 },
    { wch: 16 }, { wch: 14 }, { wch: 16 },
    { wch: 16 }, { wch: 28 }, { wch: 12 },
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Data Karyawan')

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="laporan-karyawan.xlsx"',
    },
  })
}
