import { cn, getStatusBadgeColor } from '@/lib/utils'

const statusLabels = {
  PKWTT: 'PKWTT',
  PKWT: 'PKWT',
  PROBATION: 'Probation',
  AKTIF: 'Aktif',
  DIPINJAM: 'Dipinjam',
  RUSAK: 'Rusak',
  DISPOSAL: 'Disposal',
  PENDING: 'Pending',
  PROSES: 'Proses',
  SELESAI: 'Selesai',
  DITOLAK: 'Ditolak',
  SUDAH: 'Sudah',
  BELUM: 'Belum',
  TERSEDIA: 'Tersedia',
  DIGUNAKAN: 'Digunakan',
  SERVIS: 'Servis',
  TIDAK_AKTIF: 'Tidak Aktif',
  TERJADWAL: 'Terjadwal',
  BERLANGSUNG: 'Berlangsung',
  DIKEMBALIKAN: 'Dikembalikan',
  DIBATALKAN: 'Dibatalkan',
  LOW: 'Rendah',
  NORMAL: 'Normal',
  HIGH: 'Tinggi',
  URGENT: 'Urgent',
  BELUM_DIBACA: 'Belum Dibaca',
  SUDAH_DIBACA: 'Sudah Dibaca',
  BAIK: 'Baik',
  RUSAK_RINGAN: 'Rusak Ringan',
  RUSAK_BERAT: 'Rusak Berat',
}

const statusDotColor = {
  AKTIF: 'bg-emerald-400',
  TERSEDIA: 'bg-emerald-400',
  SELESAI: 'bg-emerald-400',
  SUDAH: 'bg-emerald-400',
  DIKEMBALIKAN: 'bg-teal-400',
  SUDAH_DIBACA: 'bg-gray-400',
  BAIK: 'bg-emerald-400',
  BERLANGSUNG: 'bg-blue-400 animate-dot-pulse',
  PROSES: 'bg-blue-400 animate-dot-pulse',
  TERJADWAL: 'bg-sky-400',
  PKWTT: 'bg-indigo-400',
  PKWT: 'bg-violet-400',
  PROBATION: 'bg-purple-400',
  DIPINJAM: 'bg-orange-400',
  DIGUNAKAN: 'bg-orange-400',
  PENDING: 'bg-amber-400 animate-dot-pulse',
  BELUM: 'bg-amber-400',
  BELUM_DIBACA: 'bg-amber-400 animate-dot-pulse',
  SERVIS: 'bg-yellow-400',
  RUSAK_RINGAN: 'bg-yellow-400',
  RUSAK: 'bg-red-400',
  RUSAK_BERAT: 'bg-red-400',
  DITOLAK: 'bg-red-400',
  DIBATALKAN: 'bg-red-400',
  TIDAK_AKTIF: 'bg-gray-400',
  DISPOSAL: 'bg-gray-400',
  LOW: 'bg-blue-400',
  NORMAL: 'bg-green-400',
  HIGH: 'bg-orange-400',
  URGENT: 'bg-red-500 animate-dot-pulse',
}

export default function Badge({ status, label, className }) {
  const displayLabel = label || statusLabels[status] || status
  const dotColor = statusDotColor[status]

  return (
    <span className={cn('badge', getStatusBadgeColor(status), className)}>
      {dotColor && (
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColor)} />
      )}
      {displayLabel}
    </span>
  )
}
