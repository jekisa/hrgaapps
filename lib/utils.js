import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO, differenceInDays } from 'date-fns'
import { id } from 'date-fns/locale'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(date, fmt = 'dd MMMM yyyy') {
  if (!date) return '-'
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    return format(d, fmt, { locale: id })
  } catch {
    return '-'
  }
}

export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '-'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(num) {
  if (num === null || num === undefined) return '-'
  return new Intl.NumberFormat('id-ID').format(num)
}

export function getDaysDiff(date) {
  if (!date) return null
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    return differenceInDays(d, new Date())
  } catch {
    return null
  }
}

export function getStatusBadgeColor(status) {
  const colors = {
    // Karyawan contract
    PKWTT: 'bg-green-100 text-green-800',
    PKWT: 'bg-blue-100 text-blue-800',
    PROBATION: 'bg-yellow-100 text-yellow-800',
    // Asset
    AKTIF: 'bg-green-100 text-green-800',
    DIPINJAM: 'bg-blue-100 text-blue-800',
    RUSAK: 'bg-red-100 text-red-800',
    DISPOSAL: 'bg-gray-100 text-gray-800',
    // Maintenance
    PENDING: 'bg-yellow-100 text-yellow-800',
    PROSES: 'bg-blue-100 text-blue-800',
    SELESAI: 'bg-green-100 text-green-800',
    DITOLAK: 'bg-red-100 text-red-800',
    // Payment
    SUDAH: 'bg-green-100 text-green-800',
    BELUM: 'bg-red-100 text-red-800',
    // Vehicle
    TERSEDIA: 'bg-green-100 text-green-800',
    DIGUNAKAN: 'bg-blue-100 text-blue-800',
    SERVIS: 'bg-orange-100 text-orange-800',
    TIDAK_AKTIF: 'bg-gray-100 text-gray-800',
    // Schedule
    TERJADWAL: 'bg-blue-100 text-blue-800',
    BERLANGSUNG: 'bg-green-100 text-green-800',
    DIBATALKAN: 'bg-red-100 text-red-800',
    // Priority
    LOW: 'bg-gray-100 text-gray-800',
    NORMAL: 'bg-blue-100 text-blue-800',
    HIGH: 'bg-orange-100 text-orange-800',
    URGENT: 'bg-red-100 text-red-800',
    // Notif
    BELUM_DIBACA: 'bg-yellow-100 text-yellow-800',
    SUDAH_DIBACA: 'bg-gray-100 text-gray-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function generateKodeAset(prefix = 'AST') {
  const timestamp = Date.now().toString().slice(-6)
  return `${prefix}-${timestamp}`
}


export const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

export const DEPARTEMEN_LIST = [
  'IT', 'HR', 'Finance', 'Admin', 'Marketing', 'Sales',
  'Legal', 'Procurement', 'GA', 'Management',
]

export const JABATAN_LIST = [
  'Staff', 'Senior Staff', 'Supervisor', 'Manager', 'Senior Manager',
  'Assistant Manager', 'Head', 'Director', 'VP', 'CEO',
]
