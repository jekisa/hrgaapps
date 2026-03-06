'use client'

import { useState, useEffect } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { formatDate } from '@/lib/utils'

export default function RiwayatJabatanPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/karyawan/riwayat')
        const json = await res.json()
        setData(json || [])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filtered = data.filter(
    (r) =>
      r.karyawan?.nama?.toLowerCase().includes(search.toLowerCase()) ||
      r.jabatan?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <PageLoader />

  return (
    <div>
      <PageHeader
        title="Riwayat Jabatan & Mutasi"
        subtitle="Rekap perjalanan karir seluruh karyawan"
        breadcrumb={[
          { label: 'Dashboard', href: '/' },
          { label: 'Karyawan', href: '/karyawan' },
          { label: 'Riwayat Jabatan' },
        ]}
      />

      <div className="card p-4 mb-4">
        <input
          type="text"
          placeholder="Cari nama atau jabatan..."
          className="form-input max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">Karyawan</th>
                <th className="table-th">Jabatan</th>
                <th className="table-th">Departemen</th>
                <th className="table-th">Mulai</th>
                <th className="table-th">Selesai</th>
                <th className="table-th">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="table-td">
                    <p className="font-medium">{r.karyawan?.nama}</p>
                    <p className="text-xs text-gray-400">{r.karyawan?.nik}</p>
                  </td>
                  <td className="table-td font-medium">{r.jabatan}</td>
                  <td className="table-td">{r.departemen || '-'}</td>
                  <td className="table-td">{formatDate(r.tanggalMulai)}</td>
                  <td className="table-td">{r.tanggalSelesai ? formatDate(r.tanggalSelesai) : <span className="text-green-600 font-medium">Sekarang</span>}</td>
                  <td className="table-td text-gray-500">{r.keterangan || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
