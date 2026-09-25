'use client'

import Link from 'next/link'
import { CalendarCheck, CalendarDays, Clock3, FileCheck2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import PageHeader from '@/components/ui/PageHeader'
import Badge from '@/components/ui/Badge'

async function fetchJson(url) { const response = await fetch(url); const payload = await response.json(); if (!response.ok) throw new Error(payload.error || 'Gagal memuat data'); return payload }

function Stat({ icon: Icon, label, value, tone }) { return <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm"><div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></div><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-1 text-2xl font-extrabold text-slate-900">{value}</p></div> }

export default function CutiSayaPage() {
  const { data: balanceData, isLoading: balanceLoading } = useQuery({ queryKey: ['cuti', 'saldo', 'me'], queryFn: () => fetchJson('/api/cuti/saldo') })
  const { data: requestData, isLoading: requestLoading } = useQuery({ queryKey: ['cuti', 'pengajuan', 'me'], queryFn: () => fetchJson('/api/cuti/pengajuan?limit=5') })
  const balances = balanceData?.data || []
  const annual = balances.find((item) => item.leaveType?.code === 'annual') || balances[0]
  const approvedDays = (requestData?.data || []).filter((item) => item.status === 'approved' && new Date(item.startDate).getFullYear() === new Date().getFullYear()).reduce((sum, item) => sum + item.totalDays, 0)
  const loading = balanceLoading || requestLoading
  return <div><PageHeader title="Ringkasan Cuti" subtitle="Pantau saldo dan status pengajuan cuti Anda" breadcrumb={[{ label: 'Dashboard', href: '/' }, { label: 'Cuti Saya' }]} /><div className="grid gap-4 md:grid-cols-3"><Stat icon={CalendarDays} label="Sisa Cuti Tahunan" value={loading ? '—' : `${annual?.sisa || 0} hari`} tone="bg-blue-50 text-blue-600" /><Stat icon={CalendarCheck} label="Cuti Terpakai Tahun Ini" value={loading ? '—' : `${approvedDays} hari`} tone="bg-emerald-50 text-emerald-600" /><Stat icon={FileCheck2} label="Total Hari Disetujui" value={loading ? '—' : `${approvedDays} hari`} tone="bg-violet-50 text-violet-600" /></div><div className="mt-5 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-sm font-bold text-slate-900">Pengajuan Terbaru</h2><p className="mt-1 text-xs text-slate-500">Status pengajuan cuti Anda</p></div><Link href="/cuti/saya/riwayat" className="text-xs font-semibold text-primary-600 hover:underline">Lihat riwayat</Link></div><div className="mt-4 space-y-3">{(requestData?.data || []).length === 0 ? <div className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">Belum ada pengajuan cuti</div> : requestData.data.map((item) => <div key={item._id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"><Clock3 className="h-4 w-4 text-slate-400" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800">{item.leaveTypeId?.name}</p><p className="text-xs text-slate-500">{item.totalDays} hari · {new Date(item.startDate).toLocaleDateString('id-ID')}</p></div><Badge status={item.status === 'approved' ? 'AKTIF' : item.status === 'rejected' ? 'DITOLAK' : 'PENDING'} label={item.status === 'approved' ? 'Disetujui' : item.status === 'rejected' ? 'Ditolak' : 'Pending'} /></div>)}</div></div></div>
}
