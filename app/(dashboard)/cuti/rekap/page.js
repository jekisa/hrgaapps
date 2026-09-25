'use client'

import { useState, useMemo } from 'react'
import { Download } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import PageHeader from '@/components/ui/PageHeader'
import DataTable from '@/components/ui/DataTable'

async function fetchJson(url) { const response = await fetch(url); const payload = await response.json(); if (!response.ok) throw new Error(payload.error || 'Gagal memuat rekap'); return payload }

export default function RekapCutiPage() {
  const [year, setYear] = useState(new Date().getFullYear())
  const { data, isLoading } = useQuery({ queryKey: ['cuti', 'rekap', year], queryFn: () => fetchJson(`/api/cuti/rekap?year=${year}`) })
  const columns = useMemo(() => [
    { header: 'Nama Karyawan', accessorKey: 'employeeName', cell: ({ getValue }) => <span className="font-semibold text-slate-800">{getValue()}</span> },
    { header: 'Jenis Cuti', accessorKey: 'leaveType' },
    { header: 'Kuota', accessorKey: 'quota' },
    { header: 'Terpakai', accessorKey: 'used' },
    { header: 'Sisa', accessorKey: 'remaining', cell: ({ getValue }) => <span className="font-bold text-emerald-600">{getValue()}</span> },
  ], [])
  const download = async () => { const response = await fetch(`/api/cuti/rekap?year=${year}&format=xlsx`); const blob = await response.blob(); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `rekap-cuti-${year}.xlsx`; link.click(); URL.revokeObjectURL(url) }
  return <div><PageHeader title="Rekap Cuti Karyawan" subtitle="Saldo cuti per karyawan untuk tahun berjalan" breadcrumb={[{ label: 'Dashboard', href: '/' }, { label: 'Manajemen Cuti' }, { label: 'Rekap Cuti' }]} actions={<button className="btn-primary" onClick={download}><Download className="h-4 w-4" />Export Excel</button>} /><div className="page-section mb-5 flex items-center gap-3"><label className="form-label mb-0">Tahun</label><input type="number" className="form-input max-w-32" value={year} onChange={(event) => setYear(Number(event.target.value))} /></div><DataTable data={data?.data || []} columns={columns} isLoading={isLoading} emptyMessage="Belum ada data saldo cuti" /></div>
}
