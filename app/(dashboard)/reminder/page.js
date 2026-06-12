'use client'

import { useMemo, useState } from 'react'
import { AlarmClockCheck, CircleCheckBig, CirclePlus, SquarePen, Trash } from 'lucide-react'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import PageHeader from '@/components/ui/PageHeader'
import DataTable from '@/components/ui/DataTable'
import Badge from '@/components/ui/Badge'
import Modal, { ConfirmModal } from '@/components/ui/Modal'
import { formatCurrency, formatDate, getDaysDiff } from '@/lib/utils'

const KATEGORI = [
  { value: 'LISTRIK', label: 'Listrik' },
  { value: 'AIR', label: 'Air' },
  { value: 'INTERNET', label: 'Internet' },
  { value: 'PAJAK_KENDARAAN', label: 'Pajak Kendaraan' },
  { value: 'PERAWATAN_KENDARAAN', label: 'Perawatan Kendaraan' },
  { value: 'LAINNYA', label: 'Lainnya' },
]

const RECURRENCE = [
  { value: 'NONE', label: 'Tidak berulang' },
  { value: 'MONTHLY', label: 'Bulanan' },
  { value: 'QUARTERLY', label: '3 bulanan' },
  { value: 'YEARLY', label: 'Tahunan' },
]

const categoryLabel = (value) => KATEGORI.find((item) => item.value === value)?.label || value
const recurrenceLabel = (value) => RECURRENCE.find((item) => item.value === value)?.label || value
const toInputDate = (date) => date ? new Date(date).toISOString().slice(0, 10) : ''

function ReminderModal({ isOpen, onClose, onSaved, editData }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    values: {
      judul: editData?.judul || '',
      kategori: editData?.kategori || 'LISTRIK',
      tanggalJatuhTempo: toInputDate(editData?.tanggalJatuhTempo) || toInputDate(new Date()),
      jumlah: editData?.jumlah || '',
      prioritas: editData?.prioritas || 'NORMAL',
      recurrence: editData?.recurrence || 'MONTHLY',
      catatan: editData?.catatan || '',
    },
  })

  const onSubmit = async (data) => {
    try {
      const res = await fetch('/api/reminder', {
        method: editData ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData ? { id: editData.id, ...data } : data),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Gagal menyimpan reminder')
      }
      toast.success(editData ? 'Reminder diperbarui' : 'Reminder ditambahkan')
      reset()
      onSaved()
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editData ? 'Edit Reminder' : 'Tambah Reminder'}
      size="lg"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-secondary">Batal</button>
          <button type="submit" form="reminder-form" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
          </button>
        </>
      }
    >
      <form id="reminder-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="form-label">Judul Reminder</label>
            <input
              className="form-input"
              placeholder="Contoh: Bayar listrik PLN kantor"
              {...register('judul', { required: true })}
            />
          </div>
          <div>
            <label className="form-label">Kategori</label>
            <select className="form-select" {...register('kategori', { required: true })}>
              {KATEGORI.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Jatuh Tempo</label>
            <input type="date" className="form-input" {...register('tanggalJatuhTempo', { required: true })} />
          </div>
          <div>
            <label className="form-label">Estimasi / Tagihan (Rp)</label>
            <input type="number" className="form-input" placeholder="Opsional" {...register('jumlah')} />
          </div>
          <div>
            <label className="form-label">Prioritas</label>
            <select className="form-select" {...register('prioritas')}>
              <option value="LOW">Rendah</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">Tinggi</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="form-label">Pengulangan</label>
            <select className="form-select" {...register('recurrence')}>
              {RECURRENCE.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="form-label">Catatan</label>
            <textarea className="form-textarea" rows={3} placeholder="Nomor pelanggan, instruksi pembayaran, kontak vendor..." {...register('catatan')} />
          </div>
        </div>
      </form>
    </Modal>
  )
}

