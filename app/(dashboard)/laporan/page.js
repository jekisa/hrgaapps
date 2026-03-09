'use client'

import { useState } from 'react'
import { Download, FileText, Users, Package, Car, Wrench } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '@/components/ui/PageHeader'

const reports = [
  {
    id: 'karyawan',
    title: 'Laporan Karyawan',
    description: 'Data master karyawan, status kontrak, dan informasi kepegawaian',
    icon: Users,
    color: 'bg-blue-50 text-blue-600',
    endpoint: '/api/laporan/karyawan?format=excel',
    filename: 'laporan-karyawan.csv',
  },
  {
    id: 'aset',
    title: 'Laporan Inventaris Aset',
    description: 'Daftar aset, status, kondisi, dan nilai perolehan',
    icon: Package,
    color: 'bg-green-50 text-green-600',
    endpoint: '/api/laporan/aset?format=excel',
    filename: 'laporan-aset.csv',
  },
  {
    id: 'kendaraan',
    title: 'Laporan Kendaraan',
    description: 'Data kendaraan, status pajak, dan jadwal perawatan',
    icon: Car,
    color: 'bg-purple-50 text-purple-600',
    endpoint: '/api/laporan/kendaraan?format=excel',
    filename: 'laporan-kendaraan.csv',
  },
  {
    id: 'maintenance',
    title: 'Laporan Maintenance',
    description: 'Riwayat dan status pemeliharaan gedung dan fasilitas',
    icon: Wrench,
    color: 'bg-orange-50 text-orange-600',
    endpoint: '/api/laporan/maintenance?format=excel',
    filename: 'laporan-maintenance.csv',
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
      toast.success(`Laporan ${report.title} berhasil diunduh`)
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
        subtitle="Unduh laporan dalam format CSV/Excel"
        breadcrumb={[{ label: 'Dashboard', href: '/' }, { label: 'Laporan' }]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {reports.map((report) => (
          <div key={report.id} className="card p-6 card-hover">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${report.color}`}>
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
                    <Download className="w-4 h-4" /> Download CSV
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 card p-5 bg-blue-50 border-blue-100">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-800">Informasi Export</h3>
            <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
              <li>Laporan diunduh dalam format CSV yang dapat dibuka dengan Microsoft Excel atau Google Sheets</li>
              <li>Data yang diunduh mencerminkan kondisi database saat ini</li>
              <li>Semua aktivitas unduh dicatat dalam audit trail</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
