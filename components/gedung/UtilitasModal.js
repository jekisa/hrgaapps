'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Modal from '@/components/ui/Modal'
import { MONTHS } from '@/lib/utils'

const JENIS = ['LISTRIK', 'AIR', 'INTERNET', 'AC', 'GAS', 'LAINNYA']

export default function UtilitasModal({ isOpen, onClose, onSaved, editData }) {
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
