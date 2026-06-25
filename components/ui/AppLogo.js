import { useId } from 'react'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AppLogo({
  className,
  markClassName,
  showWordmark = false,
  wordmarkClassName,
  subtitleClassName,
  sparkle = false,
}) {
  const gradientId = useId().replace(/:/g, '')
  const bgId = `hrga-logo-bg-${gradientId}`
  const accentId = `hrga-logo-accent-${gradientId}`

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <svg
        viewBox="0 0 64 64"
        aria-hidden="true"
        className={cn('w-10 h-10 shrink-0 drop-shadow-md', markClassName)}
      >
        <defs>
          <linearGradient id={bgId} x1="9" y1="7" x2="55" y2="59" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38bdf8" />
            <stop offset="0.46" stopColor="#2563eb" />
            <stop offset="1" stopColor="#4f46e5" />
          </linearGradient>
          <linearGradient id={accentId} x1="17" y1="20" x2="49" y2="47" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffffff" />
            <stop offset="1" stopColor="#dbeafe" />
          </linearGradient>
        </defs>

        <rect x="4" y="4" width="56" height="56" rx="15" fill={`url(#${bgId})`} />
        <path
          d="M14 22.5L32 13l18 9.5"
          fill="none"
          stroke="rgba(255,255,255,0.72)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M19 45V24M31.5 45V24M19 34.5h12.5"
          fill="none"
          stroke={`url(#${accentId})`}
          strokeWidth="5.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M46.5 26.5A12 12 0 1 0 47 42.2v-8.1h-8.2"
          fill="none"
          stroke="white"
          strokeWidth="5.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M48.5 16.5l2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4Z" fill="#bfdbfe" opacity="0.95" />
        <path d="M9 47c13-1 25 1.5 45-18" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="7" strokeLinecap="round" />
        <rect x="4" y="4" width="56" height="56" rx="15" fill="none" stroke="rgba(255,255,255,0.22)" />
      </svg>

      {showWordmark && (
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <p className={cn('font-bold leading-none tracking-wide', wordmarkClassName)}>HRGA Apps</p>
            {sparkle && <Sparkles className="w-3 h-3 text-primary-400 animate-pulse-slow" />}
          </div>
          <p className={cn('text-[10px] mt-0.5 tracking-wider uppercase', subtitleClassName)}>Management System</p>
        </div>
      )}
    </div>
  )
}
