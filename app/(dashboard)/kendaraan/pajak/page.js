'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, CheckCircle, FileText, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '@/components/ui/PageHeader'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { formatDate, formatCurrency, getDaysDiff } from '@/lib/utils'
import { useForm } from 'react-hook-form'

function BayarModal({ isOpen, onClose, onSaved, pajakData }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()

  useEffect(() => {
    if (pajakData) {
      reset({ jumlah: pajakData.jumlah, tanggalPajakBaruBerakhir: '' })
    }
  }, [pajakData, reset])

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
          <input type="number" className="form-input" {...register('jumlah')} />
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
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()
  const [kendaraanList, setKendaraanList] = useState([])

  useEffect(() => {
    if (isOpen) {
      fetch('/api/kendaraan?limit=100').then(r => r.json()).then(d => setKendaraanList(d.data || []))
      reset({ jenisPajak: 'PKB', tahun: new Date().getFullYear(), status: 'BELUM' })
    }
  }, [isOpen, reset])

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
            <input type="number" className="form-input" {...register('tahun')} />
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
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [showBayar, setShowBayar] = useState(false)
  const [showTambah, setShowTambah] = useState(false)
  const [selectedPajak, setSelectedPajak] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams(statusFilter ? { status: statusFilter } : {})
      const res = await fetch(`/api/kendaraan/pajak?${params}`)
      const json = await res.json()
      setData(json || [])
    } finally { setLoading(false) }
  }, [statusFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const belumBayar = data.filter((d) => d.status === 'BELUM')
  const jatuhTempo30 = belumBayar.filter((d) => {
    const diff = getDaysDiff(d.tanggalJatuhTempo)
    return diff !== null && diff >= 0 && diff <= 30
  })

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

      {/* Alerts */}
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
          <p className="text-2xl font-bold text-green-600">{data.filter((d) => d.status === 'SUDAH').length}</p>
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

      <div className="card overflow-hidden">
        {loading ? <PageLoader /> : data.length === 0 ? <EmptyState icon={FileText} title="Tidak ada data pajak" /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th">Kendaraan</th>
                  <th className="table-th">Jenis Pajak</th>
                  <th className="table-th">Tahun</th>
                  <th className="table-th">Jatuh Tempo</th>
                  <th className="table-th">Jumlah</th>
                  <th className="table-th">Tgl Bayar</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.map((p) => {
                  const diff = getDaysDiff(p.tanggalJatuhTempo)
                  const isUrgent = p.status === 'BELUM' && diff !== null && diff <= 30
                  return (
                    <tr key={p.id} className={`hover:bg-gray-50 ${isUrgent ? 'bg-red-50/30' : ''}`}>
                      <td className="table-td">
                        <p className="font-mono font-bold text-sm">{p.kendaraan?.noPol}</p>
                        <p className="text-xs text-gray-400">{p.kendaraan?.merk} {p.kendaraan?.model}</p>
                      </td>
                      <td className="table-td font-medium">{p.jenisPajak}</td>
                      <td className="table-td">{p.tahun || '-'}</td>
                      <td className="table-td">
                        <span className={isUrgent ? 'text-red-600 font-bold' : ''}>
                          {formatDate(p.tanggalJatuhTempo)}
                          {isUrgent && diff >= 0 && <span className="text-xs ml-1">({diff}h)</span>}
                          {isUrgent && diff < 0 && <span className="text-xs ml-1">(Lewat!)</span>}
                        </span>
                      </td>
                      <td className="table-td font-semibold">{formatCurrency(p.jumlah)}</td>
                      <td className="table-td">{p.tanggalBayar ? formatDate(p.tanggalBayar) : '-'}</td>
                      <td className="table-td"><Badge status={p.status} /></td>
                      <td className="table-td">
                        {p.status === 'BELUM' && (
                          <button
                            onClick={() => { setSelectedPajak(p); setShowBayar(true) }}
                            className="flex items-center gap-1 text-xs text-green-600 hover:bg-green-50 px-2 py-1 rounded"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Bayar
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <BayarModal isOpen={showBayar} onClose={() => { setShowBayar(false); setSelectedPajak(null) }} onSaved={() => { setShowBayar(false); setSelectedPajak(null); fetchData() }} pajakData={selectedPajak} />
      <TambahPajakModal isOpen={showTambah} onClose={() => setShowTambah(false)} onSaved={() => { setShowTambah(false); fetchData() }} />
    </div>
  )
}