export default function ReminderPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('ACTIVE')
  const [kategoriFilter, setKategoriFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const params = new URLSearchParams({
    ...(statusFilter && { status: statusFilter }),
    ...(kategoriFilter && { kategori: kategoriFilter }),
  })

  const { data: result, isLoading } = useQuery({
    queryKey: ['reminder', statusFilter, kategoriFilter],
    queryFn: () => fetch(`/api/reminder?${params}`).then(r => r.json()),
    keepPreviousData: true,
  })

  const rows = result?.data || []
  const overdue = rows.filter((r) => r.status === 'ACTIVE' && getDaysDiff(r.tanggalJatuhTempo) < 0)
  const dueSoon = rows.filter((r) => {
    const diff = getDaysDiff(r.tanggalJatuhTempo)
    return r.status === 'ACTIVE' && diff !== null && diff >= 0 && diff <= 30
  })

  const doneMutation = useMutation({
    mutationFn: (id) => fetch('/api/reminder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'DONE' }),
    }).then(r => r.json()),
    onSuccess: () => {
      toast.success('Reminder ditandai selesai')
      queryClient.invalidateQueries({ queryKey: ['reminder'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => fetch(`/api/reminder?id=${id}`, { method: 'DELETE' }).then(r => r.json()),
    onSuccess: () => {
      toast.success('Reminder dihapus')
      setDeleteId(null)
      queryClient.invalidateQueries({ queryKey: ['reminder'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  const handleSaved = () => {
    setShowModal(false)
    setEditData(null)
    queryClient.invalidateQueries({ queryKey: ['reminder'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }

  const columns = useMemo(() => [
    {
      accessorKey: 'judul',
      header: 'Reminder',
      cell: ({ row }) => (
        <div>
          <p className="font-semibold text-gray-900">{row.original.judul}</p>
          {row.original.catatan && <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{row.original.catatan}</p>}
        </div>
      ),
    },
    {
      accessorKey: 'kategori',
      header: 'Kategori',
      cell: ({ getValue }) => <span className="badge bg-cyan-50 text-cyan-700 border border-cyan-100">{categoryLabel(getValue())}</span>,
    },
    {
      accessorKey: 'tanggalJatuhTempo',
      header: 'Jatuh Tempo',
      cell: ({ getValue, row }) => {
        const diff = getDaysDiff(getValue())
        const urgent = row.original.status === 'ACTIVE' && diff !== null && diff <= 7
        return (
          <span className={urgent ? 'font-bold text-red-600' : 'font-medium text-gray-700'}>
            {formatDate(getValue())}
            {row.original.status === 'ACTIVE' && diff !== null && (
              <span className="text-xs ml-1 text-gray-400">
                {diff < 0 ? `(Lewat ${Math.abs(diff)}h)` : `(${diff}h)`}
              </span>
            )}
          </span>
        )
      },
    },
    {
      accessorKey: 'jumlah',
      header: 'Estimasi',
      cell: ({ getValue }) => <span className="font-semibold">{formatCurrency(getValue())}</span>,
    },
    {
      accessorKey: 'prioritas',
      header: 'Prioritas',
      cell: ({ getValue }) => <Badge status={getValue()} />,
    },
    {
      accessorKey: 'recurrence',
      header: 'Ulang',
      cell: ({ getValue }) => <span className="text-xs text-gray-500">{recurrenceLabel(getValue())}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => (
        <span className={getValue() === 'ACTIVE' ? 'badge bg-blue-100 text-blue-700' : 'badge bg-emerald-100 text-emerald-700'}>
          {getValue() === 'ACTIVE' ? 'Aktif' : 'Selesai'}
        </span>
      ),
    },
    {
      id: 'aksi',
      header: 'Aksi',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {row.original.status === 'ACTIVE' && (
            <button onClick={() => doneMutation.mutate(row.original.id)} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors" title="Selesai">
              <CircleCheckBig className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => { setEditData(row.original); setShowModal(true) }} className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors" title="Edit">
            <SquarePen className="w-4 h-4" />
          </button>
          <button onClick={() => setDeleteId(row.original.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors" title="Hapus">
            <Trash className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ], [doneMutation])

  return (
    <div>
      <PageHeader
        title="Reminder Pembayaran & Perawatan"
        subtitle="Pengingat listrik, air, internet, pajak kendaraan, servis kendaraan, dan kebutuhan rutin lainnya"
        breadcrumb={[{ label: 'Dashboard', href: '/' }, { label: 'Reminder' }]}
        actions={
          <button onClick={() => { setEditData(null); setShowModal(true) }} className="btn-primary">
            <CirclePlus className="w-4 h-4" /> Tambah Reminder
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="card p-4 flex items-center gap-3">
          <div className="icon-tile w-11 h-11 bg-gradient-to-br from-red-50 to-rose-50 text-red-600 ring-1 ring-red-100">
            <AlarmClockCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Terlambat</p>
            <p className="text-2xl font-bold text-red-600">{overdue.length}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="icon-tile w-11 h-11 bg-gradient-to-br from-amber-50 to-orange-50 text-amber-600 ring-1 ring-amber-100">
            <AlarmClockCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Jatuh tempo 30 hari</p>
            <p className="text-2xl font-bold text-amber-600">{dueSoon.length}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="icon-tile w-11 h-11 bg-gradient-to-br from-cyan-50 to-blue-50 text-cyan-600 ring-1 ring-cyan-100">
            <AlarmClockCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Total tampil</p>
            <p className="text-2xl font-bold text-gray-800">{rows.length}</p>
          </div>
        </div>
      </div>

      <div className="card p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <select className="form-select sm:w-44" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="ACTIVE">Aktif</option>
          <option value="DONE">Selesai</option>
          <option value="">Semua Status</option>
        </select>
        <select className="form-select sm:w-56" value={kategoriFilter} onChange={(e) => setKategoriFilter(e.target.value)}>
          <option value="">Semua Kategori</option>
          {KATEGORI.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
      </div>

      <div className="page-section">
        <DataTable data={rows} columns={columns} isLoading={isLoading} emptyMessage="Belum ada reminder" />
      </div>

      <ReminderModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditData(null) }}
        onSaved={handleSaved}
        editData={editData}
      />
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId)}
        loading={deleteMutation.isPending}
        title="Hapus Reminder"
        message="Apakah Anda yakin ingin menghapus reminder ini?"
      />
    </div>
  )
}
