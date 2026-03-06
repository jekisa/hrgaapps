'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Modal from '@/components/ui/Modal'

const KATEGORI = ['ELEKTRONIK', 'PERALATAN', 'KENDARAAN', 'FURNITURE', 'LAINNYA']

export default function AsetModal({ isOpen, onClose, onSaved, editData }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()

  useEffect(() => {
    if (editData) {
      reset({
        kodeAset: editData.kodeAset,
        namaAset: editData.namaAset,
        kategori: editData.kategori,
        merk: editData.merk,
        model: editData.model,
        serialNumber: editData.serialNumber,
        tahunPerolehan: editData.tahunPerolehan,
        nilaiPerolehan: editData.nilaiPerolehan,
        kondisi: editData.kondisi,
        status: editData.status,
        lokasi: editData.lokasi,
        keterangan: editData.keterangan,
      })
    } else {
      reset({ kondisi: 'BAIK', status: 'AKTIF', kategori: 'ELEKTRONIK' })
    }
  }, [editData, reset, isOpen])

  const onSubmit = async (data) => {
    try {
      const url = editData ? `/api/aset/${editData.id}` : '/api/aset'
      const method = editData ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Gagal')
      toast.success(editData ? 'Aset diperbarui' : 'Aset ditambahkan')
      onSaved()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editData ? 'Edit Aset' : 'Tambah Aset'}
      size="lg"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-secondary">Batal</button>
          <button type="submit" form="aset-form" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
          </button>
        </>
      }
    >
      <form id="aset-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Kode Aset <span className="text-red-500">*</span></label>
            <input className="form-input" {...register('kodeAset', { required: 'Kode aset wajib diisi' })} disabled={!!editData} />
            {errors.kodeAset && <p className="text-xs text-red-500 mt-1">{errors.kodeAset.message}</p>}
          </div>
          <div>
            <label className="form-label">Nama Aset <span className="text-red-500">*</span></label>
            <input className="form-input" {...register('namaAset', { required: 'Nama aset wajib diisi' })} />
            {errors.namaAset && <p className="text-xs text-red-500 mt-1">{errors.namaAset.message}</p>}
          </div>
          <div>
            <label className="form-label">Kategori</label>
            <select className="form-select" {...register('kategori')}>
              {KATEGORI.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Merk</label>
            <input className="form-input" placeholder="Dell, HP, dll" {...register('merk')} />
          </div>
          <div>
            <label className="form-label">Model</label>
            <input className="form-input" placeholder="XPS 15, LaserJet Pro" {...register('model')} />
          </div>
          <div>
            <label className="form-label">Serial Number</label>
            <input className="form-input" {...register('serialNumber')} />
          </div>
          <div>
            <label className="form-label">Tahun Perolehan</label>
            <input type="number" className="form-input" placeholder="2023" {...register('tahunPerolehan')} />
          </div>
          <div>
            <label className="form-label">Nilai Perolehan (Rp)</label>
            <input type="number" className="form-input" placeholder="5000000" {...register('nilaiPerolehan')} />
          </div>
          <div>
            <label className="form-label">Kondisi</label>
            <select className="form-select" {...register('kondisi')}>
              <option value="BAIK">Baik</option>
              <option value="RUSAK_RINGAN">Rusak Ringan</option>
              <option value="RUSAK_BERAT">Rusak Berat</option>
            </select>
          </div>
          <div>
            <label className="form-label">Status</label>
            <select className="form-select" {...register('status')}>
              <option value="AKTIF">Aktif</option>
              <option value="RUSAK">Rusak</option>
              <option value="DISPOSAL">Disposal</option>
            </select>
          </div>
          <div>
            <label className="form-label">Lokasi</label>
            <input className="form-input" placeholder="Ruang IT, Lantai 2" {...register('lokasi')} />
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
