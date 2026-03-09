import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import Karyawan from '@/models/Karyawan'
import Aset from '@/models/Aset'
import MaintenanceRequest from '@/models/MaintenanceRequest'
import Kendaraan from '@/models/Kendaraan'
import PembayaranPajak from '@/models/PembayaranPajak'
import Notifikasi from '@/models/Notifikasi'
import AuditLog from '@/models/AuditLog'
import Utilitas from '@/models/Utilitas'
import { addDays, endOfMonth, subMonths } from 'date-fns'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await dbConnect()

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
      asetByKategoriRaw,
      monthlyUtilitasRaw,
      karyawanByKontrakRaw,
    ] = await Promise.all([
      Karyawan.countDocuments(),
      Karyawan.countDocuments({ statusAktif: true }),
      Karyawan.countDocuments({
        tanggalKontrakBerakhir: { $gte: now, $lte: thirtyDaysLater },
        statusAktif: true,
      }),
      Aset.countDocuments(),
      Aset.countDocuments({ status: 'DIPINJAM' }),
      MaintenanceRequest.countDocuments({ status: { $in: ['PENDING', 'PROSES'] } }),
      Kendaraan.countDocuments(),
      Kendaraan.countDocuments({ status: 'TERSEDIA' }),
      PembayaranPajak.countDocuments({
        status: 'BELUM',
        tanggalJatuhTempo: { $gte: now, $lte: thirtyDaysLater },
      }),
      Notifikasi.countDocuments({ status: 'BELUM_DIBACA' }),
      AuditLog.find().sort({ createdAt: -1 }).limit(5).populate('userId', 'name'),
      Aset.aggregate([{ $group: { _id: '$kategori', count: { $sum: 1 } } }]),
      Utilitas.aggregate([
        { $match: { bulan: now.getMonth() + 1, tahun: now.getFullYear() } },
        { $group: { _id: '$jenis', total: { $sum: '$tagihan' } } },
      ]),
      Karyawan.aggregate([
        { $match: { statusAktif: true } },
        { $group: { _id: '$statusKontrak', count: { $sum: 1 } } },
      ]),
    ])

    // Monthly karyawan trend (last 6 months)
    const monthlyKaryawan = []
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(now, i)
      const count = await Karyawan.countDocuments({ tanggalMasuk: { $lte: endOfMonth(date) } })
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
        karyawanByKontrak: karyawanByKontrakRaw.map((k) => ({ name: k._id, value: k.count })),
        asetByKategori: asetByKategoriRaw.map((a) => ({ name: a._id, value: a.count })),
        monthlyKaryawan,
        monthlyUtilitas: monthlyUtilitasRaw.map((u) => ({ name: u._id, tagihan: u.total || 0 })),
      },
      recentActivity: recentAudit.map((log) => {
        const obj = log.toJSON()
        return {
          id: obj.id,
          user: obj.userId?.name || 'System',
          aksi: obj.aksi,
          modul: obj.modul,
          detail: obj.detail,
          createdAt: obj.createdAt,
        }
      }),
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Gagal memuat data dashboard' }, { status: 500 })
  }
}
