import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export default function PageHeader({ title, subtitle, breadcrumb, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        {breadcrumb && (
          <nav className="flex items-center gap-1 text-xs text-gray-500 mb-1">
            {breadcrumb.map((item, idx) => (
              <span key={idx} className="flex items-center gap-1">
                {item.href ? (
                  <Link href={item.href} className="hover:text-primary-600 transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-gray-700 font-medium">{item.label}</span>
                )}
                {idx < breadcrumb.length - 1 && <ChevronRight className="w-3 h-3" />}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  )
}
