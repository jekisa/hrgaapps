import { PackageSearch } from 'lucide-react'

export default function EmptyState({ icon: Icon = PackageSearch, title = 'Tidak ada data', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="icon-tile w-16 h-16 mb-4 bg-gradient-to-br from-primary-50 to-cyan-50 text-primary-500 ring-1 ring-primary-100">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-gray-600 font-medium">{title}</h3>
      {description && <p className="text-gray-400 text-sm mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
