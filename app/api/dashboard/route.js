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
import JadwalKendaraan from '@/models/JadwalKendaraan'
import { addDays, endOfMonth, subMonths, startOfDay } from 'date-fns'

const toDateStr = (d) => new Date(d).toISOString().split('T')[0]

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await dbConnect()

    const now = new Date()
    const thirtyDaysLater = addDays(now, 30)
    const sixtyDaysLater = addDays(now, 60)

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
      karyawanByKontrakRaw,
      // calendar sources
      calendarKontrak,
      calendarPajak,
      calendarJadwal,
      calendarMaintenance,
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
      AuditLog.find().sort({ createdAt: -1 }).limit(6).populate('userId', 'name'),
      Aset.aggregate([{ $group: { _id: '$kategori', count: { $sum: 1 } } }]),
      Karyawan.aggregate([
        { $match: { statusAktif: true } },
        { $group: { _id: '$statusKontrak', count: { $sum: 1 } } },
      ]),
      // Calendar: kontrak berakhir next 60 days
      Karyawan.find({
        tanggalKontrakBerakhir: { $gte: startOfDay(now), $lte: sixtyDaysLater },
        statusAktif: true,
      }).select('nama tanggalKontrakBerakhir').limit(30),
      // Calendar: pajak jatuh tempo next 60 days
      PembayaranPajak.find({
        tanggalJatuhTempo: { $gte: startOfDay(now), $lte: sixtyDaysLater },
        status: 'BELUM',
      }).select('tanggalJatuhTempo jenisPajak').populate('kendaraanId', 'noPol').limit(30),
      // Calendar: jadwal kendaraan next 60 days
      JadwalKendaraan.find({
        tanggalBerangkat: { $gte: startOfDay(now), $lte: sixtyDaysLater },
        status: { $ne: 'DIBATALKAN' },
      }).select('keperluan tanggalBerangkat').populate('kendaraanId', 'noPol').limit(30),
      // Calendar: maintenance pending next 60 days
      MaintenanceRequest.find({
        tanggalRequest: { $gte: startOfDay(now), $lte: sixtyDaysLater },
        status: { $in: ['PENDING', 'PROSES'] },
      }).select('judul tanggalRequest prioritas').limit(30),
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

    // Build calendarEvents array
    const calendarEvents = [
      ...calendarKontrak.map((k) => ({
        date: toDateStr(k.tanggalKontrakBerakhir),
        type: 'kontrak',
        label: `Kontrak: ${k.nama}`,
        href: '/karyawan/kontrak',
      })),
      ...calendarPajak.map((p) => ({
        date: toDateStr(p.tanggalJatuhTempo),
        type: 'pajak',
        label: `Pajak ${p.jenisPajak}: ${p.kendaraanId?.noPol || '—'}`,
        href: '/kendaraan/pajak',
      })),
      ...calendarJadwal.map((j) => ({
        date: toDateStr(j.tanggalBerangkat),
        type: 'jadwal',
        label: `Jadwal: ${j.keperluan || j.kendaraanId?.noPol || '—'}`,
        href: '/kendaraan/jadwal',
      })),
      ...calendarMaintenance.map((m) => ({
        date: toDateStr(m.tanggalRequest),
        type: 'maintenance',
        label: `Maintenance: ${m.judul}`,
        href: '/gedung/maintenance',
      })),
    ]

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
      calendarEvents,
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Gagal memuat data dashboard' }, { status: 500 })
  }
}
