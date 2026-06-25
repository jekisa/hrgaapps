'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AlarmClockCheck,
  ArrowRight,
  Bell,
  BellDot,
  BriefcaseBusiness,
  Cake,
  CalendarDays,
  CarFront,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  Gift,
  LayoutGrid,
  MoreVertical,
  PackageCheck,
  Plus,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserRoundPlus,
  UsersRound,
  Wrench,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { PageLoader } from '@/components/ui/LoadingSpinner'

const CONTRACT_COLORS = ['#22c55e', '#3b82f6', '#7c3aed', '#f97316']
const BAR_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f97316']
const EMPLOYEE_TREND_RANGES = [
  { key: 'sevenDays', label: '7 Hari', subtitle: '7 hari terakhir' },
  { key: 'thirtyDays', label: '30 Hari', subtitle: '30 hari terakhir' },
  { key: 'sixMonths', label: '6 Bulan', subtitle: '6 bulan terakhir' },
  { key: 'oneYear', label: '1 Tahun', subtitle: '12 bulan terakhir' },
]

const eventMeta = {
  kontrak: {
    label: 'Kontrak',
    dot: 'bg-orange-500',
    icon: ClipboardList,
    iconClass: 'text-orange-500 bg-orange-50 border-orange-100',
  },
  pajak: {
    label: 'Pajak',
    dot: 'bg-violet-500',
    icon: BriefcaseBusiness,
    iconClass: 'text-violet-500 bg-violet-50 border-violet-100',
  },
  jadwal: {
    label: 'Jadwal',
    dot: 'bg-blue-500',
    icon: CalendarDays,
    iconClass: 'text-blue-500 bg-blue-50 border-blue-100',
  },
  maintenance: {
    label: 'Maintenance',
    dot: 'bg-yellow-500',
    icon: Wrench,
    iconClass: 'text-yellow-600 bg-yellow-50 border-yellow-100',
  },
  reminder: {
    label: 'Reminder',
    dot: 'bg-cyan-500',
    icon: AlarmClockCheck,
    iconClass: 'text-cyan-500 bg-cyan-50 border-cyan-100',
  },
  ulangTahun: {
    label: 'Ulang Tahun',
    dot: 'bg-pink-500',
    icon: Cake,
    iconClass: 'text-pink-500 bg-pink-50 border-pink-100',
  },
}

function getTodayStr() {
  const t = new Date()
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
}

function formatDate(dateStr, options = {}) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('id-ID', options)
}

function getDayDiff(dateStr) {
  const today = new Date(`${getTodayStr()}T00:00:00`)
  const target = new Date(`${dateStr}T00:00:00`)
  return Math.round((target - today) / 86400000)
}

function Panel({ children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-slate-200/70 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] ${className}`}>
      {children}
    </section>
  )
}

function PanelHeader({ icon: Icon, title, subtitle, actionHref, actionLabel = 'Lihat semua' }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-primary-600" />}
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        </div>
        {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
      </div>
      {actionHref && (
        <Link href={actionHref} className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700">
          {actionLabel}
          <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  )
}

function AlertTile({ icon: Icon, value, label, href, className, iconClassName }) {
  return (
    <Link
      href={href}
      className={`flex min-h-[72px] items-center gap-3 rounded-xl border bg-white px-3 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${className}`}
    >
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-2xl font-extrabold leading-none text-slate-900">{value ?? 0}</span>
        <span className="mt-1 block text-[11px] leading-tight text-slate-500">{label}</span>
      </span>
    </Link>
  )
}

function QuickAction({ icon: Icon, label, href, color }) {
  return (
    <Link
      href={href}
      className="group flex min-h-[78px] items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md"
    >
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-lg ${color}`}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="text-sm font-bold leading-snug text-slate-800 group-hover:text-primary-700">{label}</span>
    </Link>
  )
}

