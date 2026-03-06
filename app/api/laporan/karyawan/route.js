import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') || 'json'

  const data = await prisma.karyawan.findMany({
    orderBy: { nama: 'asc' },
    select: {
      nik: true, nama: true, jabatan: true, departemen: true,
      statusKontrak: true, tanggalMasuk: true, tanggalKontrakBerakhir: true,
      telepon: true, email: true, statusAktif: true,
    },
  })

  if (format === 'excel') {
    // Return CSV for now (xlsx requires server-side lib)
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
