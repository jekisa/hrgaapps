'use client'

import { useCallback, useMemo, useState } from 'react'
import Image from 'next/image'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ExternalLink, FileText } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import Badge from '@/components/ui/Badge'
import DataTable from '@/components/ui/DataTable'
import Modal from '@/components/ui/Modal'

const formatJakartaDate = (value) => value
  ? new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta' }).format(new Date(value))
  : null

export default function SuratDokterPage() {
  const [filters, setFilters] = useState({ status: 'pending', employeeId: '', from: '', to: '' })
  const [notes, setNotes] = useState({})
  const [rejecting, setRejecting] = useState(null)
  const queryClient = useQueryClient()
  const params = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, value]) => value)))
  const { data, isLoading, isError } = useQuery({ queryKey: ['cuti', 'surat-dokter', filters], queryFn: async () => { const response = await fetch(`/api/cuti/surat-dokter?${params}`); const result = await response.json(); if (!response.ok) throw new Error(result.error); return result } })
  const requests = data?.data || []
  const employees = data?.employees || []

  const verify = useCallback(async (item, verificationStatus) => {
    try {
      const response = await fetch(`/api/cuti/surat-dokter/${item.id || item._id}?source=${item.source || 'leaveRequest'}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ verificationStatus, verificationNote: notes[item.id || item._id] || '' }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Gagal memproses verifikasi')
      toast.success(verificationStatus === 'verified' ? 'Surat dokter diverifikasi' : 'Surat dokter ditolak')
      await queryClient.invalidateQueries({ queryKey: ['cuti', 'surat-dokter'] })
      return true
    } catch (error) { toast.error(error.message); return false }
  }, [notes, queryClient])

  const columns = useMemo(() => [
    { header: 'Nama Karyawan', accessorKey: 'employeeId.nama', cell: ({ row }) => <div><p className="font-semibold text-slate-800">{row.original.employeeId?.nama || 'Karyawan'}</p><p className="text-xs text-slate-500">{row.original.employeeId?.jabatan || ''}</p></div> },
    { id: 'sickPeriod', header: 'Periode Izin Sakit', accessorKey: 'startDate', cell: ({ row }) => { const startDate = formatJakartaDate(row.original.startDate); const endDate = formatJakartaDate(row.original.endDate); return startDate && endDate ? <span className="whitespace-nowrap">{startDate} – {endDate}</span> : <span className="whitespace-nowrap text-amber-700">Tanggal belum tercatat</span> } },
    { header: 'Tanggal Sakit / Upload', accessorKey: 'startDate', cell: ({ row }) => row.original.source === 'standalone' ? <span className="whitespace-nowrap">Diunggah {new Date(row.original.createdAt).toLocaleString('id-ID')}</span> : <span className="whitespace-nowrap">{new Date(row.original.startDate).toLocaleDateString('id-ID')} – {new Date(row.original.endDate).toLocaleDateString('id-ID')}</span> },
    { header: 'Jumlah Hari', accessorKey: 'totalDays', cell: ({ getValue }) => getValue() == null ? '—' : `${getValue()} hari` },
    { header: 'Surat Dokter', id: 'attachment', cell: ({ row }) => { const url = row.original.attachmentUrl; const pdf = String(url || '').split('?')[0].toLowerCase().endsWith('.pdf'); return url ? <a href={url} target="_blank" rel="noreferrer" aria-label="Buka surat dokter" className="inline-flex items-center gap-2 text-primary-700 hover:underline">{pdf ? <FileText className="h-9 w-9" /> : <Image src={url} alt="Thumbnail surat dokter" width={64} height={48} unoptimized className="h-12 w-16 rounded border border-slate-200 bg-white object-cover" />}<ExternalLink className="h-3.5 w-3.5" /></a> : '—' } },
    { header: 'Status Verifikasi', accessorKey: 'verificationStatus', cell: ({ getValue }) => { const status = getValue() || 'pending'; return <Badge status={status === 'verified' ? 'AKTIF' : status === 'rejected' ? 'DITOLAK' : 'PENDING'} label={status === 'verified' ? 'Terverifikasi' : status === 'rejected' ? 'Ditolak' : 'Menunggu'} /> } },
    { header: 'Aksi', id: 'actions', cell: ({ row }) => row.original.verificationStatus === 'pending' || !row.original.verificationStatus ? <div className="flex gap-2"><button type="button" className="btn-secondary !px-2 !py-1.5" onClick={() => setRejecting(row.original)}>Tolak</button><button type="button" className="btn-primary !px-2 !py-1.5" onClick={() => verify(row.original, 'verified')}>Verifikasi</button></div> : <span className="text-xs text-slate-400">Selesai</span> },
  ], [verify])

  return <div>
    <PageHeader title="Verifikasi Surat Dokter" subtitle="Tinjau lampiran cuti sakit secara terpisah dari persetujuan cuti" breadcrumb={[{ label: 'Dashboard', href: '/' }, { label: 'Manajemen Cuti' }, { label: 'Surat Dokter' }]} />
    <div className="page-section mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <select aria-label="Status verifikasi" className="form-select" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}><option value="pending">Menunggu verifikasi</option><option value="verified">Terverifikasi</option><option value="rejected">Ditolak</option><option value="all">Semua status</option></select>
      <select aria-label="Filter karyawan" className="form-select" value={filters.employeeId} onChange={(e) => setFilters({ ...filters, employeeId: e.target.value })}><option value="">Semua karyawan</option>{employees.map((employee) => <option key={employee._id} value={employee._id}>{employee.nama}</option>)}</select>
      <input aria-label="Dari tanggal" type="date" className="form-input" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
      <input aria-label="Sampai tanggal" type="date" className="form-input" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
    </div>
    {isError ? <div role="alert" className="page-section p-8 text-center text-red-600">Gagal memuat surat dokter.</div> : <DataTable data={requests} columns={columns} isLoading={isLoading} emptyMessage="Tidak ada surat dokter yang cocok dengan filter." />}
    <Modal isOpen={Boolean(rejecting)} onClose={() => setRejecting(null)} title="Tolak Surat Dokter" footer={<><button className="btn-secondary" onClick={() => setRejecting(null)}>Batal</button><button className="btn-primary" disabled={!notes[rejecting?.id || rejecting?._id]?.trim()} onClick={async () => { if (await verify(rejecting, 'rejected')) setRejecting(null) }}>Tolak Surat</button></>}>
      <p className="mb-3 text-sm text-slate-600">Berikan alasan penolakan untuk {rejecting?.employeeId?.nama || 'karyawan'}.</p>
      <label className="form-label" htmlFor="verificationNote">Alasan penolakan <span className="text-red-500">*</span></label>
      <textarea id="verificationNote" className="form-input mt-1 min-h-28" required value={notes[rejecting?.id || rejecting?._id] || ''} onChange={(event) => setNotes({ ...notes, [rejecting?.id || rejecting?._id]: event.target.value })} />
    </Modal>
  </div>
}
