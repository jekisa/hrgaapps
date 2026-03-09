'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Modal from '@/components/ui/Modal'

export default function KendaraanModal({ isOpen, onClose, onSaved, editData }) {
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
      const id = editData?._id || editData?.id
      const url = id ? `/api/kendaraan/${id}` : '/api/kendaraan'
      const method = id ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success(id ? 'Kendaraan diperbarui' : 'Kendaraan ditambahkan')
      onSaved()
    } catch (err) {
      toast.error(err.message || 'Terjadi kesalahan')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editData ? 'Edit Kendaraan' : 'Tambah Kendaraan'}
      size="lg"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-secondary">Batal</button>
          <button type="submit" form="kend-form" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
          </button>
        </>
      }
    >
      <form id="kend-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">No Polisi <span className="text-red-500">*</span></label>
            <input className="form-input uppercase" placeholder="B 1234 ABC"
              {...register('noPol', { required: true })} disabled={!!editData} />
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
