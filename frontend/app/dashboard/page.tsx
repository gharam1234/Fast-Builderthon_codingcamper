import dynamic from 'next/dynamic'

// 페이지 전체를 클라이언트 전용으로 로드
const DashboardContent = dynamic(
  () => import('@/components/pages/DashboardContent'),
  { ssr: false }
)

export default function DashboardPage() {
  return <DashboardContent />
}
