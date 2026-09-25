'use client'

import { useMemo, useState } from 'react'
import { CirclePlus, SquarePen } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import PageHeader from '@/components/ui/PageHeader'
import DataTable from '@/components/ui/DataTable'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'

async function fetchJson(url, options) {
  const response = await fetch(url, options)
  const payload = await response.json()
  if (!response.ok) throw new Error(payload.error || 'Gagal memproses data')
  return payload
}

function TypeModal({ item, onClose, onSaved }) {
  const [form, setForm] = useState(() => item ? { code: item.code, name: item.name, defaultQuotaPerYear: item.defaultQuotaPerYear, requiresAttachment: item.requiresAttachment, isActive: item.isActive } : { code: '', name: '', defaultQuotaPerYear: 12, requiresAttachment: false, isActive: true })
  const mutation = useMutation({
    mutationFn: () => fetchJson(item ? `/api/cuti/jenis/${item._id}` : '/api/cuti/jenis', { method: item ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, defaultQuotaPerYear: Number(form.defaultQuotaPerYear) }) }),
    onSuccess: () => { toast.success(item ? 'Jenis cuti diperbarui' : 'Jenis cuti ditambahkan'); onSaved() },
    onError: (error) => toast.error(error.message),
  })
  return <Modal isOpen title={item ? 'Edit Jenis Cuti' : 'Tambah Jenis Cuti'} onClose={onClose} size="md" footer={<><button className="btn-secondary" onClick={onClose}>Batal</button><button className="btn-primary" disabled={mutation.isPending} onClick={() => mutation.mutate()}>{mutation.isPending ? 'Menyimpan...' : 'Simpan'}</button></>}>
    <div className="space-y-4"><div><label className="form-label">Kode</label><input className="form-input" disabled={!!item} value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} placeholder="annual" /></div><div><label className="form-label">Nama Jenis Cuti</label><input className="form-input" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Cuti Tahunan" /></div><div><label className="form-label">Kuota Default per Tahun</label><input type="number" min="0" className="form-input" value={form.defaultQuotaPerYear} onChange={(event) => setForm({ ...form, defaultQuotaPerYear: event.target.value })} /></div><label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={form.requiresAttachment} onChange={(event) => setForm({ ...form, requiresAttachment: event.target.checked })} />Lampiran wajib</label><label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />Aktif</label></div>
  </Modal>
}

export default function JenisCutiPage() {
  const queryClient = useQueryClient()
  const [item, setItem] = useState(undefined)
  const { data, isLoading } = useQuery({ queryKey: ['cuti', 'jenis'], queryFn: () => fetchJson('/api/cuti/jenis') })
  const columns = useMemo(() => [
    { header: 'Kode', accessorKey: 'code', cell: ({ getValue }) => <span className="font-mono text-xs text-slate-600">{getValue()}</span> },
    { header: 'Nama', accessorKey: 'name', cell: ({ getValue }) => <span className="font-semibold text-slate-800">{getValue()}</span> },
    { header: 'Kuota Default', accessorKey: 'defaultQuotaPerYear', cell: ({ getValue }) => `${getValue()} hari` },
    { header: 'Lampiran', accessorKey: 'requiresAttachment', cell: ({ getValue }) => getValue() ? <Badge status="PENDING" label="Wajib" /> : <span className="text-slate-400">Tidak</span> },
    { header: 'Status', accessorKey: 'isActive', cell: ({ getValue }) => <Badge status={getValue() ? 'AKTIF' : 'TIDAK_AKTIF'} label={getValue() ? 'Aktif' : 'Nonaktif'} /> },
    { header: 'Aksi', id: 'action', cell: ({ row }) => <button className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50" onClick={() => setItem(row.original)}><SquarePen className="h-4 w-4" /></button> },
  ], [])
  return <div><PageHeader title="Kelola Jenis Cuti" subtitle="Atur jenis, kuota, dan aturan lampiran cuti" breadcrumb={[{ label: 'Dashboard', href: '/' }, { label: 'Manajemen Cuti' }, { label: 'Kelola Jenis Cuti' }]} actions={<button className="btn-primary" onClick={() => setItem(null)}><CirclePlus className="h-4 w-4" />Tambah Jenis Cuti</button>} /><DataTable data={data?.data || []} columns={columns} isLoading={isLoading} emptyMessage="Belum ada jenis cuti" />{item !== undefined && <TypeModal item={item} onClose={() => setItem(undefined)} onSaved={() => { setItem(undefined); queryClient.invalidateQueries({ queryKey: ['cuti', 'jenis'] }) }} />}</div>
}
