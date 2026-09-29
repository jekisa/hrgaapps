'use client'

import { useMemo, useState } from 'react'
import { Check, ExternalLink } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import PageHeader from '@/components/ui/PageHeader'
import DataTable from '@/components/ui/DataTable'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import { formatDate } from '@/lib/utils'

const statusLabel = { pending: 'Pending', approved: 'Disetujui', rejected: 'Ditolak' }

async function fetchJson(url, options) {
  const response = await fetch(url, options)
  const payload = await response.json()
  if (!response.ok) {
    const error = new Error(payload.error || 'Gagal memuat data')
    error.status = response.status
    error.payload = payload
    throw error
  }
  return payload
}

function ReviewModal({ request, onClose, onSaved }) {
  const [status, setStatus] = useState('approved')
  const [reviewNote, setReviewNote] = useState('')
  const mutation = useMutation({
    mutationFn: (body) => fetchJson(`/api/cuti/pengajuan/${request._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
    onSuccess: () => { toast.success('Status pengajuan diperbarui'); onSaved() },
    onError: (error, body) => {
      if (error.payload?.requiresDebtConfirmation && !body.confirmDebt) {
        const days = Math.abs(Number(error.payload.projectedRemaining) || 0)
        if (window.confirm(`Persetujuan ini akan membuat saldo cuti menjadi hutang ${days} hari. Lanjutkan?`)) {
          mutation.mutate({ ...body, confirmDebt: true })
          return
        }
        toast('Persetujuan dibatalkan')
        return
      }
      toast.error(error.message)
    },
  })
  return (
    <Modal isOpen={!!request} onClose={onClose} title="Review Pengajuan Cuti" size="md" footer={(
      <><button className="btn-secondary" onClick={onClose}>Batal</button><button className="btn-primary" disabled={mutation.isPending} onClick={() => mutation.mutate({ status, reviewNote })}>{mutation.isPending ? 'Menyimpan...' : 'Simpan Review'}</button></>
    )}>
      <div className="space-y-4">
        <div className="rounded-xl bg-slate-50 p-4 text-sm"><p className="font-semibold text-slate-800">{request.employeeId?.nama}</p><p className="text-slate-500">{request.leaveTypeId?.name} · {request.totalDays} hari</p></div>
        <div><label className="form-label">Keputusan</label><select className="form-select" value={status} onChange={(event) => setStatus(event.target.value)}><option value="approved">Setujui</option><option value="rejected">Tolak</option></select></div>
        <div><label className="form-label">Catatan {status === 'rejected' && <span className="text-red-500">*</span>}</label><textarea className="form-input min-h-24" value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} placeholder="Tambahkan catatan reviewer" /></div>
      </div>
    </Modal>
  )
}

export default function KelolaCutiPage() {
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState({ status: '', leaveTypeId: '', employeeId: '', from: '', to: '' })
  const [reviewRequest, setReviewRequest] = useState(null)
  const queryString = new URLSearchParams(Object.entries(filters).filter(([, value]) => value)).toString()
  const { data: requestData, isLoading } = useQuery({ queryKey: ['cuti', 'pengajuan', filters], queryFn: () => fetchJson(`/api/cuti/pengajuan?${queryString}`) })
  const { data: typeData } = useQuery({ queryKey: ['cuti', 'jenis'], queryFn: () => fetchJson('/api/cuti/jenis') })
  const { data: employeeData } = useQuery({ queryKey: ['karyawan', 'cuti-filter'], queryFn: () => fetchJson('/api/karyawan?limit=1000&statusAktif=true') })
  const columns = useMemo(() => [
    { header: 'Karyawan', accessorKey: 'employeeId.nama', cell: ({ row }) => <span className="font-semibold text-slate-800">{row.original.employeeId?.nama || '—'}</span> },
    { header: 'Jenis Cuti', accessorKey: 'leaveTypeId.name', cell: ({ row }) => row.original.leaveTypeId?.name || '—' },
    { header: 'Tanggal', accessorKey: 'startDate', cell: ({ row }) => <span>{formatDate(row.original.startDate)} – {formatDate(row.original.endDate)}</span> },
    { header: 'Hari', accessorKey: 'totalDays', cell: ({ getValue }) => <span className="font-bold">{getValue()}</span> },
    { header: 'Status', accessorKey: 'status', cell: ({ getValue }) => <Badge status={getValue() === 'approved' ? 'AKTIF' : getValue() === 'rejected' ? 'DITOLAK' : 'PENDING'} label={statusLabel[getValue()]} /> },
    { header: 'Lampiran', id: 'attachment', cell: ({ row }) => row.original.attachmentUrl ? <a href={row.original.attachmentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary-600 hover:underline"><ExternalLink className="h-3.5 w-3.5" />Buka</a> : <span className="text-slate-400">—</span> },
    { header: 'Aksi', id: 'action', cell: ({ row }) => row.original.status === 'pending' ? <button className="btn-secondary !px-2.5 !py-1.5" onClick={() => setReviewRequest(row.original)}><Check className="h-3.5 w-3.5" />Review</button> : <span className="text-xs text-slate-400">Selesai</span> },
  ], [])
  return (
    <div>
      <PageHeader title="Daftar Pengajuan Cuti" subtitle="Review pengajuan cuti seluruh karyawan" breadcrumb={[{ label: 'Dashboard', href: '/' }, { label: 'Manajemen Cuti' }, { label: 'Daftar Pengajuan' }]} />
      <div className="page-section mb-5"><div className="grid gap-3 md:grid-cols-5"><select className="form-select" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}><option value="">Semua status</option><option value="pending">Pending</option><option value="approved">Disetujui</option><option value="rejected">Ditolak</option></select><select className="form-select" value={filters.leaveTypeId} onChange={(event) => setFilters({ ...filters, leaveTypeId: event.target.value })}><option value="">Semua jenis cuti</option>{(typeData?.data || []).map((type) => { const id = String(type._id ?? type.id ?? type.code ?? type.name); return <option key={id} value={type._id ?? type.id ?? type.code ?? id}>{type.name}</option> })}</select><select className="form-select" value={filters.employeeId} onChange={(event) => setFilters({ ...filters, employeeId: event.target.value })}><option value="">Semua karyawan</option>{(employeeData?.data || []).map((employee) => { const id = String(employee._id ?? employee.id ?? employee.nik ?? employee.nama); return <option key={id} value={employee._id ?? employee.id ?? id}>{employee.nama}</option> })}</select><input type="date" className="form-input" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} /><input type="date" className="form-input" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} /></div></div>
      <DataTable data={requestData?.data || []} columns={columns} isLoading={isLoading} emptyMessage="Belum ada pengajuan cuti" />
      {reviewRequest && <ReviewModal request={reviewRequest} onClose={() => setReviewRequest(null)} onSaved={() => { setReviewRequest(null); queryClient.invalidateQueries({ queryKey: ['cuti'] }); queryClient.invalidateQueries({ queryKey: ['dashboard'] }) }} />}
    </div>
  )
}
