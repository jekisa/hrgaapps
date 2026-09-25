'use client'

import { useRef, useState } from 'react'
import { addMonths, format, isSameDay, parse, subMonths } from 'date-fns'
import { id } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { getCalendarDays } from '@/lib/staff-date-picker'

export default function StaffDatePicker({ id: inputId, label, value, onChange, error }) {
  const initial = value ? parse(value, 'yyyy-MM-dd', new Date()) : new Date()
  const [month, setMonth] = useState(new Date(initial.getFullYear(), initial.getMonth(), 1))
  const [open, setOpen] = useState(false)
  const dialogRef = useRef(null)
  const days = getCalendarDays(month.getFullYear(), month.getMonth())
  const choose = (date) => { onChange(format(date, 'yyyy-MM-dd')); setMonth(new Date(date.getFullYear(), date.getMonth(), 1)); setOpen(false) }
  const toggle = () => { if (!open && value) { const date = parse(value, 'yyyy-MM-dd', new Date()); setMonth(new Date(date.getFullYear(), date.getMonth(), 1)) } setOpen(!open) }
  const onKeyDown = (event, date) => {
    const moves = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }
    if (moves[event.key]) { event.preventDefault(); const next = new Date(date); next.setDate(date.getDate() + moves[event.key]); setMonth(new Date(next.getFullYear(), next.getMonth(), 1)); requestAnimationFrame(() => dialogRef.current?.querySelector(`[data-date="${format(next, 'yyyy-MM-dd')}"]`)?.focus()) }
    if (event.key === 'Escape') setOpen(false)
  }
  return <div className="relative"><label className="form-label" htmlFor={`${inputId}-trigger`}>{label} <span className="text-red-500">*</span></label><button id={`${inputId}-trigger`} type="button" className="staff-date-trigger form-input flex items-center justify-between text-left" aria-haspopup="dialog" aria-expanded={open} aria-describedby={error ? `${inputId}-error` : undefined} onClick={toggle}>{value ? format(parse(value, 'yyyy-MM-dd', new Date()), 'd MMMM yyyy', { locale: id }) : 'Pilih tanggal'}<CalendarDays className="h-4 w-4 text-slate-400" /></button>{error && <p id={`${inputId}-error`} className="mt-1 text-xs text-red-500">{error}</p>}{open && <div ref={dialogRef} role="dialog" aria-label={`Pilih ${label.toLowerCase()}`} className="absolute z-30 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-xl" onKeyDown={(event) => onKeyDown(event, event.target.dataset.date ? parse(event.target.dataset.date, 'yyyy-MM-dd', new Date()) : new Date(month.getFullYear(), month.getMonth(), 1))}><div className="mb-3 flex items-center justify-between"><button type="button" aria-label="Bulan sebelumnya" onClick={() => setMonth(subMonths(month, 1))}><ChevronLeft /></button><strong>{format(month, 'MMMM yyyy', { locale: id })}</strong><button type="button" aria-label="Bulan berikutnya" onClick={() => setMonth(addMonths(month, 1))}><ChevronRight /></button></div><div className="grid grid-cols-7 gap-1 text-center text-xs">{['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day) => <span key={day} className="py-1 font-semibold text-slate-500">{day}</span>)}{days.map(({ date, inCurrentMonth }) => <button key={date.toISOString()} type="button" data-date={format(date, 'yyyy-MM-dd')} aria-label={format(date, 'd MMMM yyyy', { locale: id })} aria-pressed={Boolean(value && isSameDay(parse(value, 'yyyy-MM-dd', new Date()), date))} onClick={() => choose(date)} className={`h-8 rounded-full text-xs hover:bg-rose-50 ${!inCurrentMonth ? 'text-slate-300' : 'text-slate-700'} ${value && isSameDay(parse(value, 'yyyy-MM-dd', new Date()), date) ? 'staff-date-selected' : ''}`}>{date.getDate()}</button>)}</div></div>}</div>
}
