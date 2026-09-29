import Image from 'next/image'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import appBrand from '@/lib/app-brand'

const { APP_NAME, APP_LOGO_SRC } = appBrand

export default function AppLogo({
  className,
  markClassName,
  showWordmark = false,
  wordmarkClassName,
  subtitleClassName,
  sparkle = false,
}) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span className={cn('relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1 shadow-md', markClassName)}>
        <Image src={APP_LOGO_SRC} alt="" aria-hidden="true" width={96} height={100} priority className="h-full w-full rounded-lg object-contain" />
      </span>

      {showWordmark && (
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <p className={cn('font-bold leading-none tracking-wide', wordmarkClassName)}>{APP_NAME}</p>
            {sparkle && <Sparkles className="w-3 h-3 text-primary-400 animate-pulse-slow" />}
          </div>
          <p className={cn('text-[10px] mt-0.5 tracking-wider uppercase', subtitleClassName)}>Management System</p>
        </div>
      )}
    </div>
  )
}
