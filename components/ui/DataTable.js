'use client'

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table'
import { useState } from 'react'
import {
  ChevronUp, ChevronDown, ChevronsUpDown, Database,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
} from 'lucide-react'

function TableSkeleton({ columns = 5, rows = 5 }) {
  const widths = [40, 58, 72, 48, 63]
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-gray-50">
          {Array.from({ length: columns }).map((_, j) => (
            <td key={j} className="table-td">
              <div
                className="skeleton h-4 rounded-md"
                style={{ width: `${widths[(i + j) % widths.length] + (j * 5) % 18}%` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  )
}

function EmptyRow({ colSpan, message = 'Tidak ada data' }) {
  return (
    <tbody>
      <tr>
        <td colSpan={colSpan} className="px-4 py-16 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center shadow-inner">
              <Database className="w-6 h-6 text-gray-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{message}</p>
              <p className="text-xs text-gray-400 mt-0.5">Belum ada data untuk ditampilkan</p>
            </div>
          </div>
        </td>
      </tr>
    </tbody>
  )
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

function Pagination({ table, total }) {
  const { pageIndex, pageSize } = table.getState().pagination
  const pageCount = table.getPageCount()
  const from = total === 0 ? 0 : pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, total)

  // Build page number buttons (max 5 visible)
  const pages = []
  const delta = 2
  const left = Math.max(0, pageIndex - delta)
  const right = Math.min(pageCount - 1, pageIndex + delta)
  for (let i = left; i <= right; i++) pages.push(i)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 bg-gray-50/50">
      {/* Info + page size */}
      <div className="flex items-center gap-3 text-xs text-gray-500 shrink-0">
        <span className="whitespace-nowrap">
          {total === 0 ? 'Tidak ada data' : `${from}–${to} dari ${total} data`}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="hidden sm:inline whitespace-nowrap">Tampilkan</span>
          <select
            value={pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value))
              table.setPageIndex(0)
            }}
            className="border border-gray-200 rounded-lg px-2 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary-300 cursor-pointer w-14"
          >
            {PAGE_SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <span className="hidden sm:inline whitespace-nowrap">per halaman</span>
        </div>
      </div>

      {/* Page buttons */}
      <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-0.5">
        <button
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
          className="pagination-btn"
          title="Halaman pertama"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="pagination-btn"
          title="Sebelumnya"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {left > 0 && (
          <>
            <button onClick={() => table.setPageIndex(0)} className="pagination-page-btn">1</button>
            {left > 1 && <span className="px-1 text-gray-400 text-xs">…</span>}
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => table.setPageIndex(p)}
            className={`pagination-page-btn ${p === pageIndex ? 'pagination-page-active' : ''}`}
          >
            {p + 1}
          </button>
        ))}

        {right < pageCount - 1 && (
          <>
            {right < pageCount - 2 && <span className="px-1 text-gray-400 text-xs">…</span>}
            <button onClick={() => table.setPageIndex(pageCount - 1)} className="pagination-page-btn">{pageCount}</button>
          </>
        )}

        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="pagination-btn"
          title="Selanjutnya"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => table.setPageIndex(pageCount - 1)}
          disabled={!table.getCanNextPage()}
          className="pagination-btn"
          title="Halaman terakhir"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

export default function DataTable({
  data = [],
  columns = [],
  isLoading = false,
  emptyMessage = 'Tidak ada data',
  skeletonRows = 5,
  pageSize: initialPageSize = 10,
}) {
  const [sorting, setSorting] = useState([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: initialPageSize })

  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination },
    onSortingChange: (updater) => {
      setSorting(updater)
      setPagination((p) => ({ ...p, pageIndex: 0 }))
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="data-table-container">
      <table className="w-full border-collapse">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort()
                const sortDir = header.column.getIsSorted()
                return (
                  <th
                    key={header.id}
                    className={canSort ? 'table-th-sortable group' : 'table-th'}
                    onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                  >
                    <div className="flex items-center gap-1.5">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {canSort && (
                        <span className="transition-all duration-150">
                          {sortDir === 'asc' ? (
                            <ChevronUp className="w-3.5 h-3.5 text-primary-500" />
                          ) : sortDir === 'desc' ? (
                            <ChevronDown className="w-3.5 h-3.5 text-primary-500" />
                          ) : (
                            <ChevronsUpDown className="w-3 h-3 opacity-30 group-hover:opacity-70 transition-opacity" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>

        {isLoading ? (
          <TableSkeleton columns={columns.length} rows={skeletonRows} />
        ) : data.length === 0 ? (
          <EmptyRow colSpan={columns.length} message={emptyMessage} />
        ) : (
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b border-gray-50 table-row-hover">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="table-td">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        )}
      </table>

      {!isLoading && <Pagination table={table} total={data.length} />}
    </div>
  )
}
