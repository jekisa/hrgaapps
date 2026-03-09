'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import PageHeader from '@/components/ui/PageHeader'
import DataTable from '@/components/ui/DataTable'
import { formatDate } from '@/lib/utils'

export default function RiwayatJabatanPage() {
  const [search, setSearch] = useState('')

  const { data: rawData = [], isLoading } = useQuery({
    queryKey: ['riwayat-jabatan'],
    queryFn: () => fetch('/api/karyawan/riwayat').then(r => r.json()),
    staleTime: 1000 * 60 * 5,
  })

  const filtered = useMemo(() => rawData.filter(
    (r) =>
      r.karyawan?.nama?.toLowerCase().includes(search.toLowerCase()) ||
      r.jabatan?.toLowerCase().includes(search.toLowerCase())
  ), [rawData, search])

  const columns = useMemo(() => [
    {
      id: 'karyawan',
      header: 'Karyawan',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.karyawan?.nama}</p>
          <p className="text-xs text-gray-400">{row.original.karyawan?.nik}</p>
        </div>
      ),
    },
    {
      accessorKey: 'jabatan',
      header: 'Jabatan',
      cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
    },
    {
      accessorKey: 'departemen',
      header: 'Departemen',
      cell: ({ getValue }) => getValue() || '-',
    },
    {
      accessorKey: 'tanggalMulai',
      header: 'Mulai',
      cell: ({ getValue }) => formatDate(getValue()),
    },
    {
      accessorKey: 'tanggalSelesai',
      header: 'Selesai',
      cell: ({ getValue }) => getValue() ? formatDate(getValue()) : <span className="text-green-600 font-medium">Sekarang</span>,
    },
    {
      accessorKey: 'keterangan',
      header: 'Keterangan',
      cell: ({ getValue }) => <span className="text-gray-500">{getValue() || '-'}</span>,
    },
  ], [])

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
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama atau jabatan..."
            className="form-input pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="page-section">
        <DataTable data={filtered} columns={columns} isLoading={isLoading} emptyMessage="Belum ada riwayat jabatan" />
      </div>
    </div>
  )
}
