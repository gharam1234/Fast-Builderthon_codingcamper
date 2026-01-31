# Task 2.1: 강의 시청 화면 (Scene 1)

## 목표
패스트캠퍼스 스타일의 모바일 강의 시청 화면 구현

---

## 프롬프트

```
패스트캠퍼스 스타일의 모바일 강의 시청 화면을 구현해줘.

디자인 요구사항:
1. 다크 모드 기본 (배경: #0a1628)
2. 상단: 비디오 플레이어 (16:9)
   - 재생/일시정지 버튼
   - 프로그레스 바 (청록 그라디언트)
   - 현재시간/전체시간 표시
   - 챕터 표시 뱃지
3. 하단: 커리큘럼 스크롤 리스트
   - 완료/진행중/미시청 상태 표시
   - 현재 챕터 하이라이트 (cyan 테두리)
4. FAB (Floating Action Button):
   - 위치: 우측 하단 (bottom-6 right-6)
   - 스타일: cyan-blue 그라디언트, 글로우 효과
   - 아이콘: 물결 SVG + "AI 토론" 텍스트
   - 애니메이션: float (위아래 움직임) + pulse-glow

컴포넌트 분리:
- VideoPlayer.tsx (비디오 플레이어)
- CurriculumList.tsx (커리큘럼)
- DebateFAB.tsx (플로팅 버튼)
- LecturePage.tsx (페이지 조합)

인터랙션:
- FAB 클릭 시 onStartDebate() 콜백 호출
- 스크롤 시 FAB 살짝 숨김 처리 (선택)
```

---

## 디자인 참고

### 색상 팔레트
| 용도 | 색상 |
|------|------|
| 배경 | `#0a1628` |
| 카드 배경 | `rgba(13, 31, 60, 0.7)` |
| 메인 강조 | `#00d4ff` (cyan) |
| 보조 강조 | `#0066ff` (blue) |
| 완료 상태 | `#2ed573` (green) |
| 텍스트 | `#ffffff` / `rgba(255,255,255,0.6)` |

### FAB 스타일
```css
.fab {
  background: linear-gradient(135deg, #00d4ff, #0066ff);
  box-shadow: 
    0 0 20px rgba(0, 212, 255, 0.5),
    0 0 40px rgba(0, 102, 255, 0.3);
  animation: float 3s ease-in-out infinite;
}
```

## 예상 결과물

- `/components/lecture/VideoPlayer.tsx`
- `/components/lecture/CurriculumList.tsx`
- `/components/ui/DebateFAB.tsx`
- `/app/lecture/[id]/page.tsx`

## 예상 시간
약 1시간
