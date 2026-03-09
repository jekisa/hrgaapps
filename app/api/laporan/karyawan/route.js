import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import Karyawan from '@/models/Karyawan'

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') || 'json'

  await dbConnect()

  const data = await Karyawan.find()
    .sort({ nama: 1 })
    .select('nik nama jabatan departemen statusKontrak tanggalMasuk tanggalKontrakBerakhir telepon email statusAktif')

  if (format === 'excel') {
    const headers = ['NIK', 'Nama', 'Jabatan', 'Departemen', 'Status Kontrak', 'Tgl Masuk', 'Kontrak Berakhir', 'Telepon', 'Email', 'Status']
    const rows = data.map((d) => [
      d.nik, d.nama, d.jabatan || '', d.departemen || '',
      d.statusKontrak,
      d.tanggalMasuk ? new Date(d.tanggalMasuk).toLocaleDateString('id-ID') : '',
      d.tanggalKontrakBerakhir ? new Date(d.tanggalKontrakBerakhir).toLocaleDateString('id-ID') : '',
      d.telepon || '', d.email || '',
      d.statusAktif ? 'Aktif' : 'Non-Aktif',
    ])

    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="data-karyawan.csv"',
      },
    })
  }

  return NextResponse.json(data)
}
