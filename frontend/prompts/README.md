# 🌊 Project Yeoul - 구현 프롬프트 가이드

## 폴더 구조

```
prompts/
├── phase-1-foundation/
│   ├── task-1.1-frontend-setup.md
│   ├── task-1.2-backend-setup.md
│   └── task-1.3-supabase-schema.md
├── phase-2-interface/
│   ├── task-2.1-lecture-screen.md
│   ├── task-2.2-loading-overlay.md
│   └── task-2.3-debate-room.md
├── phase-3-core-features/
│   ├── task-3.1-ai-debate-engine.md
│   ├── task-3.2-voice-recognition.md
│   ├── task-3.3-voice-synthesis.md
│   └── task-3.4-audio-visualizer.md
├── phase-4-data/
│   ├── task-4.1-supabase-auth.md
│   ├── task-4.2-debate-history.md
│   └── task-4.3-token-system.md
└── phase-5-deployment/
    ├── task-5.1-api-integration.md
    ├── task-5.2-vercel-deploy.md
    └── task-5.3-replit-deploy.md
```

## 🚀 권장 구현 순서

| 순서 | 태스크 | 파일 | 예상 시간 |
|------|--------|------|----------|
| 1 | Frontend Setup | `phase-1-foundation/task-1.1-frontend-setup.md` | 1시간 |
| 2 | Backend Setup | `phase-1-foundation/task-1.2-backend-setup.md` | 1시간 |
| 3 | Supabase Schema | `phase-1-foundation/task-1.3-supabase-schema.md` | 30분 |
| 4 | Lecture Screen | `phase-2-interface/task-2.1-lecture-screen.md` | 1시간 |
| 5 | Loading Overlay | `phase-2-interface/task-2.2-loading-overlay.md` | 1시간 |
| 6 | Debate Room | `phase-2-interface/task-2.3-debate-room.md` | 1시간 |
| 7 | AI Engine | `phase-3-core-features/task-3.1-ai-debate-engine.md` | 2시간 |
| 8 | Voice Recognition | `phase-3-core-features/task-3.2-voice-recognition.md` | 1시간 |
| 9 | Voice Synthesis | `phase-3-core-features/task-3.3-voice-synthesis.md` | 1시간 |
| 10 | Audio Visualizer | `phase-3-core-features/task-3.4-audio-visualizer.md` | 1시간 |
| 11 | Supabase Auth | `phase-4-data/task-4.1-supabase-auth.md` | 1시간 |
| 12 | Debate History | `phase-4-data/task-4.2-debate-history.md` | 30분 |
| 13 | Token System | `phase-4-data/task-4.3-token-system.md` | 30분 |
| 14 | API Integration | `phase-5-deployment/task-5.1-api-integration.md` | 1시간 |
| 15 | Vercel Deploy | `phase-5-deployment/task-5.2-vercel-deploy.md` | 30분 |
| 16 | Replit Deploy | `phase-5-deployment/task-5.3-replit-deploy.md` | 30분 |

**총 예상 시간: 약 14시간**

## 📊 태스크 의존성

```
[1.1 Frontend] ───┬──→ [2.1] → [2.2] → [2.3]
                  └──→ [3.2] → [3.4]

[1.2 Backend] ────┬──→ [3.1] ──→ [5.1]
                  └──→ [3.3] ──↗

[1.3 Supabase] ───┬──→ [4.1] → [4.2] → [4.3]
                  └──→ [5.1]

[5.1 Integration] ──→ [5.2] + [5.3]
```

## 사용 방법

1. 각 프롬프트 파일을 열어 내용을 복사
2. AI 코딩 어시스턴트에 붙여넣기
3. 생성된 코드를 프로젝트에 적용
4. 다음 태스크로 이동

---
**Team codingcamper | 패스트캠퍼스 AI 해커톤**
