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

export default function Badge({ status, label, className }) {
  const displayLabel = label || statusLabels[status] || status
  return (
    <span className={cn('badge', getStatusBadgeColor(status), className)}>
      {displayLabel}
    </span>
  )
}
