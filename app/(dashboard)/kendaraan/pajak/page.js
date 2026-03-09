'use client'

import { useState, useMemo } from 'react'
import { Plus, CheckCircle, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import PageHeader from '@/components/ui/PageHeader'
import Badge from '@/components/ui/Badge'
import DataTable from '@/components/ui/DataTable'
import Modal from '@/components/ui/Modal'
import { formatDate, formatCurrency, getDaysDiff } from '@/lib/utils'

function BayarModal({ isOpen, onClose, onSaved, pajakData }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm()

  const onSubmit = async (data) => {
    try {
      const res = await fetch('/api/kendaraan/pajak', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pajakData.id, ...data }),
      })
      if (res.ok) { toast.success('Pembayaran pajak dicatat'); onSaved() }
      else toast.error('Gagal mencatat pembayaran')
    } catch { toast.error('Terjadi kesalahan') }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bayar Pajak Kendaraan" size="sm"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-secondary">Batal</button>
          <button type="submit" form="bayar-form" disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'Menyimpan...' : 'Konfirmasi Bayar'}</button>
        </>
      }
    >
      <form id="bayar-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {pajakData && (
          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            <p className="font-medium">{pajakData.kendaraan?.noPol} - {pajakData.kendaraan?.merk}</p>
            <p className="text-gray-500">{pajakData.jenisPajak} | Jatuh tempo: {formatDate(pajakData.tanggalJatuhTempo)}</p>
          </div>
        )}
        <div>
          <label className="form-label">Jumlah Bayar (Rp)</label>
          <input type="number" className="form-input" {...register('jumlah')} defaultValue={pajakData?.jumlah} />
        </div>
        <div>
          <label className="form-label">Keterangan</label>
          <textarea className="form-input" rows={2} {...register('keterangan')} />
        </div>
        <div>
          <label className="form-label">Tanggal Pajak Baru Berakhir (opsional)</label>
          <input type="date" className="form-input" {...register('tanggalPajakBaruBerakhir')} />
        </div>
      </form>
    </Modal>
  )
}

