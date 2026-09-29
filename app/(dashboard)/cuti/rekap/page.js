'use client'

import { useMemo, useState } from 'react'
import { Download, Search } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import PageHeader from '@/components/ui/PageHeader'
import LeaveBalanceCard from '@/components/cuti/LeaveBalanceCard'
import { getRelevantLeaveTypes, sortLeaveEmployees } from '@/lib/leave-rekap'

async function fetchJson(url) {
  const response = await fetch(url)
  const payload = await response.json()
  if (!response.ok) throw new Error(payload.error || 'Gagal memuat rekap')
  return payload
}

function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-full bg-slate-200" />
        <div className="flex-1 space-y-2"><div className="h-4 w-2/3 rounded bg-slate-200" /><div className="h-3 w-1/3 rounded bg-slate-100" /></div>
        <div className="h-8 w-8 rounded bg-slate-100" />
      </div>
      <div className="mt-5 h-11 rounded-lg bg-slate-100" />
      <div className="mt-4 h-3 w-1/2 rounded bg-slate-100" />
    </div>
  )
}

export default function RekapCutiPage() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [filters, setFilters] = useState({ employeeId: '', leaveTypeId: '' })
  const [search, setSearch] = useState('')
  const queryString = new URLSearchParams({ year: String(year) }).toString()
  const { data, isLoading, isError } = useQuery({ queryKey: ['cuti', 'rekap', year], queryFn: () => fetchJson(`/api/cuti/rekap?${queryString}`) })
  const { data: typeData } = useQuery({ queryKey: ['cuti', 'jenis'], queryFn: () => fetchJson('/api/cuti/jenis') })
  const { data: employeeData } = useQuery({ queryKey: ['karyawan', 'cuti-filter'], queryFn: () => fetchJson('/api/karyawan?limit=1000&statusAktif=true') })

  const employees = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('id-ID')
    const filtered = (data?.data || []).filter((employee) => {
      const matchesEmployee = !filters.employeeId || employee.employeeId === filters.employeeId
      const matchesSearch = !normalizedSearch || employee.employeeName.toLocaleLowerCase('id-ID').includes(normalizedSearch)
      const matchesType = !filters.leaveTypeId || getRelevantLeaveTypes(employee, employee.leaveBalances).some((balance) => balance.leaveTypeId === filters.leaveTypeId)
      return matchesEmployee && matchesSearch && matchesType
    })
    return sortLeaveEmployees(filtered)
  }, [data?.data, filters.employeeId, filters.leaveTypeId, search])

  const download = async () => {
    const response = await fetch(`/api/cuti/rekap?year=${year}&format=xlsx`)
    if (!response.ok) throw new Error('Gagal mengunduh rekap cuti')
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `rekap-cuti-${year}.xlsx`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <PageHeader
        title="Rekap Cuti Karyawan"
        subtitle="Saldo cuti per karyawan untuk tahun berjalan"
        breadcrumb={[{ label: 'Dashboard', href: '/' }, { label: 'Manajemen Cuti' }, { label: 'Rekap Cuti' }]}
        actions={<button className="btn-primary" onClick={download}><Download className="h-4 w-4" />Export Excel</button>}
      />

      <div className="page-section mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <input aria-label="Tahun" type="number" min="2000" max="2100" className="form-input" value={year} onChange={(event) => setYear(Number(event.target.value))} />
        <select aria-label="Filter karyawan" className="form-select" value={filters.employeeId} onChange={(event) => setFilters((current) => ({ ...current, employeeId: event.target.value }))}>
          <option value="">Semua karyawan</option>
          {(employeeData?.data || []).map((employee) => { const id = employee.id || employee._id; return <option key={id} value={id}>{employee.nama}</option> })}
        </select>
        <select aria-label="Filter jenis cuti" className="form-select" value={filters.leaveTypeId} onChange={(event) => setFilters((current) => ({ ...current, leaveTypeId: event.target.value }))}>
          <option value="">Semua jenis cuti</option>
          {(typeData?.data || []).map((type) => { const id = type.id || type._id; return <option key={id} value={id}>{type.name}</option> })}
        </select>
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input aria-label="Cari nama karyawan" type="search" className="form-input pl-9" placeholder="Cari nama karyawan..." value={search} onChange={(event) => setSearch(event.target.value)} />
        </label>
      </div>

      {isError ? (
        <div role="alert" className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center text-sm text-red-700">Gagal memuat rekap cuti. Silakan coba lagi.</div>
      ) : isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <CardSkeleton key={index} />)}</div>
      ) : employees.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">Tidak ada karyawan yang cocok dengan filter ini.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {employees.map((employee) => <LeaveBalanceCard key={employee.employeeId} employee={employee} leaveTypeFilter={filters.leaveTypeId} year={year} />)}
        </div>
      )}
    </div>
  )
}
