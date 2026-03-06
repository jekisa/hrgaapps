import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { addDays, startOfMonth, endOfMonth, subMonths } from 'date-fns'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const now = new Date()
  const thirtyDaysLater = addDays(now, 30)

  const [
    totalKaryawan,
    karyawanAktif,
    kontrakBerakhir,
    totalAset,
    asetDipinjam,
    maintenancePending,
    totalKendaraan,
    kendaraanTersedia,
    pajakJatuhTempo,
    notifikasiUnread,
    recentAudit,
    asetByKategori,
    monthlyUtilitas,
  ] = await Promise.all([
    prisma.karyawan.count(),
    prisma.karyawan.count({ where: { statusAktif: true } }),
    prisma.karyawan.count({
      where: {
        tanggalKontrakBerakhir: { gte: now, lte: thirtyDaysLater },
        statusAktif: true,
      },
    }),
    prisma.aset.count(),
    prisma.aset.count({ where: { status: 'DIPINJAM' } }),
    prisma.maintenanceRequest.count({ where: { status: { in: ['PENDING', 'PROSES'] } } }),
    prisma.kendaraan.count(),
    prisma.kendaraan.count({ where: { status: 'TERSEDIA' } }),
    prisma.pembayaranPajak.count({
      where: {
        status: 'BELUM',
        tanggalJatuhTempo: { gte: now, lte: thirtyDaysLater },
      },
    }),
    prisma.notifikasi.count({ where: { status: 'BELUM_DIBACA' } }),
    prisma.auditLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } },
    }),
    prisma.aset.groupBy({
      by: ['kategori'],
      _count: { id: true },
    }),
    prisma.utilitas.groupBy({
      by: ['jenis'],
      where: {
        bulan: now.getMonth() + 1,
        tahun: now.getFullYear(),
      },
      _sum: { tagihan: true },
    }),
  ])

  // Karyawan by contract status
  const karyawanByKontrak = await prisma.karyawan.groupBy({
    by: ['statusKontrak'],
    where: { statusAktif: true },
    _count: { id: true },
  })

  // Monthly karyawan trend (last 6 months)
  const monthlyKaryawan = []
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(now, i)
    const count = await prisma.karyawan.count({
      where: { tanggalMasuk: { lte: endOfMonth(date) } },
    })
    monthlyKaryawan.push({
      month: date.toLocaleString('id-ID', { month: 'short' }),
      total: count,
    })
  }

  return NextResponse.json({
    stats: {
      totalKaryawan,
      karyawanAktif,
      kontrakBerakhir,
      totalAset,
      asetDipinjam,
      maintenancePending,
      totalKendaraan,
      kendaraanTersedia,
      pajakJatuhTempo,
      notifikasiUnread,
    },
    charts: {
      karyawanByKontrak: karyawanByKontrak.map((k) => ({
        name: k.statusKontrak,
        value: k._count.id,
      })),
      asetByKategori: asetByKategori.map((a) => ({
        name: a.kategori,
        value: a._count.id,
      })),
      monthlyKaryawan,
      monthlyUtilitas: monthlyUtilitas.map((u) => ({
        name: u.jenis,
        tagihan: u._sum.tagihan || 0,
      })),
    },
    recentActivity: recentAudit.map((log) => ({
      id: log.id,
      user: log.user?.name || 'System',
      aksi: log.aksi,
      modul: log.modul,
      detail: log.detail,
      createdAt: log.createdAt,
    })),
  })
}
