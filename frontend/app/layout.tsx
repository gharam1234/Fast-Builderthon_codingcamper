import '@/styles/globals.css';
import type { Metadata } from 'next';
import { AppProvider } from '@/components/providers';

export const metadata: Metadata = {
  title: '여울 - AI 세미나 토론 플랫폼',
  description: 'AI 기반 세미나 토론과 학습을 위한 플랫폼',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}