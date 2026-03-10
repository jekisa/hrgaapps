import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

export default function PageHeader({ title, subtitle, breadcrumb, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
      <div className="min-w-0">
        {breadcrumb && (
          <nav className="flex items-center gap-1 text-xs text-gray-400 mb-2 flex-wrap">
            <Home className="w-3 h-3 shrink-0" />
            {breadcrumb.map((item, idx) => (
              <span key={idx} className="flex items-center gap-1">
                <ChevronRight className="w-3 h-3 text-gray-300" />
                {item.href ? (
                  <Link
                    href={item.href}
                    className="hover:text-primary-600 transition-colors duration-150 hover:underline underline-offset-2"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-gray-600 font-medium">{item.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-xl font-extrabold text-gray-900 leading-tight tracking-tight truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-gray-400 mt-0.5 leading-relaxed">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-wrap shrink-0">{actions}</div>
      )}
    </div>
  )
}
