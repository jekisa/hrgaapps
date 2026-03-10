'use client'

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table'
import { useState } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, Database } from 'lucide-react'

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
    </div>
  )
}
