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
import Utilitas from '@/models/Utilitas'
import JadwalKendaraan from '@/models/JadwalKendaraan'
import Reminder from '@/models/Reminder'
import { addDays, addYears, endOfDay, endOfMonth, subDays, subMonths, startOfDay } from 'date-fns'

const toDateStr = (d) => {
  const date = new Date(d)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const getNextBirthday = (birthDate, today) => {
  const birth = new Date(birthDate)
  const next = new Date(today.getFullYear(), birth.getMonth(), birth.getDate())
  if (next < startOfDay(today)) next.setFullYear(next.getFullYear() + 1)
  return next
}

const karyawanActiveAtQuery = (date) => ({
  statusAktif: true,
  $or: [
    { tanggalMasuk: { $lte: date } },
    { tanggalMasuk: null },
    { tanggalMasuk: { $exists: false } },
  ],
})

const buildDailyKaryawanTrend = async (now, days) => {
  const points = Array.from({ length: days }, (_, index) => {
    const date = subDays(now, days - 1 - index)
    return {
      label: date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
      date,
    }
  })

  const totals = await Promise.all(
    points.map((point) => Karyawan.countDocuments(karyawanActiveAtQuery(endOfDay(point.date))))
  )

  return points.map((point, index) => ({
    month: point.label,
    total: totals[index],
  }))
}

const buildMonthlyKaryawanTrend = async (now, months) => {
  const points = Array.from({ length: months }, (_, index) => {
    const date = subMonths(now, months - 1 - index)
    return {
      label: date.toLocaleString('id-ID', { month: 'short' }),
      date,
    }
  })

  const totals = await Promise.all(
    points.map((point) => Karyawan.countDocuments(karyawanActiveAtQuery(endOfMonth(point.date))))
  )

  return points.map((point, index) => ({
    month: point.label,
    total: totals[index],
  }))
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await dbConnect()

    const now = new Date()
    const thirtyDaysLater = addDays(now, 30)
    const sixtyDaysLater = addDays(now, 60)
    const oneYearLater = addYears(now, 1)

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
      asetByKategoriRaw,
      karyawanByKontrakRaw,
      // calendar sources
      calendarKontrak,
      calendarPajak,
      calendarJadwal,
      calendarMaintenance,
      calendarReminder,
      calendarBirthdayRaw,
      reminderJatuhTempo,
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
      Reminder.find({
        tanggalJatuhTempo: { $gte: startOfDay(now), $lte: sixtyDaysLater },
        status: 'ACTIVE',
      }).select('judul kategori tanggalJatuhTempo prioritas').limit(40),
      Karyawan.find({
        tanggalLahir: { $ne: null },
        statusAktif: true,
      }).select('nama tanggalLahir departemen jabatan').limit(500),
      Reminder.countDocuments({
        tanggalJatuhTempo: { $gte: startOfDay(now), $lte: thirtyDaysLater },
        status: 'ACTIVE',
      }),
    ])

    const [
      sevenDaysKaryawan,
      thirtyDaysKaryawan,
      sixMonthsKaryawan,
      oneYearKaryawan,
    ] = await Promise.all([
      buildDailyKaryawanTrend(now, 7),
      buildDailyKaryawanTrend(now, 30),
      buildMonthlyKaryawanTrend(now, 6),
      buildMonthlyKaryawanTrend(now, 12),
    ])

    const calendarBirthday = calendarBirthdayRaw
      .map((k) => ({
        employee: k,
        nextBirthday: getNextBirthday(k.tanggalLahir, now),
      }))
      .filter((item) => item.nextBirthday >= startOfDay(now) && item.nextBirthday <= oneYearLater)
      .sort((a, b) => a.nextBirthday - b.nextBirthday)
      .slice(0, 500)

    const ulangTahunJatuhTempo = calendarBirthday.filter((item) => item.nextBirthday <= thirtyDaysLater).length

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
      ...calendarReminder.map((r) => ({
        date: toDateStr(r.tanggalJatuhTempo),
        type: 'reminder',
        label: `${r.kategori.replaceAll('_', ' ')}: ${r.judul}`,
        href: '/reminder',
      })),
      ...calendarBirthday.map(({ employee, nextBirthday }) => ({
        date: toDateStr(nextBirthday),
        type: 'ulangTahun',
        label: `Ulang tahun: ${employee.nama}`,
        href: `/karyawan/${employee.id}`,
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
        reminderJatuhTempo,
        ulangTahunJatuhTempo,
        notifikasiUnread,
      },
      charts: {
        karyawanByKontrak: karyawanByKontrakRaw.map((k) => ({ name: k._id, value: k.count })),
        asetByKategori: asetByKategoriRaw.map((a) => ({ name: a._id, value: a.count })),
        monthlyKaryawan: sixMonthsKaryawan,
        karyawanTrend: {
          sevenDays: sevenDaysKaryawan,
          thirtyDays: thirtyDaysKaryawan,
          sixMonths: sixMonthsKaryawan,
          oneYear: oneYearKaryawan,
        },
      },
      calendarEvents,
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Gagal memuat data dashboard' }, { status: 500 })
  }
}
