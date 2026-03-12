'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Users, Package, Car, Bell,
  AlertTriangle, Clock, Activity,
  ArrowRight, Plus, Edit3, Trash2, Eye,
  ChevronLeft, ChevronRight, CalendarDays,
  FileText, Wrench, Route, TrendingUp,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { formatDate } from '@/lib/utils'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { useQuery } from '@tanstack/react-query'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

// ─── Helpers ─────────────────────────────────────────────────────────────────

const eventDotClass = {
  kontrak:     'bg-orange-400',
  pajak:       'bg-red-400',
  jadwal:      'bg-blue-400',
  maintenance: 'bg-yellow-400',
}

const eventBadgeClass = {
  kontrak:     'bg-orange-50 text-orange-700 border-orange-200',
  pajak:       'bg-red-50 text-red-700 border-red-200',
  jadwal:      'bg-blue-50 text-blue-700 border-blue-200',
  maintenance: 'bg-yellow-50 text-yellow-700 border-yellow-200',
}

const eventIconEl = {
  kontrak:     <FileText className="w-3 h-3" />,
  pajak:       <Car className="w-3 h-3" />,
  jadwal:      <Route className="w-3 h-3" />,
  maintenance: <Wrench className="w-3 h-3" />,
}

function getTodayStr() {
  const t = new Date()
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
}

const actionIcon = (aksi = '') => {
  const a = aksi.toUpperCase()
  if (a.includes('TAMBAH') || a.includes('CREATE')) return <Plus className="w-3 h-3" />
  if (a.includes('EDIT') || a.includes('UPDATE')) return <Edit3 className="w-3 h-3" />
  if (a.includes('HAPUS') || a.includes('DELETE')) return <Trash2 className="w-3 h-3" />
  return <Eye className="w-3 h-3" />
}

const actionColor = (aksi = '') => {
  const a = aksi.toUpperCase()
  if (a.includes('TAMBAH') || a.includes('CREATE')) return 'bg-emerald-100 text-emerald-600'
  if (a.includes('EDIT') || a.includes('UPDATE')) return 'bg-blue-100 text-blue-600'
  if (a.includes('HAPUS') || a.includes('DELETE')) return 'bg-red-100 text-red-600'
  return 'bg-gray-100 text-gray-500'
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ title, value, subtitle, icon: Icon, gradient, href }) {
  const content = (
    <div className={`relative overflow-hidden rounded-xl p-4 ${gradient} text-white shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer`}>
      <div className="absolute -top-3 -right-3 w-16 h-16 rounded-full bg-white/10" />
      <div className="relative z-10 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm shrink-0">
          <Icon className="w-4.5 h-4.5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 leading-none">{title}</p>
          <p className="text-2xl font-extrabold leading-none tabular-nums mt-1">{value ?? '—'}</p>
          {subtitle && <p className="text-[11px] mt-0.5 opacity-60">{subtitle}</p>}
        </div>
        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
      </div>
    </div>
  )
  return href ? <Link href={href}>{content}</Link> : content
}

