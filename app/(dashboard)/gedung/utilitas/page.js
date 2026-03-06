'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit, Trash2, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '@/components/ui/PageHeader'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import Modal, { ConfirmModal } from '@/components/ui/Modal'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { formatCurrency, MONTHS } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const JENIS = ['LISTRIK', 'AIR', 'INTERNET', 'AC', 'GAS', 'LAINNYA']

function UtilitasModal({ isOpen, onClose, onSaved, editData }) {
  const { register, handleSubmit, reset, watch, formState: { isSubmitting } } = useForm()
  const statusBayar = watch('statusBayar')

  useEffect(() => {
    if (editData) {
      reset({ ...editData, tanggalBayar: editData.tanggalBayar?.split('T')[0] })
    } else {
      reset({ bulan: new Date().getMonth() + 1, tahun: new Date().getFullYear(), statusBayar: 'BELUM', jenis: 'LISTRIK' })
    }
  }, [editData, reset, isOpen])

  const onSubmit = async (data) => {
    try {
      const method = editData ? 'PUT' : 'POST'
      const body = editData ? { ...data, id: editData.id } : data
      const res = await fetch('/api/gedung/utilitas', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success(editData ? 'Data diperbarui' : 'Data ditambahkan')
      onSaved()
    } catch (err) { toast.error(err.message) }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editData ? 'Edit Utilitas' : 'Tambah Data Utilitas'} size="md"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-secondary">Batal</button>
          <button type="submit" form="util-form" disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'Menyimpan...' : 'Simpan'}</button>
        </>
      }
    >
      <form id="util-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Jenis</label>
            <select className="form-select" {...register('jenis')} disabled={!!editData}>
              {JENIS.map((j) => <option key={j} value={j}>{j}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Bulan</label>
            <select className="form-select" {...register('bulan')} disabled={!!editData}>
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Tahun</label>
            <input type="number" className="form-input" {...register('tahun')} disabled={!!editData} />
          </div>
          <div>
            <label className="form-label">Tagihan (Rp)</label>
            <input type="number" className="form-input" {...register('tagihan')} />
          </div>
          <div>
            <label className="form-label">Penggunaan</label>
            <input type="number" step="0.01" className="form-input" {...register('penggunaan')} />
          </div>
          <div>
            <label className="form-label">Satuan</label>
            <input className="form-input" placeholder="kWh, m3, Mbps" {...register('satuan')} />
          </div>
          <div>
            <label className="form-label">Status Bayar</label>
            <select className="form-select" {...register('statusBayar')}>
              <option value="BELUM">Belum Bayar</option>
              <option value="SUDAH">Sudah Bayar</option>
            </select>
          </div>
          {statusBayar === 'SUDAH' && (
            <div>
              <label className="form-label">Tgl Bayar</label>
              <input type="date" className="form-input" {...register('tanggalBayar')} />
            </div>
          )}
        </div>
        <div>
          <label className="form-label">Keterangan</label>
          <textarea className="form-input" rows={2} {...register('keterangan')} />
        </div>
      </form>
    </Modal>
  )
}

export default function UtilitasPage() {
  const [data, setData] = useState([])
  const [summary, setSummary] = useState([])
  const [loading, setLoading] = useState(true)
  const [tahun, setTahun] = useState(new Date().getFullYear())
  const [jenisFilter, setJenisFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ tahun, ...(jenisFilter && { jenis: jenisFilter }) })
      const res = await fetch(`/api/gedung/utilitas?${params}`)
      const json = await res.json()
      setData(json.data || [])
      setSummary(json.summary || [])
    } finally { setLoading(false) }
  }, [tahun, jenisFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const handleDelete = async () => {
    try {
      await fetch(`/api/gedung/utilitas?id=${deleteId}`, { method: 'DELETE' })
      toast.success('Data dihapus')
      fetchData()
    } finally { setDeleteId(null) }
  }

  // Chart data - monthly tagihan per jenis
  const chartData = MONTHS.map((m, i) => {
    const row = { month: m.slice(0, 3) }
    JENIS.forEach((j) => {
      const found = data.find((d) => d.bulan === i + 1 && d.jenis === j)
      row[j] = found?.tagihan || 0
    })
    return row
  })

  const colors = { LISTRIK: '#f59e0b', AIR: '#3b82f6', INTERNET: '#8b5cf6', AC: '#06b6d4', GAS: '#ef4444', LAINNYA: '#6b7280' }

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
              <Bar key={j} dataKey={j} fill={colors[j]} radius={[2, 2, 0, 0]} stackId="a" />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-4 flex gap-3">
        <select className="form-select w-32" value={tahun} onChange={(e) => setTahun(parseInt(e.target.value))}>
          {[2022, 2023, 2024, 2025].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select className="form-select w-40" value={jenisFilter} onChange={(e) => setJenisFilter(e.target.value)}>
          <option value="">Semua Jenis</option>
          {JENIS.map((j) => <option key={j} value={j}>{j}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? <PageLoader /> : data.length === 0 ? <EmptyState icon={Zap} title="Belum ada data utilitas" /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th">Jenis</th>
                  <th className="table-th">Periode</th>
                  <th className="table-th">Penggunaan</th>
                  <th className="table-th">Tagihan</th>
                  <th className="table-th">Status Bayar</th>
                  <th className="table-th">Tgl Bayar</th>
                  <th className="table-th">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="table-td">
                      <span className="badge bg-gray-100 text-gray-700">{u.jenis}</span>
                    </td>
                    <td className="table-td">{MONTHS[u.bulan - 1]} {u.tahun}</td>
                    <td className="table-td">{u.penggunaan ? `${u.penggunaan} ${u.satuan || ''}` : '-'}</td>
                    <td className="table-td font-semibold">{formatCurrency(u.tagihan)}</td>
                    <td className="table-td"><Badge status={u.statusBayar} /></td>
                    <td className="table-td">{u.tanggalBayar ? new Date(u.tanggalBayar).toLocaleDateString('id-ID') : '-'}</td>
                    <td className="table-td">
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setEditData(u); setShowModal(true) }} className="p-1.5 rounded hover:bg-green-50 text-green-600">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteId(u.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UtilitasModal isOpen={showModal} onClose={() => { setShowModal(false); setEditData(null) }} onSaved={() => { setShowModal(false); setEditData(null); fetchData() }} editData={editData} />
      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Hapus Data Utilitas" />
    </div>
  )
}
