'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, Eye } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import PageHeader from '@/components/ui/PageHeader'
import Badge from '@/components/ui/Badge'
import { formatDate, getDaysDiff } from '@/lib/utils'

export default function KontrakPage() {
  const [filter, setFilter] = useState('30')

  const { data: result, isLoading } = useQuery({
    queryKey: ['karyawan-kontrak'],
    queryFn: () => fetch('/api/karyawan?limit=100&status=PKWT').then(r => r.json()),
    staleTime: 1000 * 60 * 5,
  })

  const data = result?.data || []
  const days = parseInt(filter)

  const filtered = data.filter((k) => {
    if (!k.tanggalKontrakBerakhir) return false
    const diff = getDaysDiff(k.tanggalKontrakBerakhir)
    return diff !== null && diff >= 0 && diff <= days
  }).sort((a, b) => new Date(a.tanggalKontrakBerakhir) - new Date(b.tanggalKontrakBerakhir))

  const expired = data.filter((k) => {
    if (!k.tanggalKontrakBerakhir) return false
    const diff = getDaysDiff(k.tanggalKontrakBerakhir)
    return diff !== null && diff < 0
  })

  return (
    <div>
      <PageHeader
        title="Status Kontrak Karyawan"
        subtitle="Monitor kontrak PKWT dan probation yang akan/sudah berakhir"
        breadcrumb={[
          { label: 'Dashboard', href: '/' },
          { label: 'Karyawan', href: '/karyawan' },
          { label: 'Status Kontrak' },
        ]}
      />

      {/* Alert Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Berakhir dalam 7 hari', days: 7, color: 'bg-red-50 border-red-200 text-red-700' },
          { label: 'Berakhir dalam 30 hari', days: 30, color: 'bg-orange-50 border-orange-200 text-orange-700' },
          { label: 'Berakhir dalam 60 hari', days: 60, color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
        ].map((item) => {
          const count = data.filter((k) => {
            if (!k.tanggalKontrakBerakhir) return false
            const diff = getDaysDiff(k.tanggalKontrakBerakhir)
            return diff !== null && diff >= 0 && diff <= item.days
          }).length
          return (
            <div key={item.days} className={`card p-4 border ${item.color}`}>
              <p className="text-2xl font-bold">{isLoading ? '—' : count}</p>
              <p className="text-sm mt-0.5">{item.label}</p>
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-4 mb-4">
        <label className="text-sm text-gray-600">Tampilkan kontrak berakhir dalam:</label>
        <select className="form-select w-40" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="7">7 hari</option>
          <option value="30">30 hari</option>
          <option value="60">60 hari</option>
          <option value="90">90 hari</option>
        </select>
      </div>

      {/* Upcoming */}
      <div className="page-section mb-6">
        <div className="px-4 py-3 border-b border-gray-100 bg-orange-50">
          <h3 className="font-semibold text-orange-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Kontrak Berakhir dalam {filter} Hari ({isLoading ? '...' : filtered.length})
          </h3>
        </div>
        {!isLoading && filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Tidak ada kontrak yang akan berakhir</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th">Nama</th>
                  <th className="table-th">Jabatan</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Berakhir</th>
                  <th className="table-th">Sisa Hari</th>
                  <th className="table-th">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((k) => {
                  const diff = getDaysDiff(k.tanggalKontrakBerakhir)
                  return (
                    <tr key={k.id} className="hover:bg-gray-50">
                      <td className="table-td">
                        <p className="font-medium">{k.nama}</p>
                        <p className="text-xs text-gray-400">{k.nik}</p>
                      </td>
                      <td className="table-td">{k.jabatan} — {k.departemen}</td>
                      <td className="table-td"><Badge status={k.statusKontrak} /></td>
                      <td className="table-td">{formatDate(k.tanggalKontrakBerakhir)}</td>
                      <td className="table-td">
                        <span className={`font-bold ${diff <= 7 ? 'text-red-600' : diff <= 14 ? 'text-orange-600' : 'text-yellow-600'}`}>
                          {diff} hari
                        </span>
                      </td>
                      <td className="table-td">
                        <Link href={`/karyawan/${k.id}`} className="p-1.5 rounded hover:bg-blue-50 text-blue-600 inline-flex">
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Expired */}
      {!isLoading && expired.length > 0 && (
        <div className="page-section">
          <div className="px-4 py-3 border-b border-gray-100 bg-red-50">
            <h3 className="font-semibold text-red-800">Kontrak Sudah Berakhir ({expired.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th">Nama</th>
                  <th className="table-th">Jabatan</th>
                  <th className="table-th">Berakhir</th>
                  <th className="table-th">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {expired.map((k) => (
                  <tr key={k.id} className="hover:bg-gray-50">
                    <td className="table-td"><p className="font-medium">{k.nama}</p></td>
                    <td className="table-td">{k.jabatan}</td>
                    <td className="table-td text-red-600 font-medium">{formatDate(k.tanggalKontrakBerakhir)}</td>
                    <td className="table-td">
                      <Link href={`/karyawan/${k.id}`} className="p-1.5 rounded hover:bg-blue-50 text-blue-600 inline-flex">
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
