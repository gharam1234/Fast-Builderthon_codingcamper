import dynamic from 'next/dynamic'

// 페이지 전체를 클라이언트 전용으로 로드
const DebateContent = dynamic(
  () => import('@/components/pages/DebateContent'),
  { ssr: false }
)

export default function DebatePage() {
  return <DebateContent />
}
