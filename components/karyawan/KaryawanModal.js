'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Modal from '@/components/ui/Modal'
import { DEPARTEMEN_LIST } from '@/lib/utils'

export default function KaryawanModal({ isOpen, onClose, onSaved, editData }) {
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm()
  const statusKontrak = watch('statusKontrak')

  useEffect(() => {
    if (editData) {
      reset({
        nik: editData.nik,
        nama: editData.nama,
        tempatLahir: editData.tempatLahir,
        tanggalLahir: editData.tanggalLahir?.split('T')[0],
        jenisKelamin: editData.jenisKelamin,
        agama: editData.agama,
        alamat: editData.alamat,
        telepon: editData.telepon,
        email: editData.email,
        statusKontrak: editData.statusKontrak,
        tanggalMasuk: editData.tanggalMasuk?.split('T')[0],
        tanggalKontrakBerakhir: editData.tanggalKontrakBerakhir?.split('T')[0],
        departemen: editData.departemen,
        jabatan: editData.jabatan,
        statusAktif: editData.statusAktif,
      })
    } else {
      reset({ statusKontrak: 'PKWTT', statusAktif: true, jenisKelamin: 'L' })
    }
  }, [editData, reset, isOpen])

  const onSubmit = async (data) => {
    try {
      const url = editData ? `/api/karyawan/${editData.id}` : '/api/karyawan'
      const method = editData ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Gagal menyimpan')
      toast.success(editData ? 'Data karyawan diperbarui' : 'Karyawan berhasil ditambahkan')
      onSaved()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editData ? 'Edit Karyawan' : 'Tambah Karyawan'}
      size="lg"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-secondary">Batal</button>
          <button
            type="submit"
            form="karyawan-form"
            disabled={isSubmitting}
            className="btn-primary"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
          </button>
        </>
      }
    >
      <form id="karyawan-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">NIK <span className="text-red-500">*</span></label>
            <input
              className="form-input"
              placeholder="001001"
              {...register('nik', { required: 'NIK wajib diisi' })}
            />
            {errors.nik && <p className="text-xs text-red-500 mt-1">{errors.nik.message}</p>}
          </div>
          <div>
            <label className="form-label">Nama Lengkap <span className="text-red-500">*</span></label>
            <input
              className="form-input"
              placeholder="John Doe"
              {...register('nama', { required: 'Nama wajib diisi' })}
            />
            {errors.nama && <p className="text-xs text-red-500 mt-1">{errors.nama.message}</p>}
          </div>
          <div>
            <label className="form-label">Tempat Lahir</label>
            <input className="form-input" placeholder="Jakarta" {...register('tempatLahir')} />
          </div>
          <div>
            <label className="form-label">Tanggal Lahir</label>
            <input type="date" className="form-input" {...register('tanggalLahir')} />
          </div>
          <div>
            <label className="form-label">Jenis Kelamin</label>
            <select className="form-select" {...register('jenisKelamin')}>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>
          <div>
            <label className="form-label">Agama</label>
            <select className="form-select" {...register('agama')}>
              <option value="">- Pilih -</option>
              {['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'].map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Telepon</label>
            <input className="form-input" placeholder="08xxxxxxxxxx" {...register('telepon')} />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input type="email" className="form-input" placeholder="email@company.com" {...register('email')} />
          </div>
        </div>

        <div>
          <label className="form-label">Alamat</label>
          <textarea className="form-input" rows={2} placeholder="Jl. ..." {...register('alamat')} />
        </div>

        <div className="border-t pt-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">Informasi Kepegawaian</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Departemen</label>
              <select className="form-select" {...register('departemen')}>
                <option value="">- Pilih -</option>
                {DEPARTEMEN_LIST.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Jabatan</label>
              <input className="form-input" placeholder="Manager, Staff, dll" {...register('jabatan')} />
            </div>
            <div>
              <label className="form-label">Status Kontrak</label>
              <select className="form-select" {...register('statusKontrak')}>
                <option value="PKWTT">PKWTT (Tetap)</option>
                <option value="PKWT">PKWT (Kontrak)</option>
                <option value="PROBATION">Probation</option>
              </select>
            </div>
            <div>
              <label className="form-label">Tanggal Masuk</label>
              <input type="date" className="form-input" {...register('tanggalMasuk')} />
            </div>
            {(statusKontrak === 'PKWT' || statusKontrak === 'PROBATION') && (
              <div>
                <label className="form-label">Kontrak Berakhir</label>
                <input type="date" className="form-input" {...register('tanggalKontrakBerakhir')} />
              </div>
            )}
            {editData && (
              <div className="flex items-center gap-2">
                <input type="checkbox" id="statusAktif" className="rounded" {...register('statusAktif')} />
                <label htmlFor="statusAktif" className="text-sm text-gray-700">Karyawan Aktif</label>
              </div>
            )}
          </div>
        </div>
      </form>
    </Modal>
  )
}
