import appBrand from '@/lib/app-brand'

const { getPageTitle } = appBrand

export const metadata = {
  title: getPageTitle('Login'),
}

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
}
