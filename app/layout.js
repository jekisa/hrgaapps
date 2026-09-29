import './globals.css'
import { Toaster } from 'react-hot-toast'
import SessionProviderWrapper from '@/components/providers/SessionProvider'
import QueryProvider from '@/components/providers/QueryProvider'
import appBrand from '@/lib/app-brand'

const { APP_NAME } = appBrand

export const metadata = {
  title: APP_NAME,
  description: `${APP_NAME} - Human Resources & General Affairs Management System`,
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <SessionProviderWrapper>
          <QueryProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1e293b',
                color: '#f8fafc',
                fontSize: '14px',
              },
              success: {
                iconTheme: { primary: '#22c55e', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#fff' },
              },
            }}
          />
          </QueryProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  )
}
