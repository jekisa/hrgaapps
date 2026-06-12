'use client'

import { useState } from 'react'
import { DownloadCloud, Sheet, UsersRound, PackageCheck, CarFront, Wrench } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '@/components/ui/PageHeader'

const reports = [
  {
    id: 'karyawan',
    title: 'Laporan Karyawan',
    description: 'Data master karyawan, status kontrak, dan informasi kepegawaian',
    icon: UsersRound,
    color: 'bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-600 ring-1 ring-blue-100',
    endpoint: '/api/laporan/karyawan',
    filename: 'laporan-karyawan.xlsx',
  },
  {
    id: 'aset',
    title: 'Laporan Inventaris Aset',
    description: 'Daftar aset, status, kondisi, dan nilai perolehan',
    icon: PackageCheck,
    color: 'bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600 ring-1 ring-emerald-100',
    endpoint: '/api/laporan/aset',
    filename: 'laporan-aset.xlsx',
  },
  {
    id: 'kendaraan',
    title: 'Laporan Kendaraan',
    description: 'Data kendaraan, status pajak, dan jadwal perawatan',
    icon: CarFront,
    color: 'bg-gradient-to-br from-violet-50 to-fuchsia-50 text-violet-600 ring-1 ring-violet-100',
    endpoint: '/api/laporan/kendaraan',
    filename: 'laporan-kendaraan.xlsx',
  },
  {
    id: 'maintenance',
    title: 'Laporan Maintenance',
    description: 'Riwayat dan status pemeliharaan gedung dan fasilitas',
    icon: Wrench,
    color: 'bg-gradient-to-br from-orange-50 to-amber-50 text-orange-600 ring-1 ring-orange-100',
    endpoint: '/api/laporan/maintenance',
    filename: 'laporan-maintenance.xlsx',
  },
]

export default function LaporanPage() {
  const [loading, setLoading] = useState({})

  const downloadReport = async (report) => {
    setLoading((prev) => ({ ...prev, [report.id]: true }))
    try {
      const res = await fetch(report.endpoint)
      if (!res.ok) throw new Error('Gagal mengunduh laporan')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = report.filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success(`${report.title} berhasil diunduh`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading((prev) => ({ ...prev, [report.id]: false }))
    }
  }

  return (
    <div>
      <PageHeader
        title="Laporan & Export"
        subtitle="Unduh laporan dalam format Excel (.xlsx)"
        breadcrumb={[{ label: 'Dashboard', href: '/' }, { label: 'Laporan' }]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {reports.map((report) => (
          <div key={report.id} className="card p-6 card-hover">
            <div className="flex items-start gap-4">
              <div className={`icon-tile w-12 h-12 ${report.color}`}>
                <report.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{report.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{report.description}</p>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => downloadReport(report)}
                disabled={loading[report.id]}
                className="btn-primary text-sm"
              >
                {loading[report.id] ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Mengunduh...
                  </>
                ) : (
                  <>
                    <DownloadCloud className="w-4 h-4" /> Download Excel
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 card p-5 bg-green-50 border-green-100">
        <div className="flex items-start gap-3">
          <Sheet className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-800">Informasi Export</h3>
            <ul className="text-sm text-green-700 mt-2 space-y-1 list-disc list-inside">
              <li>Laporan diunduh dalam format Excel (.xlsx) — dapat langsung dibuka di Microsoft Excel</li>
              <li>Lebar kolom sudah disesuaikan secara otomatis untuk tiap laporan</li>
              <li>Data yang diunduh mencerminkan kondisi database saat ini</li>
              <li>Semua aktivitas unduh dicatat dalam audit trail</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
