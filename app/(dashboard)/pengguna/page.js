'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Shield, UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '@/components/ui/PageHeader'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { formatDate } from '@/lib/utils'
import { useForm } from 'react-hook-form'

function UserModal({ isOpen, onClose, onSaved, editData }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()

  useEffect(() => {
    if (editData) {
      reset({ name: editData.name, email: editData.email, role: editData.role, isActive: editData.isActive })
    } else {
      reset({ role: 'STAFF', isActive: true })
    }
  }, [editData, reset, isOpen])

  const onSubmit = async (data) => {
    try {
      const method = editData ? 'PUT' : 'POST'
      const body = editData ? { ...data, id: editData.id } : data
      const res = await fetch('/api/pengguna', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success(editData ? 'Pengguna diperbarui' : 'Pengguna ditambahkan')
      onSaved()
    } catch (err) { toast.error(err.message) }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editData ? 'Edit Pengguna' : 'Tambah Pengguna'} size="md"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-secondary">Batal</button>
          <button type="submit" form="user-form" disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'Menyimpan...' : 'Simpan'}</button>
        </>
      }
    >
      <form id="user-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="form-label">Nama Lengkap <span className="text-red-500">*</span></label>
          <input className="form-input" {...register('name', { required: true })} />
          {errors.name && <p className="text-xs text-red-500 mt-1">Nama wajib diisi</p>}
        </div>
        <div>
          <label className="form-label">Email <span className="text-red-500">*</span></label>
          <input type="email" className="form-input" {...register('email', { required: true })} disabled={!!editData} />
          {errors.email && <p className="text-xs text-red-500 mt-1">Email wajib diisi</p>}
        </div>
        {!editData && (
          <div>
            <label className="form-label">Password <span className="text-red-500">*</span></label>
            <input type="password" className="form-input" placeholder="Min. 6 karakter" {...register('password', { required: !editData, minLength: 6 })} />
          </div>
        )}
        {editData && (
          <div>
            <label className="form-label">Password Baru (opsional)</label>
            <input type="password" className="form-input" placeholder="Kosongkan jika tidak ganti" {...register('password')} />
          </div>
        )}
        <div>
          <label className="form-label">Role</label>
          <select className="form-select" {...register('role')}>
            <option value="STAFF">Staff</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        {editData && (
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" className="rounded" {...register('isActive')} />
            <label htmlFor="isActive" className="text-sm">Akun Aktif</label>
          </div>
        )}
      </form>
    </Modal>
  )
}

export default function PenggunaPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/pengguna')
      if (res.ok) setData(await res.json())
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  return (
    <div>
      <PageHeader
        title="Manajemen Pengguna"
        subtitle="Kelola akses dan role pengguna sistem"
        breadcrumb={[{ label: 'Dashboard', href: '/' }, { label: 'Pengguna' }]}
        actions={
          <button onClick={() => { setEditData(null); setShowModal(true) }} className="btn-primary">
            <Plus className="w-4 h-4" /> Tambah Pengguna
          </button>
        }
      />

      <div className="card overflow-hidden">
        {loading ? <PageLoader /> : data.length === 0 ? <EmptyState icon={Shield} title="Tidak ada pengguna" /> : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">Nama</th>
                <th className="table-th">Email</th>
                <th className="table-th">Role</th>
                <th className="table-th">Status</th>
                <th className="table-th">Bergabung</th>
                <th className="table-th">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="table-td">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold text-sm">
                        {u.name.charAt(0)}
                      </div>
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="table-td">{u.email}</td>
                  <td className="table-td">
                    <span className={`badge ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                      {u.role === 'ADMIN' ? <><Shield className="w-3 h-3 inline mr-1" />Admin</> : 'Staff'}
                    </span>
                  </td>
                  <td className="table-td">
                    <Badge status={u.isActive ? 'AKTIF' : 'TIDAK_AKTIF'} label={u.isActive ? 'Aktif' : 'Non-Aktif'} />
                  </td>
                  <td className="table-td">{formatDate(u.createdAt)}</td>
                  <td className="table-td">
                    <button onClick={() => { setEditData(u); setShowModal(true) }} className="p-1.5 rounded hover:bg-green-50 text-green-600">
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <UserModal isOpen={showModal} onClose={() => { setShowModal(false); setEditData(null) }} onSaved={() => { setShowModal(false); setEditData(null); fetchData() }} editData={editData} />
    </div>
  )
}
