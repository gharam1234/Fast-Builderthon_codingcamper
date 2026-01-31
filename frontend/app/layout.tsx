import type { Metadata } from 'next'
import './globals.css'
import { AppProvider } from '@/components/providers'

export const metadata: Metadata = {
  title: '여울(Yeoul) - AI 세미나 토론 플랫폼',
  description: 'AI 에이전트와 함께하는 실시간 3자 토론 플랫폼',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  )
}