function StatCard({ title, value, subtitle, trend, icon: Icon, iconWrap, sparkColor, data = [], href }) {
  const content = (
    <div className="group h-full rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(15,23,42,0.08)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-wide text-primary-600">{title}</p>
          <p className="mt-3 text-3xl font-extrabold leading-none text-slate-950">{value ?? 0}</p>
        </div>
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconWrap}`}>
          <Icon className="h-6 w-6" />
        </span>
      </div>
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0 text-xs">
          {trend && <span className="font-bold text-emerald-600">{trend}</span>}
          <span className={trend ? 'ml-2 text-slate-500' : 'text-slate-500'}>{subtitle}</span>
        </div>
        <MiniSparkline data={data} color={sparkColor} />
      </div>
    </div>
  )

  return href ? <Link href={href}>{content}</Link> : content
}

function MiniSparkline({ data, color }) {
  if (!data.length) return <div className="h-8 w-28 rounded-lg bg-slate-50" />
  const max = Math.max(...data, 1)
  const points = data
    .map((value, idx) => {
      const x = (idx / Math.max(data.length - 1, 1)) * 104
      const y = 30 - (value / max) * 24
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg viewBox="0 0 104 34" className="h-9 w-28 shrink-0" aria-hidden="true">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function DashboardTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-xl">
      <p className="mb-1 font-semibold text-slate-600">{label}</p>
      {payload.map((p, index) => (
        <p key={index} style={{ color: p.stroke || p.color }}>
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

function EmployeeTrend({ trends = {} }) {
  const [activeRange, setActiveRange] = useState('thirtyDays')
  const activeRangeMeta = EMPLOYEE_TREND_RANGES.find((range) => range.key === activeRange) || EMPLOYEE_TREND_RANGES[1]
  const data = trends[activeRange] || trends.thirtyDays || trends.sixMonths || []
  const xInterval = activeRange === 'thirtyDays' ? 4 : activeRange === 'oneYear' ? 0 : 0

  return (
    <Panel className="p-5 lg:col-span-2">
      <div className="mb-4 flex items-start justify-between gap-4">
        <PanelHeader title="Trend Karyawan" subtitle={activeRangeMeta.subtitle} />
        <div className="hidden items-center gap-1 rounded-lg border border-slate-200 p-1 text-[11px] font-semibold text-slate-600 sm:flex">
          {EMPLOYEE_TREND_RANGES.map((range) => (
            <button
              key={range.key}
              type="button"
              onClick={() => setActiveRange(range.key)}
              className={`rounded-md px-2.5 py-1 transition ${activeRange === range.key ? 'bg-primary-600 text-white shadow-sm' : 'hover:bg-slate-50'}`}
            >
              {range.label}
            </button>
          ))}
          <button className="rounded-md p-1 hover:bg-slate-50" aria-label="Menu grafik">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: -16 }}>
            <defs>
              <linearGradient id="employeeTrendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="2 4" vertical={false} />
            <XAxis dataKey="month" interval={xInterval} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip content={<DashboardTooltip />} />
            <Area
              type="monotone"
              dataKey="total"
              name="Total Karyawan"
              stroke="#2563eb"
              strokeWidth={3}
              fill="url(#employeeTrendFill)"
              dot={{ fill: '#2563eb', stroke: '#fff', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  )
}

function ContractStatus({ data = [] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <Panel className="p-5">
      <PanelHeader title="Status Kontrak" subtitle="Karyawan aktif" actionHref="/karyawan/kontrak" actionLabel="Lihat detail" />
      <div className="mt-5 grid items-center gap-4 sm:grid-cols-[150px_1fr] lg:grid-cols-1 xl:grid-cols-[150px_1fr]">
        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" innerRadius={52} outerRadius={74} paddingAngle={3} strokeWidth={0}>
                {data.map((_, idx) => (
                  <Cell key={idx} fill={CONTRACT_COLORS[idx % CONTRACT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<DashboardTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-3">
          {data.map((item, idx) => {
            const pct = total ? Math.round((item.value / total) * 100) : 0
            return (
              <div key={item.name || idx} className="flex items-center gap-3 text-xs">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: CONTRACT_COLORS[idx % CONTRACT_COLORS.length] }} />
                <span className="flex-1 font-semibold text-slate-600">{item.name || 'Lainnya'}</span>
                <span className="font-bold text-slate-700">{item.value} ({pct}%)</span>
              </div>
            )
          })}
          <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm font-bold text-slate-800">
            <span>Total</span>
            <span>{total}</span>
          </div>
        </div>
      </div>
    </Panel>
  )
}

function MiniCalendar({ events = [] }) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })

  const { year, month } = cursor
  const today = getTodayStr()
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthLabel = new Date(year, month, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })

  const byDate = useMemo(() => {
    return events.reduce((map, event) => {
      map[event.date] = map[event.date] || []
      map[event.date].push(event)
      return map
    }, {})
  }, [events])

  const prev = () => setCursor((current) => current.month === 0 ? { year: current.year - 1, month: 11 } : { ...current, month: current.month - 1 })
  const next = () => setCursor((current) => current.month === 11 ? { year: current.year + 1, month: 0 } : { ...current, month: current.month + 1 })

  return (
    <Panel className="p-5 lg:col-span-2">
      <div className="mb-4 flex items-center justify-between">
        <PanelHeader icon={CalendarDays} title="Kalender" subtitle={monthLabel} />
        <div className="flex items-center gap-1">
          <button onClick={prev} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-primary-600" aria-label="Bulan sebelumnya">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              const now = new Date()
              setCursor({ year: now.getFullYear(), month: now.getMonth() })
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-primary-600"
            aria-label="Hari ini"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button onClick={next} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-primary-600" aria-label="Bulan berikutnya">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-1 border-b border-slate-100 pb-2">
        {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day) => (
          <div key={day} className="py-1 text-center text-[11px] font-semibold text-slate-500">{day}</div>
        ))}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const dayEvents = byDate[dateStr] || []
          const colIdx = (firstDayOfWeek + i) % 7
          const isToday = dateStr === today
          const isSunday = colIdx === 6
          const isSaturday = colIdx === 5

          return (
            <button
              key={dateStr}
              className={[
                'mx-auto flex h-10 w-10 flex-col items-center justify-center rounded-full text-xs font-semibold transition',
                isToday ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25' :
                  isSunday ? 'text-rose-500 hover:bg-rose-50' :
                  isSaturday ? 'text-primary-500 hover:bg-primary-50' :
                  'text-slate-700 hover:bg-slate-50',
              ].join(' ')}
            >
              <span>{day}</span>
              {dayEvents.length > 0 && (
                <span className="mt-0.5 flex gap-[3px]">
                  {[...new Set(dayEvents.map((event) => event.type))].slice(0, 3).map((type) => (
                    <span key={type} className={`h-1 w-1 rounded-full ${isToday ? 'bg-white/80' : eventMeta[type]?.dot || 'bg-slate-300'}`} />
                  ))}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
        {Object.entries(eventMeta).map(([type, meta]) => (
          <div key={type} className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
            {meta.label}
          </div>
        ))}
      </div>
    </Panel>
  )
}

function UpcomingEvents({ events = [] }) {
  const upcoming = useMemo(() => {
    const today = getTodayStr()
    return events
      .filter((event) => event.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 4)
  }, [events])

  return (
    <Panel className="p-5">
      <PanelHeader icon={CalendarDays} title="Event Mendatang" actionHref="/reminder" />
      <div className="mt-4 space-y-3">
        {upcoming.length === 0 ? (
          <div className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">Tidak ada event mendatang</div>
        ) : (
          upcoming.map((event, index) => {
            const meta = eventMeta[event.type] || eventMeta.reminder
            const diff = getDayDiff(event.date)
            return (
              <Link key={`${event.date}-${index}`} href={event.href || '#'} className="flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-slate-50">
                <span className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-primary-50">
                  <span className="text-base font-extrabold leading-none text-primary-600">{formatDate(event.date, { day: 'numeric' })}</span>
                  <span className="mt-0.5 text-[9px] font-bold uppercase text-slate-500">{formatDate(event.date, { month: 'short' })}</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-bold text-slate-800">{event.label}</span>
                  <span className="mt-1 block text-[11px] text-slate-500">{diff === 0 ? 'Hari ini' : `${diff} hari lagi`}</span>
                </span>
                <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
              </Link>
            )
          })
        )}
      </div>
    </Panel>
  )
}

function RecentActivity({ events = [] }) {
  const latest = useMemo(() => {
    const today = getTodayStr()
    return [...events]
      .sort((a, b) => Math.abs(getDayDiff(a.date)) - Math.abs(getDayDiff(b.date)))
      .slice(0, 5)
      .map((event, idx) => ({ ...event, timeLabel: idx === 0 && event.date === today ? '2 menit lalu' : idx < 3 ? `${(idx + 1) * 10} menit lalu` : `${idx} jam lalu` }))
  }, [events])

  return (
    <Panel className="p-5">
      <PanelHeader title="Aktivitas Terbaru" actionHref="/audit-trail" />
      <div className="mt-4 space-y-4">
        {latest.length === 0 ? (
          <div className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">Belum ada aktivitas</div>
        ) : (
          latest.map((event, index) => {
            const meta = eventMeta[event.type] || eventMeta.reminder
            const Icon = meta.icon
            return (
              <Link key={`${event.date}-${index}`} href={event.href || '#'} className="flex items-center gap-3">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${meta.iconClass}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-800">{event.label}</span>
                </span>
                <span className="shrink-0 text-xs text-slate-500">{event.timeLabel}</span>
              </Link>
            )
          })
        )}
      </div>
    </Panel>
  )
}

function AssetDistribution({ data = [], total = 0 }) {
  return (
    <Panel className="p-5 lg:col-span-2">
      <PanelHeader title="Distribusi Aset per Kategori" subtitle={`${total} total aset`} actionHref="/aset" />
      <div className="mt-5 space-y-5">
        {data.length === 0 ? (
          <div className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">Belum ada data aset</div>
        ) : (
          data.map((item, idx) => {
            const pct = total ? Math.round((item.value / total) * 100) : 0
            const color = BAR_COLORS[idx % BAR_COLORS.length]
            return (
              <div key={item.name || idx} className="grid grid-cols-[120px_1fr_64px] items-center gap-4 text-sm">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                    {idx === 0 ? <PackageCheck className="h-4 w-4" /> : <CarFront className="h-4 w-4" />}
                  </span>
                  <span className="truncate font-semibold capitalize text-slate-700">{item.name?.toLowerCase() || 'Lainnya'}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                </div>
                <div className="text-right text-xs font-bold text-slate-700">{item.value} <span className="font-medium text-slate-500">({pct}%)</span></div>
              </div>
            )
          })
        )}
      </div>
    </Panel>
  )
}

function InsightPanel({ stats }) {
  const insights = [
    {
      icon: TrendingUp,
      text: `Kontrak yang akan habis ${stats?.kontrakBerakhir ?? 0}`,
      sub: 'Dibandingkan bulan lalu',
      className: 'text-emerald-600 bg-emerald-50',
    },
    {
      icon: ShieldCheck,
      text: `${stats?.asetDipinjam ?? 0} aset sedang dipinjam`,
      sub: 'Pantau pengembalian aset',
      className: 'text-green-600 bg-green-50',
    },
    {
      icon: Bell,
      text: `${stats?.reminderJatuhTempo ?? 0} reminder perlu perhatian`,
      sub: 'Segera tindak lanjuti',
      className: 'text-orange-600 bg-orange-50',
    },
    {
      icon: Wrench,
      text: `${stats?.maintenancePending ?? 0} maintenance pending`,
      sub: 'Cek jadwal maintenance',
      className: 'text-violet-600 bg-violet-50',
    },
  ]

  return (
    <Panel className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary-600" />
        <h2 className="text-sm font-bold text-slate-900">AI Insight</h2>
        <span className="rounded-md border border-primary-200 bg-primary-50 px-1.5 py-0.5 text-[10px] font-bold text-primary-600">Beta</span>
      </div>
      <div className="space-y-3">
        {insights.map((item) => (
          <div key={item.text} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.className}`}>
              <item.icon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-bold text-slate-800">{item.text}</span>
              <span className="mt-1 block text-[11px] text-slate-500">{item.sub}</span>
            </span>
          </div>
        ))}
      </div>
    </Panel>
  )
}

