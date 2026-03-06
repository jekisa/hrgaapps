'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Edit, Trash2, Car } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '@/components/ui/PageHeader'
import Badge from '@/components/ui/Badge'
import Pagination from '@/components/ui/Pagination'
import EmptyState from '@/components/ui/EmptyState'
import Modal, { ConfirmModal } from '@/components/ui/Modal'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { formatDate, getDaysDiff } from '@/lib/utils'
import { useForm } from 'react-hook-form'

function KendaraanModal({ isOpen, onClose, onSaved, editData }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()

  useEffect(() => {
    if (editData) {
      reset({
        ...editData,
        tanggalPajakBerakhir: editData.tanggalPajakBerakhir?.split('T')[0],
        tanggalSTNKBerakhir: editData.tanggalSTNKBerakhir?.split('T')[0],
      })
    } else {
      reset({ status: 'TERSEDIA', jenisKendaraan: 'MOBIL' })
    }
  }, [editData, reset, isOpen])

  const onSubmit = async (data) => {
    try {
      const url = editData ? `/api/kendaraan/${editData.id}` : '/api/kendaraan'
      const method = editData ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success(editData ? 'Kendaraan diperbarui' : 'Kendaraan ditambahkan')
      onSaved()
    } catch (err) { toast.error(err.message) }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editData ? 'Edit Kendaraan' : 'Tambah Kendaraan'} size="lg"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-secondary">Batal</button>
          <button type="submit" form="kend-form" disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'Menyimpan...' : 'Simpan'}</button>
        </>
      }
    >
      <form id="kend-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">No Polisi <span className="text-red-500">*</span></label>
            <input className="form-input uppercase" placeholder="B 1234 ABC" {...register('noPol', { required: true })} disabled={!!editData} />
          </div>
          <div>
            <label className="form-label">Jenis Kendaraan</label>
            <select className="form-select" {...register('jenisKendaraan')}>
              <option value="MOBIL">Mobil</option>
              <option value="MOTOR">Motor</option>
              <option value="TRUCK">Truck</option>
              <option value="BUS">Bus</option>
            </select>
          </div>
          <div>
            <label className="form-label">Merk <span className="text-red-500">*</span></label>
            <input className="form-input" placeholder="Toyota, Honda" {...register('merk', { required: true })} />
          </div>
          <div>
            <label className="form-label">Model</label>
            <input className="form-input" placeholder="Innova, Vario" {...register('model')} />
          </div>
          <div>
            <label className="form-label">Tahun</label>
            <input type="number" className="form-input" placeholder="2022" {...register('tahun')} />
          </div>
          <div>
            <label className="form-label">Warna</label>
            <input className="form-input" placeholder="Putih" {...register('warna')} />
          </div>
          <div>
            <label className="form-label">No Rangka</label>
            <input className="form-input" {...register('noRangka')} />
          </div>
          <div>
            <label className="form-label">No Mesin</label>
            <input className="form-input" {...register('noMesin')} />
          </div>
          <div>
            <label className="form-label">Status</label>
            <select className="form-select" {...register('status')}>
              <option value="TERSEDIA">Tersedia</option>
              <option value="DIGUNAKAN">Digunakan</option>
              <option value="SERVIS">Servis</option>
              <option value="TIDAK_AKTIF">Tidak Aktif</option>
            </select>
          </div>
          <div>
            <label className="form-label">Pajak Berakhir</label>
            <input type="date" className="form-input" {...register('tanggalPajakBerakhir')} />
          </div>
          <div>
            <label className="form-label">STNK Berakhir</label>
            <input type="date" className="form-input" {...register('tanggalSTNKBerakhir')} />
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

export default function KendaraanPage() {
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 10, ...(search && { search }), ...(statusFilter && { status: statusFilter }) })
      const res = await fetch(`/api/kendaraan?${params}`)
      const json = await res.json()
      setData(json.data || [])
      setTotal(json.total || 0)
      setTotalPages(json.totalPages || 1)
    } finally { setLoading(false) }
  }, [page, search, statusFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/kendaraan/${deleteId}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Kendaraan dihapus'); fetchData() }
      else { const e = await res.json(); toast.error(e.error) }
    } finally { setDeleting(false); setDeleteId(null) }
  }

  return (
    <div>
      <PageHeader
        title="Manajemen Kendaraan"
        subtitle={`${total} kendaraan terdaftar`}
        breadcrumb={[{ label: 'Dashboard', href: '/' }, { label: 'Kendaraan' }]}
        actions={
          <button onClick={() => { setEditData(null); setShowModal(true) }} className="btn-primary">
            <Plus className="w-4 h-4" /> Tambah Kendaraan
          </button>
        }
      />

      <div className="card p-4 mb-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="form-input pl-9" placeholder="Cari no polisi atau merk..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="form-select w-44" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Semua Status</option>
            <option value="TERSEDIA">Tersedia</option>
            <option value="DIGUNAKAN">Digunakan</option>
            <option value="SERVIS">Servis</option>
            <option value="TIDAK_AKTIF">Tidak Aktif</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? <PageLoader /> : data.length === 0 ? (
          <EmptyState icon={Car} title="Belum ada kendaraan" action={<button onClick={() => setShowModal(true)} className="btn-primary"><Plus className="w-4 h-4" />Tambah</button>} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-th">No Polisi</th>
                    <th className="table-th">Kendaraan</th>
                    <th className="table-th">Tahun</th>
                    <th className="table-th">Status</th>
                    <th className="table-th">Pajak Berakhir</th>
                    <th className="table-th">STNK Berakhir</th>
                    <th className="table-th">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.map((k) => {
                    const pajakDiff = getDaysDiff(k.tanggalPajakBerakhir)
                    return (
                      <tr key={k.id} className="hover:bg-gray-50">
                        <td className="table-td font-mono font-bold text-sm">{k.noPol}</td>
                        <td className="table-td">
                          <p className="font-medium">{k.merk} {k.model}</p>
                          <p className="text-xs text-gray-400">{k.jenisKendaraan} • {k.warna}</p>
                        </td>
                        <td className="table-td">{k.tahun || '-'}</td>
                        <td className="table-td"><Badge status={k.status} /></td>
                        <td className="table-td">
                          {k.tanggalPajakBerakhir ? (
                            <span className={pajakDiff !== null && pajakDiff <= 30 ? 'text-red-600 font-semibold' : ''}>
                              {formatDate(k.tanggalPajakBerakhir, 'dd/MM/yyyy')}
                              {pajakDiff !== null && pajakDiff <= 30 && pajakDiff >= 0 && (
                                <span className="text-xs ml-1">({pajakDiff}h)</span>
                              )}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="table-td">{k.tanggalSTNKBerakhir ? formatDate(k.tanggalSTNKBerakhir, 'dd/MM/yyyy') : '-'}</td>
                        <td className="table-td">
                          <div className="flex items-center gap-1">
                            <button onClick={() => { setEditData(k); setShowModal(true) }} className="p-1.5 rounded hover:bg-green-50 text-green-600">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteId(k.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center">
              <p className="text-xs text-gray-500">Total {total} kendaraan</p>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      <KendaraanModal isOpen={showModal} onClose={() => { setShowModal(false); setEditData(null) }} onSaved={() => { setShowModal(false); setEditData(null); fetchData() }} editData={editData} />
      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} title="Hapus Kendaraan" />
    </div>
  )
}
