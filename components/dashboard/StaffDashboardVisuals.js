'use client'

import { useSyncExternalStore } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getStaffGreeting, getLeaveBalanceProgress } from '@/lib/staff-visual'

export function StaffGreeting({ name }) {
  const greeting = useSyncExternalStore(() => () => {}, () => getStaffGreeting(new Date().getHours()), () => 'Selamat datang')
  return <section className="staff-greeting flex items-center justify-between gap-4 rounded-2xl border border-rose-100 p-5"><div><h1 className="text-2xl font-extrabold tracking-tight text-slate-950">{greeting}, {name}!</h1><p className="mt-1 text-sm text-slate-600">Ringkasan aktivitas dan informasi pribadi Anda.</p></div><Image src="/images/undraw-trip-coral.svg" alt="" width={160} height={100} priority /></section>
}

export function StaffStatCard({ title, value, subtitle, icon: Icon, href, children, tone = 'rose' }) {
  const tones = { rose: 'bg-rose-50 text-rose-700', amber: 'bg-amber-50 text-amber-700', sky: 'bg-sky-50 text-sky-700', violet: 'bg-violet-50 text-violet-700' }
  const body = <><span className={`staff-stat-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tones[tone] || tones.rose}`}><Icon aria-hidden="true" className="h-6 w-6" /></span><span className="min-w-0"><span className="block text-[11px] font-bold uppercase tracking-wide text-slate-500">{title}</span><strong className="mt-2 block text-2xl font-extrabold text-slate-950">{value}</strong><small className="mt-1 block text-xs text-slate-500">{subtitle}</small>{children}</span></>
  return href && !children ? <Link href={href} className="staff-stat-card flex min-h-32 items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">{body}</Link> : <section className="staff-stat-card flex min-h-32 items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">{body}</section>
}

export function StaffLeaveProgress({ remaining, quota }) {
  const progress = getLeaveBalanceProgress(remaining, quota)
  return <div className="mt-3"><div className="h-2 overflow-hidden rounded-full bg-slate-100"><span className="staff-leave-progress" role="progressbar" aria-label="Cuti terpakai" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.usedPercent} aria-valuetext={`${progress.used} hari terpakai dari ${progress.quota} hari`} style={{ width: `${progress.usedPercent}%` }} /></div><p className="mt-1 text-[11px] text-slate-500">{progress.used} terpakai · {progress.remaining} tersisa dari {progress.quota} hari</p></div>
}

export function StaffEmptyState({ icon: Icon, title, description, href = '/cuti/saya/ajukan', actionLabel = 'Ajukan cuti' }) {
  return <section className="staff-empty-state rounded-xl bg-slate-50 px-4 py-6 text-center"><Icon aria-hidden="true" className="mx-auto h-7 w-7 text-rose-400" /><h3 className="mt-2 text-sm font-bold text-slate-800">{title}</h3><p className="mt-1 text-xs text-slate-500">{description}</p><Link href={href} className="mt-3 inline-block text-xs font-bold">{actionLabel}</Link></section>
}
