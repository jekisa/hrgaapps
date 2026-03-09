'use client'

import { useState, useMemo } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import PageHeader from '@/components/ui/PageHeader'
import Badge from '@/components/ui/Badge'
import DataTable from '@/components/ui/DataTable'
import { ConfirmModal } from '@/components/ui/Modal'
import UtilitasModal from '@/components/gedung/UtilitasModal'
import { formatCurrency, MONTHS } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const JENIS = ['LISTRIK', 'AIR', 'INTERNET', 'AC', 'GAS', 'LAINNYA']
const COLORS = { LISTRIK: '#f59e0b', AIR: '#3b82f6', INTERNET: '#8b5cf6', AC: '#06b6d4', GAS: '#ef4444', LAINNYA: '#6b7280' }

export default function UtilitasPage() {
  const queryClient = useQueryClient()
  const [tahun, setTahun] = useState(new Date().getFullYear())
  const [jenisFilter, setJenisFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const params = new URLSearchParams({ tahun, ...(jenisFilter && { jenis: jenisFilter }) })

  const { data: result, isLoading } = useQuery({
    queryKey: ['utilitas', tahun, jenisFilter],
    queryFn: () => fetch(`/api/gedung/utilitas?${params}`).then(r => r.json()),
    keepPreviousData: true,
  })

  const rows = result?.data || []
  const summary = result?.summary || []

  const deleteMutation = useMutation({
    mutationFn: (id) => fetch(`/api/gedung/utilitas?id=${id}`, { method: 'DELETE' }).then(r => r.json()),
    onSuccess: () => {
      toast.success('Data dihapus')
      queryClient.invalidateQueries({ queryKey: ['utilitas'] })
      setDeleteId(null)
    },
    onError: () => toast.error('Gagal menghapus'),
  })

  const chartData = MONTHS.map((m, i) => {
    const row = { month: m.slice(0, 3) }
    JENIS.forEach((j) => {
      const found = rows.find((d) => d.bulan === i + 1 && d.jenis === j)
      row[j] = found?.tagihan || 0
    })
    return row
  })

  const columns = useMemo(() => [
    {
      accessorKey: 'jenis',
      header: 'Jenis',
      cell: ({ getValue }) => (
        <span className="badge bg-gray-100 text-gray-700">{getValue()}</span>
      ),
    },
    {
      id: 'periode',
      header: 'Periode',
      cell: ({ row }) => `${MONTHS[row.original.bulan - 1]} ${row.original.tahun}`,
    },
    {
      id: 'penggunaan',
      header: 'Penggunaan',
      cell: ({ row }) => row.original.penggunaan ? `${row.original.penggunaan} ${row.original.satuan || ''}` : '-',
    },
    {
      accessorKey: 'tagihan',
      header: 'Tagihan',
      cell: ({ getValue }) => <span className="font-semibold">{formatCurrency(getValue())}</span>,
    },
    {
      accessorKey: 'statusBayar',
      header: 'Status Bayar',
      cell: ({ getValue }) => <Badge status={getValue()} />,
    },
    {
      accessorKey: 'tanggalBayar',
      header: 'Tgl Bayar',
      cell: ({ getValue }) => getValue() ? new Date(getValue()).toLocaleDateString('id-ID') : '-',
    },
    {
      id: 'aksi',
      header: 'Aksi',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <button onClick={() => { setEditData(row.original); setShowModal(true) }} className="p-1.5 rounded hover:bg-green-50 text-green-600">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={() => setDeleteId(row.original.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ], [])

  const handleSaved = () => {
    setShowModal(false)
    setEditData(null)
    queryClient.invalidateQueries({ queryKey: ['utilitas'] })
  }

  return (
    <div>
      <PageHeader
        title="Utilitas Gedung"
        subtitle="Monitor tagihan listrik, air, internet, dan utilitas lainnya"
        breadcrumb={[{ label: 'Dashboard', href: '/' }, { label: 'Gedung & Fasilitas' }, { label: 'Utilitas' }]}
        actions={
          <button onClick={() => { setEditData(null); setShowModal(true) }} className="btn-primary">
            <Plus className="w-4 h-4" /> Tambah Data
          </button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        {JENIS.map((j) => {
          const s = summary.find((s) => s.jenis === j)
          return (
            <button key={j} onClick={() => setJenisFilter(jenisFilter === j ? '' : j)}
              className={`card p-3 text-left transition-all ${jenisFilter === j ? 'ring-2 ring-primary-500' : 'hover:shadow-md'}`}
            >
              <p className="text-xs text-gray-500">{j}</p>
              <p className="text-sm font-bold text-gray-800 mt-0.5">{formatCurrency(s?._sum?.tagihan || 0)}</p>
              <p className="text-xs text-gray-400">{s?._count?.id || 0} entri</p>
            </button>
          )
        })}
      </div>

      {/* Chart */}
      <div className="card p-5 mb-4">
        <h3 className="font-semibold text-gray-800 mb-4">Tren Tagihan Utilitas {tahun}</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => v >= 1e6 ? `${(v/1e6).toFixed(0)}jt` : v >= 1e3 ? `${(v/1e3).toFixed(0)}rb` : v} />
            <Tooltip formatter={(v) => formatCurrency(v)} />
            <Legend iconSize={10} />
            {JENIS.filter((j) => !jenisFilter || j === jenisFilter).map((j) => (
              <Bar key={j} dataKey={j} fill={COLORS[j]} radius={[2, 2, 0, 0]} stackId="a" />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-4 flex gap-3">
        <select className="form-select w-32" value={tahun} onChange={(e) => setTahun(parseInt(e.target.value))}>
          {[2022, 2023, 2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select className="form-select w-40" value={jenisFilter} onChange={(e) => setJenisFilter(e.target.value)}>
          <option value="">Semua Jenis</option>
          {JENIS.map((j) => <option key={j} value={j}>{j}</option>)}
        </select>
      </div>

      <div className="page-section">
        <DataTable data={rows} columns={columns} isLoading={isLoading} emptyMessage="Belum ada data utilitas" />
      </div>

      <UtilitasModal isOpen={showModal} onClose={() => { setShowModal(false); setEditData(null) }} onSaved={handleSaved} editData={editData} />
      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteMutation.mutate(deleteId)} title="Hapus Data Utilitas" />
    </div>
  )
}