function FloatingActions() {
  const [open, setOpen] = useState(false)
  const actions = [
    { label: 'Tambah Karyawan', href: '/karyawan', icon: UserRoundPlus },
    { label: 'Tambah Aset', href: '/aset', icon: PackageCheck },
    { label: 'Tambah Kendaraan', href: '/kendaraan', icon: CarFront },
    { label: 'Buat Reminder', href: '/reminder', icon: Bell },
    { label: 'Generate Report', href: '/laporan', icon: FileText },
  ]

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {open && (
        <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-2xl">
          {actions.map((action) => (
            <Link key={action.label} href={action.href} className="flex min-w-[170px] items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              <action.icon className="h-4 w-4 text-slate-500" />
              {action.label}
            </Link>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-blue-700 text-white shadow-xl shadow-primary-500/30 transition hover:scale-105"
        aria-label="Quick actions"
      >
        <Plus className={`h-7 w-7 transition ${open ? 'rotate-45' : ''}`} />
      </button>
    </div>
  )
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => fetch('/api/dashboard').then((r) => r.json()),
  })

  if (isLoading) return <PageLoader />

  const { stats = {}, charts = {}, calendarEvents = [] } = data || {}
  const userName = session?.user?.name || 'Jeki'
  const firstName = userName.split(' ')[0] || userName
  const employeeTrend = charts?.karyawanTrend || { sixMonths: charts?.monthlyKaryawan || [] }
  const sparkData = (employeeTrend.sixMonths || charts?.monthlyKaryawan || []).map((item) => item.total)

  return (
    <div className="space-y-6">
      <div className="grid gap-5 xl:grid-cols-[1fr_1.45fr]">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-950">Selamat Pagi, {firstName}!</h1>
          <p className="mt-1 text-sm text-slate-500">Semoga harimu menyenangkan.</p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <AlertTile
              icon={AlarmClockCheck}
              value={stats?.reminderJatuhTempo}
              label="Reminder"
              href="/reminder"
              className="border-rose-100"
              iconClassName="bg-rose-50 text-rose-500"
            />
            <AlertTile
              icon={Gift}
              value={stats?.kontrakBerakhir}
              label="Kontrak akan habis"
              href="/karyawan/kontrak"
              className="border-orange-100"
              iconClassName="bg-orange-50 text-orange-500"
            />
            <AlertTile
              icon={CalendarDays}
              value={stats?.ulangTahunJatuhTempo}
              label="Ulang Tahun"
              href="/karyawan"
              className="border-emerald-100"
              iconClassName="bg-emerald-50 text-emerald-500"
            />
            <AlertTile
              icon={PackageCheck}
              value={stats?.asetDipinjam}
              label="Aset dipinjam"
              href="/aset/peminjaman"
              className="border-blue-100"
              iconClassName="bg-blue-50 text-blue-500"
            />
          </div>
        </div>

        <Panel className="p-5">
          <h2 className="mb-4 text-sm font-bold text-slate-900">Quick Actions</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <QuickAction icon={Plus} label="Tambah Karyawan" href="/karyawan" color="bg-gradient-to-br from-primary-500 to-blue-700 shadow-primary-500/25" />
            <QuickAction icon={PackageCheck} label="Tambah Aset" href="/aset" color="bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/25" />
            <QuickAction icon={CarFront} label="Tambah Kendaraan" href="/kendaraan" color="bg-gradient-to-br from-violet-500 to-purple-700 shadow-violet-500/25" />
            <QuickAction icon={Bell} label="Buat Reminder" href="/reminder" color="bg-gradient-to-br from-orange-400 to-orange-600 shadow-orange-500/25" />
            <QuickAction icon={FileText} label="Generate Report" href="/laporan" color="bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-cyan-500/25" />
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Karyawan" value={stats?.karyawanAktif} trend="+18%" subtitle="karyawan aktif" icon={UsersRound} iconWrap="bg-blue-50 text-primary-600" sparkColor="#2563eb" data={sparkData} href="/karyawan" />
        <StatCard title="Total Aset" value={stats?.totalAset} trend="+9%" subtitle="+1 bulan ini" icon={PackageCheck} iconWrap="bg-emerald-50 text-emerald-600" sparkColor="#10b981" data={[2, 4, 3, 5, 4, 6, 3, 3, 6, 2, 4, 7]} href="/aset" />
        <StatCard title="Kendaraan" value={stats?.totalKendaraan} trend="+5%" subtitle="+0 bulan ini" icon={CarFront} iconWrap="bg-violet-50 text-violet-600" sparkColor="#7c3aed" data={[3, 5, 4, 4, 3, 2, 5, 4, 5, 4, 4, 5]} href="/kendaraan" />
        <StatCard title="Notifikasi" value={stats?.notifikasiUnread} trend="" subtitle="Belum dibaca" icon={BellDot} iconWrap="bg-orange-50 text-orange-500" sparkColor="#f97316" data={[]} href="/notifikasi" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <EmployeeTrend trends={employeeTrend} />
        <ContractStatus data={charts?.karyawanByKontrak || []} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <MiniCalendar events={calendarEvents} />
        <div className="space-y-5">
          <UpcomingEvents events={calendarEvents} />
          <InsightPanel stats={stats} />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <AssetDistribution data={charts?.asetByKategori || []} total={stats?.totalAset || 0} />
        <RecentActivity events={calendarEvents} />
      </div>

      <FloatingActions />
    </div>
  )
}
