# Replit 실행/배포 안내

## Replit A: 프론트/백엔드 전체

### 실행 파일
- `.replit`
- `replit.nix`
- `scripts/replit-start.sh`

### 필요한 환경 변수 (Replit Secrets)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL` (예: `https://<replit-backend-url>/api/v1`)
- `NEXT_PUBLIC_NIM_SUMMARY_URL` (Replit B의 공개 URL)

### 실행
- Replit에서 Run 클릭
- 프론트: `http://0.0.0.0:3000`
- 백엔드: `http://0.0.0.0:8000`

## Replit B: NVIDIA NIM 요약 서버

### 위치
- `nim-summary-server/`

### 실행
```bash
cd nim-summary-server
npm install
npm run start
```

### 필요한 환경 변수 (Replit Secrets)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NIM_API_KEY`
- `NIM_BASE_URL` (옵션, 기본값 `https://api.nim.nvidia.com`)
- `NIM_MODEL` (옵션, 기본값 `meta/llama-3.1-8b-instruct`)

### 엔드포인트
- `POST /summarize`
  - body: `{ "session_id": "<debate_session_id>" }`
