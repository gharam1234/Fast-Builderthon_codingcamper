import dynamic from 'next/dynamic'

// 페이지 전체를 클라이언트 전용으로 로드
const BattleContent = dynamic(
  () => import('@/components/pages/BattleContent'),
  { ssr: false }
)

export default function BattlePage() {
  return <BattleContent />
}
