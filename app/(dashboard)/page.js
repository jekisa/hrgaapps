'use client'

import Link from 'next/link'
import {
  Users, Package, Car, Bell,
  AlertTriangle, Clock, Activity
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { formatDate } from '@/lib/utils'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { useQuery } from '@tanstack/react-query'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

function StatCard({ title, value, subtitle, icon: Icon, iconBg, iconColor, href }) {
  const content = (
    <div className="card-hover p-5 group">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1 leading-none">{value ?? '-'}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1.5">{subtitle}</p>}
        </div>
      </div>
    </div>
  )
  return href ? <Link href={href}>{content}</Link> : content
}

function AlertCard({ icon: Icon, title, value, color, href }) {
  return (
    <Link href={href || '#'} className={`flex items-center gap-3 p-3.5 rounded-xl border ${color} hover:opacity-90 transition-all`}>
      <div className="shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm font-bold">{value}</p>
        <p className="text-xs opacity-80">{title}</p>
      </div>
    </Link>
  )
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Selamat datang di HRGA Apps Management System</p>
      </div>

      {/* Alerts Row */}
      {(stats?.kontrakBerakhir > 0 || stats?.pajakJatuhTempo > 0 || stats?.maintenancePending > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {stats?.kontrakBerakhir > 0 && (
            <AlertCard
              icon={AlertTriangle}
              title="Kontrak karyawan berakhir (30 hari)"
              value={`${stats.kontrakBerakhir} Karyawan`}
              color="border-orange-200 bg-orange-50 text-orange-700"
              href="/karyawan/kontrak"
            />
          )}
          {stats?.pajakJatuhTempo > 0 && (
            <AlertCard
              icon={AlertTriangle}
              title="Pajak kendaraan jatuh tempo"
              value={`${stats.pajakJatuhTempo} Kendaraan`}
              color="border-red-200 bg-red-50 text-red-700"
              href="/kendaraan/pajak"
            />
          )}
          {stats?.maintenancePending > 0 && (
            <AlertCard
              icon={Clock}
              title="Maintenance belum selesai"
              value={`${stats.maintenancePending} Request`}
              color="border-yellow-200 bg-yellow-50 text-yellow-700"
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
        {/* Bar Chart - Monthly Karyawan */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-semibold text-gray-800 mb-4">Trend Karyawan (6 Bulan)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={charts?.monthlyKaryawan || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Karyawan" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Karyawan by Contract */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Status Kontrak</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={charts?.karyawanByKontrak || []}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {(charts?.karyawanByKontrak || []).map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(val, name) => [val, name]} />
              <Legend iconSize={10} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset by Category */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Aset per Kategori</h3>
          <div className="space-y-3">
            {(charts?.asetByKategori || []).map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ background: COLORS[idx % COLORS.length] }}
                />
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 capitalize">{item.name.toLowerCase()}</span>
                    <span className="font-semibold text-gray-800">{item.value}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (item.value / (stats?.totalAset || 1)) * 100)}%`,
                        background: COLORS[idx % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {(!charts?.asetByKategori || charts.asetByKategori.length === 0) && (
              <p className="text-gray-400 text-sm text-center py-4">Belum ada data aset</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Aktivitas Terbaru</h3>
            <Link href="/audit-trail" className="text-xs text-primary-600 hover:underline">
              Lihat semua
            </Link>
          </div>
          <div className="space-y-3">
            {(recentActivity || []).map((log) => (
              <div key={log.id} className="flex items-start gap-3 text-sm">
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <Activity className="w-3.5 h-3.5 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-700">
                    <span className="font-medium">{log.user}</span>{' '}
                    <span className="text-gray-500">{log.aksi.toLowerCase()}</span>{' '}
                    di modul{' '}
                    <span className="font-medium">{log.modul}</span>
                  </p>
                  {log.detail && <p className="text-gray-400 text-xs truncate">{log.detail}</p>}
                  <p className="text-gray-400 text-xs mt-0.5">{formatDate(log.createdAt, 'dd MMM yyyy HH:mm')}</p>
                </div>
              </div>
            ))}
            {(!recentActivity || recentActivity.length === 0) && (
              <p className="text-gray-400 text-sm text-center py-4">Belum ada aktivitas</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
