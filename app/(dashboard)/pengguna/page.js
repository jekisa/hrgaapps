'use client'

import { useState, useMemo } from 'react'
import { Plus, Edit, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import PageHeader from '@/components/ui/PageHeader'
import Badge from '@/components/ui/Badge'
import DataTable from '@/components/ui/DataTable'
import Modal from '@/components/ui/Modal'
import { formatDate } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { useEffect } from 'react'

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
      const id = editData?._id || editData?.id
      const body = id ? { ...data, id } : data
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
          <button type="submit" form="user-form" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
          </button>
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
        {!editData ? (
          <div>
            <label className="form-label">Password <span className="text-red-500">*</span></label>
            <input type="password" className="form-input" placeholder="Min. 6 karakter" {...register('password', { required: true, minLength: 6 })} />
          </div>
        ) : (
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
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['pengguna'],
    queryFn: () => fetch('/api/pengguna').then(r => r.json()),
  })

  const columns = useMemo(() => [
    {
      id: 'nama',
      header: 'Nama',
      accessorKey: 'name',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm shrink-0">
            {row.original.name?.charAt(0)}
          </div>
          <span className="font-semibold text-gray-900">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ getValue }) => <span className="text-gray-600">{getValue()}</span>,
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ getValue }) => {
        const isAdmin = getValue() === 'ADMIN'
        return (
          <span className={`badge ${isAdmin ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-600'}`}>
            {isAdmin && <Shield className="w-3 h-3 inline mr-1" />}
            {getValue()}
          </span>
        )
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ getValue }) => <Badge status={getValue() ? 'AKTIF' : 'TIDAK_AKTIF'} label={getValue() ? 'Aktif' : 'Non-Aktif'} />,
    },
    {
      accessorKey: 'createdAt',
      header: 'Bergabung',
      cell: ({ getValue }) => formatDate(getValue()),
    },
    {
      id: 'aksi',
      header: 'Aksi',
      enableSorting: false,
      cell: ({ row }) => (
        <button onClick={() => { setEditData(row.original); setShowModal(true) }}
          className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors">
          <Edit className="w-4 h-4" />
        </button>
      ),
    },
  ], [])

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

      <div className="page-section">
        <DataTable data={users} columns={columns} isLoading={isLoading} emptyMessage="Tidak ada pengguna" />
      </div>

      <UserModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditData(null) }}
        onSaved={() => { setShowModal(false); setEditData(null); queryClient.invalidateQueries({ queryKey: ['pengguna'] }) }}
        editData={editData}
      />
    </div>
  )
}