function AlertCard({ icon: Icon, title, value, color, href }) {
  return (
    <Link href={href || '#'} className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${color}`}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/40 shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold leading-none">{value}</p>
        <p className="text-xs opacity-75 mt-0.5">{title}</p>
      </div>
      <ArrowRight className="w-3.5 h-3.5 opacity-40 shrink-0" />
    </Link>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-xl px-3 py-2 text-xs">
      <p className="font-bold text-gray-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.stroke || p.color }}>
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

// ─── Mini Calendar ────────────────────────────────────────────────────────────

function MiniCalendar({ events = [] }) {
  const [cursor, setCursor] = useState(() => {
    const n = new Date()
    return { year: n.getFullYear(), month: n.getMonth() }
  })
  const [selected, setSelected] = useState(null)

  const { year, month } = cursor
  const today = getTodayStr()

  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthLabel = new Date(year, month, 1).toLocaleString('id-ID', { month: 'long', year: 'numeric' })

  const byDate = useMemo(() => {
    const map = {}
    events.forEach((e) => {
      if (!map[e.date]) map[e.date] = []
      map[e.date].push(e)
    })
    return map
  }, [events])

  const selectedEvents = selected ? (byDate[selected] || []) : []

  const prev = () => setCursor(({ year, month }) =>
    month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 })
  const next = () => setCursor(({ year, month }) =>
    month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 })

  return (
    <div className="card p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-primary-500" />
          <h3 className="font-semibold text-gray-800 capitalize">{monthLabel}</h3>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={prev} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={() => { const n = new Date(); setCursor({ year: n.getFullYear(), month: n.getMonth() }); setSelected(null) }}
            className="text-[10px] font-bold text-primary-600 px-2 py-0.5 rounded-md hover:bg-primary-50 transition-colors"
          >
            Hari ini
          </button>
          <button onClick={next} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7">
        {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((d) => (
          <div key={d} className="text-center text-[10px] font-bold text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isToday = dateStr === today
          const isSelected = selected === dateStr
          const dayEvents = byDate[dateStr] || []
          const colIdx = (firstDayOfWeek + i) % 7
          const isSun = colIdx === 6
          const isSat = colIdx === 5

          return (
            <button
              key={day}
              onClick={() => setSelected(isSelected ? null : dateStr)}
              className={[
                'flex flex-col items-center py-1 rounded-xl text-xs font-medium transition-all duration-150',
                isSelected ? 'bg-primary-600 text-white shadow-sm' :
                  isToday ? 'bg-primary-50 text-primary-700 font-bold ring-1 ring-primary-200' :
                  isSun ? 'text-red-400 hover:bg-red-50' :
                  isSat ? 'text-blue-400 hover:bg-blue-50' :
                  'text-gray-700 hover:bg-gray-100',
              ].join(' ')}
            >
              <span>{day}</span>
              {dayEvents.length > 0 && (
                <div className="flex gap-[3px] mt-0.5">
                  {[...new Set(dayEvents.map((e) => e.type))].slice(0, 3).map((type) => (
                    <span key={type} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/70' : eventDotClass[type]}`} />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 border-t border-gray-100">
        {Object.entries(eventDotClass).map(([type, cls]) => (
          <div key={type} className="flex items-center gap-1.5 text-[10px] text-gray-500">
            <span className={`w-2 h-2 rounded-full ${cls}`} />
            <span className="capitalize">{type}</span>
          </div>
        ))}
      </div>

      {/* Selected date events */}
      {selected && (
        <div className="border-t border-gray-100 pt-3 space-y-1.5">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
            {new Date(selected + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          {selectedEvents.length === 0 ? (
            <p className="text-xs text-gray-400 py-1">Tidak ada event pada hari ini</p>
          ) : (
            selectedEvents.map((e, i) => (
              <Link key={i} href={e.href || '#'}
                className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium hover:opacity-80 transition-opacity ${eventBadgeClass[e.type]}`}>
                {eventIconEl[e.type]}
                <span className="truncate">{e.label}</span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ─── Upcoming Events ──────────────────────────────────────────────────────────

function UpcomingEvents({ events = [] }) {
  const today = getTodayStr()
  const upcoming = useMemo(() =>
    events
      .filter((e) => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 8),
    [events, today]
  )

  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-primary-500" />
        <h3 className="font-semibold text-gray-800">Event Mendatang</h3>
      </div>
      <div className="space-y-1.5">
        {upcoming.length === 0 ? (
          <div className="py-8 text-center">
            <CalendarDays className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-xs text-gray-400">Tidak ada event mendatang</p>
          </div>
        ) : (
          upcoming.map((e, i) => {
            const d = new Date(e.date + 'T00:00:00')
            const isToday = e.date === today
            const diff = Math.round((d - new Date(today + 'T00:00:00')) / 86400000)
            return (
              <Link key={i} href={e.href || '#'} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group">
                <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0 ${isToday ? 'bg-primary-600' : 'bg-gray-100'}`}>
                  <span className={`text-sm font-extrabold leading-none ${isToday ? 'text-white' : 'text-gray-700'}`}>{d.getDate()}</span>
                  <span className={`text-[9px] font-bold uppercase ${isToday ? 'text-white/70' : 'text-gray-400'}`}>
                    {d.toLocaleString('id-ID', { month: 'short' })}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-700 truncate group-hover:text-primary-600 transition-colors">{e.label}</p>
                  <p className={`text-[10px] mt-0.5 font-medium ${isToday ? 'text-primary-600' : diff <= 3 ? 'text-red-500' : 'text-gray-400'}`}>
                    {isToday ? 'Hari ini' : diff === 1 ? 'Besok' : `${diff} hari lagi`}
                  </p>
                </div>
                <span className={`w-2 h-2 rounded-full shrink-0 ${eventDotClass[e.type]}`} />
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => fetch('/api/dashboard').then((r) => r.json()),
  })

  if (isLoading) return <PageLoader />

  const { stats, charts, recentActivity, calendarEvents } = data || {}

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Selamat Pagi'
    if (h < 15) return 'Selamat Siang'
    if (h < 18) return 'Selamat Sore'
    return 'Selamat Malam'
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <p className="text-xs font-bold text-primary-500 uppercase tracking-widest mb-0.5">{greeting()}</p>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">HR &amp; GA Management System</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Alerts */}
      {(stats?.kontrakBerakhir > 0 || stats?.pajakJatuhTempo > 0 || stats?.maintenancePending > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {stats?.kontrakBerakhir > 0 && (
            <AlertCard icon={AlertTriangle} title="Kontrak berakhir (30 hari)" value={`${stats.kontrakBerakhir} Karyawan`}
              color="border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700" href="/karyawan/kontrak" />
          )}
          {stats?.pajakJatuhTempo > 0 && (
            <AlertCard icon={AlertTriangle} title="Pajak kendaraan jatuh tempo" value={`${stats.pajakJatuhTempo} Kendaraan`}
              color="border-red-200 bg-gradient-to-r from-red-50 to-rose-50 text-red-700" href="/kendaraan/pajak" />
          )}
          {stats?.maintenancePending > 0 && (
            <AlertCard icon={Clock} title="Maintenance belum selesai" value={`${stats.maintenancePending} Request`}
              color="border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700" href="/gedung/maintenance" />
          )}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Karyawan" value={stats?.totalKaryawan} subtitle={`${stats?.karyawanAktif ?? 0} aktif`}
          icon={Users} gradient="bg-gradient-to-br from-blue-500 to-blue-700" href="/karyawan" />
        <StatCard title="Total Aset" value={stats?.totalAset} subtitle={`${stats?.asetDipinjam ?? 0} dipinjam`}
          icon={Package} gradient="bg-gradient-to-br from-emerald-500 to-teal-600" href="/aset" />
        <StatCard title="Kendaraan" value={stats?.totalKendaraan} subtitle={`${stats?.kendaraanTersedia ?? 0} tersedia`}
          icon={Car} gradient="bg-gradient-to-br from-violet-500 to-purple-700" href="/kendaraan" />
        <StatCard title="Notifikasi" value={stats?.notifikasiUnread} subtitle="belum dibaca"
          icon={Bell} gradient="bg-gradient-to-br from-amber-400 to-orange-500" href="/notifikasi" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-800">Trend Karyawan</h3>
              <p className="text-xs text-gray-400 mt-0.5">6 bulan terakhir</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full">
              <TrendingUp className="w-3.5 h-3.5" /> Aktif
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={charts?.monthlyKaryawan || []} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
              <defs>
                <linearGradient id="gradKaryawan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="total" name="Karyawan" stroke="#3b82f6" strokeWidth={2.5}
                fill="url(#gradKaryawan)" dot={{ fill: '#3b82f6', r: 3.5, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#2563eb' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <div className="mb-3">
            <h3 className="font-semibold text-gray-800">Status Kontrak</h3>
            <p className="text-xs text-gray-400 mt-0.5">Karyawan aktif</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={charts?.karyawanByKontrak || []} cx="50%" cy="46%"
                innerRadius={54} outerRadius={78} paddingAngle={4} dataKey="value" strokeWidth={0}>
                {(charts?.karyawanByKontrak || []).map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Calendar + Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MiniCalendar events={calendarEvents || []} />
        </div>
        <div>
          <UpcomingEvents events={calendarEvents || []} />
        </div>
      </div>

      {/* Aset + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-gray-800">Aset per Kategori</h3>
              <p className="text-xs text-gray-400 mt-0.5">{stats?.totalAset ?? 0} total aset</p>
            </div>
            <Link href="/aset" className="text-xs text-primary-600 font-semibold flex items-center gap-1 group hover:text-primary-700">
              Lihat semua <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          {(!charts?.asetByKategori || charts.asetByKategori.length === 0) ? (
            <div className="py-8 text-center">
              <Package className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Belum ada data aset</p>
            </div>
          ) : (
            <div className="space-y-3">
              {charts.asetByKategori.map((item, idx) => {
                const pct = Math.min(100, (item.value / (stats?.totalAset || 1)) * 100)
                const color = COLORS[idx % COLORS.length]
                return (
                  <div key={idx} className="flex items-center gap-3 group">
                    {/* Color dot */}
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                    {/* Label */}
                    <span className="text-xs text-gray-600 font-medium capitalize w-28 truncate shrink-0">
                      {item.name?.toLowerCase()}
                    </span>
                    {/* Bar */}
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                    {/* Count + pct */}
                    <div className="flex items-center gap-1.5 shrink-0 w-16 justify-end">
                      <span className="text-xs font-bold text-gray-800 tabular-nums">{item.value}</span>
                      <span className="text-[10px] text-gray-400 tabular-nums">({pct.toFixed(0)}%)</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary-500" />
              <h3 className="font-semibold text-gray-800">Aktivitas Terbaru</h3>
            </div>
            <Link href="/audit-trail" className="text-xs text-primary-600 font-semibold flex items-center gap-1 group hover:text-primary-700">
              Lihat semua <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="space-y-2.5">
            {(recentActivity || []).map((log, idx, arr) => (
              <div key={log.id} className="flex items-start gap-3 relative">
                {idx < arr.length - 1 && (
                  <div className="absolute left-3.5 top-7 w-px h-[calc(100%+2px)] bg-gray-100" />
                )}
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 z-10 ${actionColor(log.aksi)}`}>
                  {actionIcon(log.aksi)}
                </div>
                <div className="flex-1 min-w-0 pb-1">
                  <p className="text-sm text-gray-700 leading-snug">
                    <span className="font-semibold">{log.user}</span>{' '}
                    <span className="text-gray-400">{log.aksi?.toLowerCase()}</span>{' '}
                    <span className="font-medium">{log.modul}</span>
                  </p>
                  {log.detail && <p className="text-xs text-gray-400 truncate">{log.detail}</p>}
                  <p className="text-[10px] text-gray-300 mt-0.5">{formatDate(log.createdAt, 'dd MMM yyyy HH:mm')}</p>
                </div>
              </div>
            ))}
            {(!recentActivity || recentActivity.length === 0) && (
              <div className="py-8 text-center">
                <Activity className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Belum ada aktivitas</p>
              </div>
            )}
          </div>
        </div>
      </div>


    </div>
  )
}
