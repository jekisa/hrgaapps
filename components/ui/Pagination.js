'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const pages = []
  const maxVisible = 5
  let start = Math.max(1, page - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages, start + maxVisible - 1)
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1)

  for (let i = start; i <= end; i++) pages.push(i)

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {start > 1 && (
        <>
          <PageBtn num={1} current={page} onClick={onPageChange} />
          {start > 2 && <span className="px-1 text-gray-400">...</span>}
        </>
      )}

      {pages.map((p) => (
        <PageBtn key={p} num={p} current={page} onClick={onPageChange} />
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-gray-400">...</span>}
          <PageBtn num={totalPages} current={page} onClick={onPageChange} />
        </>
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}

function PageBtn({ num, current, onClick }) {
  return (
    <button
      onClick={() => onClick(num)}
      className={cn(
        'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
        num === current
          ? 'bg-primary-600 text-white'
          : 'hover:bg-gray-100 text-gray-700'
      )}
    >
      {num}
    </button>
  )
}
