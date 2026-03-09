'use client'

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table'
import { useState } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

function TableSkeleton({ columns = 5, rows = 5 }) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-gray-50">
          {Array.from({ length: columns }).map((_, j) => (
            <td key={j} className="table-td">
              <div className="skeleton h-4 rounded" style={{ width: `${60 + Math.random() * 30}%` }} />
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
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">{message}</p>
          </div>
        </td>
      </tr>
    </tbody>
  )
}

export default function DataTable({
  data = [],
  columns = [],
  isLoading = false,
  emptyMessage = 'Tidak ada data',
  skeletonRows = 5,
}) {
  const [sorting, setSorting] = useState([])

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
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
                    className={canSort ? 'table-th-sortable' : 'table-th'}
                    onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                  >
                    <div className="flex items-center gap-1.5">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {canSort && (
                        <span className="text-gray-400">
                          {sortDir === 'asc' ? (
                            <ChevronUp className="w-3.5 h-3.5 text-primary-500" />
                          ) : sortDir === 'desc' ? (
                            <ChevronDown className="w-3.5 h-3.5 text-primary-500" />
                          ) : (
                            <ChevronsUpDown className="w-3 h-3 opacity-40" />
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
    </div>
  )
}
