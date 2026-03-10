'use client'

import Link from 'next/link'
import {
  Users, Package, Car, Bell,
  AlertTriangle, Clock, Activity,
  TrendingUp, ArrowRight, Plus, Edit3, Trash2, Eye,
  Zap, BarChart2, PieChart as PieChartIcon,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { formatDate } from '@/lib/utils'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { useQuery } from '@tanstack/react-query'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

const actionIcon = (aksi = '') => {
  const a = aksi.toUpperCase()
  if (a.includes('TAMBAH') || a.includes('CREATE')) return <Plus className="w-3.5 h-3.5" />
  if (a.includes('EDIT') || a.includes('UPDATE')) return <Edit3 className="w-3.5 h-3.5" />
  if (a.includes('HAPUS') || a.includes('DELETE')) return <Trash2 className="w-3.5 h-3.5" />
  return <Eye className="w-3.5 h-3.5" />
}

const actionColor = (aksi = '') => {
  const a = aksi.toUpperCase()
  if (a.includes('TAMBAH') || a.includes('CREATE')) return 'bg-emerald-100 text-emerald-600'
  if (a.includes('EDIT') || a.includes('UPDATE')) return 'bg-blue-100 text-blue-600'
  if (a.includes('HAPUS') || a.includes('DELETE')) return 'bg-red-100 text-red-600'
  return 'bg-gray-100 text-gray-500'
}

function StatCard({ title, value, subtitle, icon: Icon, iconBg, iconColor, href, trend }) {
  const content = (
    <div className="card p-5 card-hover group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5 -translate-y-6 translate-x-6"
        style={{ background: iconColor?.replace('text-', '') }} />
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${iconBg}`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-1 leading-none tabular-nums">
            {value ?? <span className="text-gray-300">—</span>}
          </p>
          {subtitle && <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
            {trend && <TrendingUp className="w-3 h-3 text-emerald-500" />}
            {subtitle}
          </p>}
        </div>
      </div>
      {href && (
        <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          Lihat detail <ArrowRight className="w-3 h-3" />
        </div>
      )}
    </div>
  )
  return href ? <Link href={href}>{content}</Link> : content
}

function AlertCard({ icon: Icon, title, value, color, href }) {
  return (
    <Link
      href={href || '#'}
      className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${color}`}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/40 shrink-0">
        <Icon className="w-4.5 h-4.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold leading-none">{value}</p>
        <p className="text-xs opacity-75 mt-0.5 leading-snug">{title}</p>
      </div>
      <ArrowRight className="w-3.5 h-3.5 opacity-40 shrink-0" />
    </Link>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-xs">
        <p className="font-semibold text-gray-700 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: <span className="font-bold">{p.value}</span></p>
        ))}
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => fetch('/api/dashboard').then(r => r.json()),
  })

  if (isLoading) return <PageLoader />

  const { stats, charts, recentActivity } = data || {}

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-5 h-5 text-primary-500" />
            <span className="text-xs font-bold text-primary-600 uppercase tracking-widest">Dashboard</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            HRGA Management System
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Ringkasan data dan aktivitas terkini</p>
        </div>
      </div>

      {/* Alerts Row */}
      {(stats?.kontrakBerakhir > 0 || stats?.pajakJatuhTempo > 0 || stats?.maintenancePending > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {stats?.kontrakBerakhir > 0 && (
            <AlertCard
              icon={AlertTriangle}
              title="Kontrak karyawan berakhir (30 hari)"
              value={`${stats.kontrakBerakhir} Karyawan`}
              color="border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700"
              href="/karyawan/kontrak"
            />
          )}
          {stats?.pajakJatuhTempo > 0 && (
            <AlertCard
              icon={AlertTriangle}
              title="Pajak kendaraan jatuh tempo"
              value={`${stats.pajakJatuhTempo} Kendaraan`}
              color="border-red-200 bg-gradient-to-r from-red-50 to-rose-50 text-red-700"
              href="/kendaraan/pajak"
            />
          )}
          {stats?.maintenancePending > 0 && (
            <AlertCard
              icon={Clock}
              title="Maintenance belum selesai"
              value={`${stats.maintenancePending} Request`}
              color="border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700"
              href="/gedung/maintenance"
            />
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Karyawan"
          value={stats?.totalKaryawan}
          subtitle={`${stats?.karyawanAktif ?? 0} aktif`}
          icon={Users}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          href="/karyawan"
          trend
        />
        <StatCard
          title="Total Aset"
          value={stats?.totalAset}
          subtitle={`${stats?.asetDipinjam ?? 0} sedang dipinjam`}
          icon={Package}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          href="/aset"
        />
        <StatCard
          title="Kendaraan"
          value={stats?.totalKendaraan}
          subtitle={`${stats?.kendaraanTersedia ?? 0} tersedia`}
          icon={Car}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
          href="/kendaraan"
        />
        <StatCard
          title="Notifikasi Baru"
          value={stats?.notifikasiUnread}
          subtitle="belum dibaca"
          icon={Bell}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          href="/notifikasi"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-4 h-4 text-primary-500" />
            <h3 className="font-semibold text-gray-800">Trend Karyawan (6 Bulan)</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={charts?.monthlyKaryawan || []} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" radius={[6, 6, 0, 0]} name="Karyawan">
                {(charts?.monthlyKaryawan || []).map((_, idx, arr) => (
                  <Cell
                    key={idx}
                    fill={idx === arr.length - 1 ? '#3b82f6' : '#bfdbfe'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="w-4 h-4 text-primary-500" />
            <h3 className="font-semibold text-gray-800">Status Kontrak</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={charts?.karyawanByKontrak || []}
                cx="50%"
                cy="45%"
                innerRadius={52}
                outerRadius={78}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={0}
              >
                {(charts?.karyawanByKontrak || []).map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconSize={8}
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset by Category */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Aset per Kategori</h3>
          <div className="space-y-3.5">
            {(charts?.asetByKategori || []).map((item, idx) => {
              const pct = Math.min(100, (item.value / (stats?.totalAset || 1)) * 100)
              return (
                <div key={idx}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-600 font-medium capitalize">{item.name.toLowerCase()}</span>
                    <span className="font-bold text-gray-800 tabular-nums">{item.value}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: COLORS[idx % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              )
            })}
            {(!charts?.asetByKategori || charts.asetByKategori.length === 0) && (
              <p className="text-gray-400 text-sm text-center py-6">Belum ada data aset</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary-500" />
              <h3 className="font-semibold text-gray-800">Aktivitas Terbaru</h3>
            </div>
            <Link
              href="/audit-trail"
              className="text-xs text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1 group"
            >
              Lihat semua <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="space-y-3">
            {(recentActivity || []).map((log) => (
              <div key={log.id} className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${actionColor(log.aksi)}`}>
                  {actionIcon(log.aksi)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 leading-snug">
                    <span className="font-semibold">{log.user}</span>{' '}
                    <span className="text-gray-500">{log.aksi.toLowerCase()}</span>{' '}
                    <span className="font-medium text-gray-700">{log.modul}</span>
                  </p>
                  {log.detail && <p className="text-xs text-gray-400 truncate mt-0.5">{log.detail}</p>}
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
