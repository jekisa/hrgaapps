'use client'

import { useState, useMemo } from 'react'
import { Download } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import PageHeader from '@/components/ui/PageHeader'
import DataTable from '@/components/ui/DataTable'

async function fetchJson(url) { const response = await fetch(url); const payload = await response.json(); if (!response.ok) throw new Error(payload.error || 'Gagal memuat rekap'); return payload }

export default function RekapCutiPage() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [filters, setFilters] = useState({ employeeId: '', leaveTypeId: '' })
  const queryString = new URLSearchParams({ year: String(year), ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value)) }).toString()
  const { data, isLoading } = useQuery({ queryKey: ['cuti', 'rekap', year, filters], queryFn: () => fetchJson(`/api/cuti/rekap?${queryString}`) })
  const { data: typeData } = useQuery({ queryKey: ['cuti', 'jenis'], queryFn: () => fetchJson('/api/cuti/jenis') })
  const { data: employeeData } = useQuery({ queryKey: ['karyawan', 'cuti-filter'], queryFn: () => fetchJson('/api/karyawan?limit=1000&statusAktif=true') })
  const columns = useMemo(() => [
    { header: 'Nama Karyawan', accessorKey: 'employeeName', cell: ({ getValue }) => <span className="font-semibold text-slate-800">{getValue()}</span> },
    { header: 'Jenis Cuti', accessorKey: 'leaveType' },
    { header: 'Kuota', accessorKey: 'quota' },
    { header: 'Terpakai', accessorKey: 'used' },
    { header: 'Sisa', accessorKey: 'remaining', cell: ({ getValue }) => <span className="font-bold text-emerald-600">{getValue()}</span> },
  ], [])
  const download = async () => { const response = await fetch(`/api/cuti/rekap?${queryString}&format=xlsx`); const blob = await response.blob(); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `rekap-cuti-${year}.xlsx`; link.click(); URL.revokeObjectURL(url) }
  return <div><PageHeader title="Rekap Cuti Karyawan" subtitle="Saldo cuti per karyawan untuk tahun berjalan" breadcrumb={[{ label: 'Dashboard', href: '/' }, { label: 'Manajemen Cuti' }, { label: 'Rekap Cuti' }]} actions={<button className="btn-primary" onClick={download}><Download className="h-4 w-4" />Export Excel</button>} /><div className="page-section mb-5 grid gap-3 md:grid-cols-3"><input type="number" className="form-input" value={year} onChange={(event) => setYear(Number(event.target.value))} /><select className="form-select" value={filters.employeeId} onChange={(event) => setFilters({ ...filters, employeeId: event.target.value })}><option value="">Semua karyawan</option>{(employeeData?.data || []).map((employee) => <option key={employee._id} value={employee._id}>{employee.nama}</option>)}</select><select className="form-select" value={filters.leaveTypeId} onChange={(event) => setFilters({ ...filters, leaveTypeId: event.target.value })}><option value="">Semua jenis cuti</option>{(typeData?.data || []).map((type) => <option key={type._id} value={type._id}>{type.name}</option>)}</select></div><DataTable data={data?.data || []} columns={columns} isLoading={isLoading} emptyMessage="Belum ada data saldo cuti" /></div>
}
