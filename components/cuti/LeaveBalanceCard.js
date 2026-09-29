'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, ChevronDown, ChevronUp, Pencil } from 'lucide-react'
import { getBalanceDisplay, getRelevantLeaveTypes, hasDebt, isCriticalEmployee } from '@/lib/leave-rekap'
import Modal from '@/components/ui/Modal'

function getInitials(name = '') {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'K'
}

function BalanceRow({ balance, highlight = false, onEdit }) {
  const remainingDisplay = getBalanceDisplay(balance.remaining)
  return (
    <div className={`flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-lg px-3 py-2.5 text-sm ${highlight ? 'bg-emerald-50/70' : 'bg-slate-50'}`}>
      <span className="font-semibold text-slate-700">{balance.leaveType}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500">
          Kuota <strong className="text-slate-700">{balance.quota}</strong>
          <span className="px-1.5">·</span>Terpakai <strong className="text-slate-700">{balance.used}</strong>
          {balance.carriedDebt > 0 && <><span className="px-1.5">·</span>Hutang bawaan <strong className="text-red-700">{balance.carriedDebt}</strong></>}
          <span className="px-1.5">·</span>{remainingDisplay.label} <strong className={remainingDisplay.tone === 'danger' ? 'text-red-700' : highlight ? 'text-emerald-700' : 'text-slate-800'}>{remainingDisplay.value}</strong>
        </span>
        <button type="button" onClick={onEdit} aria-label={`Edit kuota ${balance.leaveType}`} className="rounded-md p-1.5 text-slate-500 hover:bg-white hover:text-primary-700">
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

export default function LeaveBalanceCard({ employee, leaveTypeFilter = '', year }) {
  const [expanded, setExpanded] = useState(false)
  const [editingBalance, setEditingBalance] = useState(null)
  const [remaining, setRemaining] = useState('')
  const [reason, setReason] = useState('')
  const [saveError, setSaveError] = useState('')
  const queryClient = useQueryClient()
  const updateBalance = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/cuti/rekap', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: employee.employeeId, leaveTypeId: editingBalance.leaveTypeId, year, remaining: Number(remaining), reason }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Gagal memperbarui saldo')
      return payload
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['cuti', 'rekap', year] })
      setEditingBalance(null)
    },
    onError: (error) => setSaveError(error.message),
  })
  const leaveBalances = getRelevantLeaveTypes(employee, employee.leaveBalances || [])
  const annualBalance = leaveBalances.find((balance) => balance.leaveTypeCode === 'annual')
    || leaveBalances.find((balance) => balance.leaveType.toLocaleLowerCase('id-ID').includes('tahunan'))
  const otherBalances = leaveBalances.filter((balance) => balance !== annualBalance && (!leaveTypeFilter || balance.leaveTypeId === leaveTypeFilter))
  const debt = hasDebt({ leaveBalances })
  const critical = debt || isCriticalEmployee({ leaveBalances })
  const initials = getInitials(employee.employeeName)

  function openQuotaEditor(balance) {
    setEditingBalance(balance)
    setRemaining(String(balance.remaining))
    setReason('')
    setSaveError('')
  }

  return (
    <article className={`rounded-2xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${critical ? 'border-l-4 border-l-red-500 border-y-red-100 border-r-red-100' : 'border-slate-200/80'}`}>
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold text-white ring-2 ring-primary-500/20" style={{ background: employee.employeePhoto ? `center / cover no-repeat url("${employee.employeePhoto}")` : 'linear-gradient(135deg, #3b82f6 0%, #6d28d9 100%)' }} aria-label={`Avatar ${employee.employeeName}`}>
          {!employee.employeePhoto && initials}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-semibold text-slate-900" title={employee.employeeName}>{employee.employeeName}</h2>
          {employee.employeeEmail && <p className="mt-0.5 truncate text-xs text-slate-500">{employee.employeeEmail}</p>}
          {debt ? <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-red-100 bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700"><AlertTriangle className="h-3 w-3" />Hutang cuti {Math.abs(Math.min(...leaveBalances.map((balance) => balance.remaining), 0))} hari</span> : critical && <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700"><AlertTriangle className="h-3 w-3" />Sisa cuti menipis</span>}
        </div>
        <div className="shrink-0 text-right">
          <p className={`text-2xl font-bold leading-none ${critical ? 'text-red-600' : 'text-slate-900'}`}>{annualBalance ? annualBalance.remaining : '—'}</p>
          <p className="mt-1 text-[11px] text-slate-500">sisa tahunan</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
        <span>Total hari tidak masuk tahun ini: <strong className="text-slate-900">{employee.totalDaysAbsent || 0} hari</strong></span>
        {!!employee.pendingDoctorCertificateCount && <span className="rounded-full bg-amber-50 px-2.5 py-1 font-semibold text-amber-800">{employee.pendingDoctorCertificateCount} surat dokter menunggu verifikasi</span>}
      </div>

      <div className="mt-5 space-y-2">
        {annualBalance
          ? <BalanceRow balance={annualBalance} highlight onEdit={() => openQuotaEditor(annualBalance)} />
          : <p className="rounded-lg bg-slate-50 px-3 py-2.5 text-sm text-slate-500">Belum ada saldo cuti tahunan.</p>}
        {expanded && otherBalances.map((balance) => (
          <BalanceRow key={balance.leaveTypeId || balance.leaveTypeCode || balance.leaveType} balance={balance} onEdit={() => openQuotaEditor(balance)} />
        ))}
      </div>

      {otherBalances.length > 0 && (
        <button type="button" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary-700 hover:text-primary-900">
          {expanded ? 'Sembunyikan rincian' : `Lihat ${otherBalances.length} jenis cuti lainnya`}
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      )}

      <Modal
        isOpen={Boolean(editingBalance)}
        onClose={() => { if (!updateBalance.isPending) setEditingBalance(null) }}
        title={`Edit Sisa ${editingBalance?.leaveType || ''}`}
        footer={(
          <>
            <button type="button" className="btn-secondary" onClick={() => setEditingBalance(null)} disabled={updateBalance.isPending}>Batal</button>
            <button type="submit" form={`quota-form-${employee.employeeId}`} className="btn-primary" disabled={updateBalance.isPending}>{updateBalance.isPending ? 'Menyimpan...' : 'Simpan Saldo'}</button>
          </>
        )}
      >
        <form id={`quota-form-${employee.employeeId}`} onSubmit={(event) => { event.preventDefault(); setSaveError(''); if (Number(remaining) < 0 && !window.confirm(`Simpan hutang cuti sebesar ${Math.abs(Number(remaining))} hari?`)) return; updateBalance.mutate() }} className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Sisa saldo cuti (hari)
            <input aria-label="Sisa saldo cuti (hari)" type="number" step="1" required value={remaining} onChange={(event) => setRemaining(event.target.value)} className="form-input mt-2" />
          </label>
          <label className="block text-sm font-medium text-slate-700">Alasan koreksi{Number(remaining) < 0 && <span className="text-red-500"> *</span>}<textarea required={Number(remaining) < 0} value={reason} onChange={(event) => setReason(event.target.value)} className="form-input mt-2 min-h-20" placeholder="Wajib diisi jika saldo dibuat minus" /></label>
          <p className="text-xs text-slate-500">Koreksi hanya mengubah saldo akhir; kuota dan jumlah terpakai tetap tercatat terpisah.</p>
          {saveError && <p role="alert" className="text-sm text-red-600">{saveError}</p>}
        </form>
      </Modal>
    </article>
  )
}