function TambahPajakModal({ isOpen, onClose, onSaved }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm()

  const { data: kendaraanResult } = useQuery({
    queryKey: ['kendaraan-all'],
    queryFn: () => fetch('/api/kendaraan?limit=100').then(r => r.json()),
    enabled: isOpen,
    staleTime: 1000 * 60 * 5,
  })

  const kendaraanList = kendaraanResult?.data || []

  const onSubmit = async (data) => {
    try {
      const res = await fetch('/api/kendaraan/pajak', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (res.ok) { toast.success('Data pajak ditambahkan'); onSaved() }
      else toast.error('Gagal')
    } catch { toast.error('Terjadi kesalahan') }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tambah Data Pajak" size="md"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-secondary">Batal</button>
          <button type="submit" form="tambah-pajak-form" disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'Menyimpan...' : 'Simpan'}</button>
        </>
      }
    >
      <form id="tambah-pajak-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Kendaraan</label>
            <select className="form-select" {...register('kendaraanId', { required: true })}>
              <option value="">- Pilih -</option>
              {kendaraanList.map((k) => <option key={k.id} value={k.id}>{k.noPol} - {k.merk}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Jenis Pajak</label>
            <select className="form-select" {...register('jenisPajak')}>
              <option value="PKB">PKB (Pajak Kendaraan)</option>
              <option value="STNK">STNK</option>
              <option value="KIR">KIR</option>
            </select>
          </div>
          <div>
            <label className="form-label">Tahun</label>
            <input type="number" className="form-input" {...register('tahun')} defaultValue={new Date().getFullYear()} />
          </div>
          <div>
            <label className="form-label">Jatuh Tempo</label>
            <input type="date" className="form-input" {...register('tanggalJatuhTempo')} />
          </div>
          <div>
            <label className="form-label">Jumlah (Rp)</label>
            <input type="number" className="form-input" {...register('jumlah')} />
          </div>
        </div>
        <div>
          <label className="form-label">Keterangan</label>
          <textarea className="form-input" rows={2} {...register('keterangan')} />
        </div>
      </form>
    </Modal>
  )
}

export default function PajakKendaraanPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('')
  const [showBayar, setShowBayar] = useState(false)
  const [showTambah, setShowTambah] = useState(false)
  const [selectedPajak, setSelectedPajak] = useState(null)

  const params = new URLSearchParams(statusFilter ? { status: statusFilter } : {})

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['pajak-kendaraan', statusFilter],
    queryFn: () => fetch(`/api/kendaraan/pajak?${params}`).then(r => r.json()),
  })

  const belumBayar = rows.filter((d) => d.status === 'BELUM')
  const jatuhTempo30 = belumBayar.filter((d) => {
    const diff = getDaysDiff(d.tanggalJatuhTempo)
    return diff !== null && diff >= 0 && diff <= 30
  })

  const handleSaved = () => {
    setShowBayar(false)
    setShowTambah(false)
    setSelectedPajak(null)
    queryClient.invalidateQueries({ queryKey: ['pajak-kendaraan'] })
  }

  const columns = useMemo(() => [
    {
      id: 'kendaraan',
      header: 'Kendaraan',
      cell: ({ row }) => (
        <div>
          <p className="font-mono font-bold text-sm">{row.original.kendaraan?.noPol}</p>
          <p className="text-xs text-gray-400">{row.original.kendaraan?.merk} {row.original.kendaraan?.model}</p>
        </div>
      ),
    },
    {
      accessorKey: 'jenisPajak',
      header: 'Jenis Pajak',
      cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
    },
    {
      accessorKey: 'tahun',
      header: 'Tahun',
      cell: ({ getValue }) => getValue() || '-',
    },
    {
      accessorKey: 'tanggalJatuhTempo',
      header: 'Jatuh Tempo',
      cell: ({ getValue, row }) => {
        const diff = getDaysDiff(getValue())
        const isUrgent = row.original.status === 'BELUM' && diff !== null && diff <= 30
        return (
          <span className={isUrgent ? 'text-red-600 font-bold' : ''}>
            {formatDate(getValue())}
            {isUrgent && diff >= 0 && <span className="text-xs ml-1">({diff}h)</span>}
            {isUrgent && diff < 0 && <span className="text-xs ml-1">(Lewat!)</span>}
          </span>
        )
      },
    },
    {
      accessorKey: 'jumlah',
      header: 'Jumlah',
      cell: ({ getValue }) => <span className="font-semibold">{formatCurrency(getValue())}</span>,
    },
    {
      accessorKey: 'tanggalBayar',
      header: 'Tgl Bayar',
      cell: ({ getValue }) => getValue() ? formatDate(getValue()) : '-',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => <Badge status={getValue()} />,
    },
    {
      id: 'aksi',
      header: 'Aksi',
      cell: ({ row }) => row.original.status === 'BELUM' ? (
        <button onClick={() => { setSelectedPajak(row.original); setShowBayar(true) }}
          className="flex items-center gap-1 text-xs text-green-600 hover:bg-green-50 px-2 py-1 rounded"
        >
          <CheckCircle className="w-3.5 h-3.5" /> Bayar
        </button>
      ) : null,
    },
  ], [])

  return (
    <div>
      <PageHeader
        title="Pembayaran Pajak Kendaraan"
        subtitle="Monitor dan catat pembayaran pajak kendaraan"
        breadcrumb={[{ label: 'Dashboard', href: '/' }, { label: 'Kendaraan', href: '/kendaraan' }, { label: 'Pajak' }]}
        actions={
          <button onClick={() => setShowTambah(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Tambah Data
          </button>
        }
      />

      {jatuhTempo30.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-red-800">Perhatian: {jatuhTempo30.length} pajak akan jatuh tempo dalam 30 hari!</p>
            <p className="text-sm text-red-600 mt-0.5">
              {jatuhTempo30.map((d) => `${d.kendaraan?.noPol} (${formatDate(d.tanggalJatuhTempo)})`).join(', ')}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="card p-4">
          <p className="text-sm text-gray-500">Belum Dibayar</p>
          <p className="text-2xl font-bold text-red-600">{belumBayar.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Sudah Dibayar</p>
          <p className="text-2xl font-bold text-green-600">{rows.filter((d) => d.status === 'SUDAH').length}</p>
        </div>
      </div>

      <div className="card p-4 mb-4">
        <div className="flex gap-2">
          {[{ v: '', l: 'Semua' }, { v: 'BELUM', l: 'Belum Bayar' }, { v: 'SUDAH', l: 'Sudah Bayar' }].map((s) => (
            <button key={s.v} onClick={() => setStatusFilter(s.v)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${statusFilter === s.v ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
            >
              {s.l}
            </button>
          ))}
        </div>
      </div>

      <div className="page-section">
        <DataTable data={rows} columns={columns} isLoading={isLoading} emptyMessage="Tidak ada data pajak" />
      </div>

      <BayarModal isOpen={showBayar} onClose={() => { setShowBayar(false); setSelectedPajak(null) }} onSaved={handleSaved} pajakData={selectedPajak} />
      <TambahPajakModal isOpen={showTambah} onClose={() => setShowTambah(false)} onSaved={handleSaved} />
    </div>
  )
}
