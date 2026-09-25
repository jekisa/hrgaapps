'use client'

import Link from 'next/link'
import { Check, ExternalLink, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import PageHeader from '@/components/ui/PageHeader'
import Badge from '@/components/ui/Badge'

async function fetchJson(url) { const response = await fetch(url); const payload = await response.json(); if (!response.ok) throw new Error(payload.error || 'Gagal memuat riwayat'); return payload }

function StatusStep({ active, icon: Icon, label, danger }) { return <div className={`flex items-center gap-2 text-xs font-semibold ${active ? danger ? 'text-red-600' : 'text-primary-600' : 'text-slate-300'}`}><span className={`flex h-7 w-7 items-center justify-center rounded-full ${active ? danger ? 'bg-red-50' : 'bg-primary-50' : 'bg-slate-50'}`}><Icon className="h-3.5 w-3.5" /></span>{label}</div> }

export default function RiwayatCutiPage() {
  const { data, isLoading } = useQuery({ queryKey: ['cuti', 'pengajuan', 'me', 'history'], queryFn: () => fetchJson('/api/cuti/pengajuan?limit=100') })
  return <div><PageHeader title="Riwayat Pengajuan" subtitle="Lihat seluruh status pengajuan cuti Anda" breadcrumb={[{ label: 'Dashboard', href: '/' }, { label: 'Cuti Saya', href: '/cuti/saya' }, { label: 'Riwayat Pengajuan' }]} /><div className="space-y-3">{isLoading ? <div className="rounded-2xl bg-white p-8 text-center text-sm text-slate-400">Memuat riwayat...</div> : (data?.data || []).length === 0 ? <div className="rounded-2xl bg-white p-8 text-center text-sm text-slate-400">Belum ada riwayat pengajuan</div> : data.data.map((item) => <article key={item._id} className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="text-sm font-bold text-slate-900">{item.leaveTypeId?.name}</h2><p className="mt-1 text-xs text-slate-500">{new Date(item.startDate).toLocaleDateString('id-ID')} – {new Date(item.endDate).toLocaleDateString('id-ID')} · {item.totalDays} hari</p></div><Badge status={item.status === 'approved' ? 'AKTIF' : item.status === 'rejected' ? 'DITOLAK' : 'PENDING'} label={item.status === 'approved' ? 'Disetujui' : item.status === 'rejected' ? 'Ditolak' : 'Pending'} /></div><div className="mt-5 flex flex-wrap items-center gap-3 sm:gap-5"><StatusStep active icon={Check} label="Diajukan" /><span className="h-px w-8 bg-slate-200" /><StatusStep active={item.status !== 'pending'} icon={item.status === 'rejected' ? X : Check} label={item.status === 'rejected' ? 'Ditolak' : item.status === 'approved' ? 'Disetujui' : 'Review'} danger={item.status === 'rejected'} />{item.attachmentUrl && <Link href={item.attachmentUrl} target="_blank" className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:underline"><ExternalLink className="h-3.5 w-3.5" />Lampiran</Link>}</div>{item.status === 'rejected' && item.reviewNote && <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-xs text-red-700"><strong>Catatan reviewer:</strong> {item.reviewNote}</div>}</article>)}</div></div>
}
