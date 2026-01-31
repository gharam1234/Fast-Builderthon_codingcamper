import '@/styles/globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/components/providers/AuthProvider'; // 👈 1. 임포트 추가

export const metadata: Metadata = {
  title: '여울 - AI 세미나 토론 플랫폼',
  description: 'AI 기반 세미나 토론과 학습을 위한 플랫폼',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        {/* 👈 2. 앱 전체를 AuthProvider로 감싸기 */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}