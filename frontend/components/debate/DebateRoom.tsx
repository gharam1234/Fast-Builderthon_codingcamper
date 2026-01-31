import { motion } from 'framer-motion'

interface DebateRoomProps {
  lectureId?: string
  onClose: () => void
}

export default function DebateRoom({ onClose }: DebateRoomProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-yeoul-navy/90 backdrop-blur-md"
    >
      <div className="glass-card w-full max-w-6xl h-[90vh] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold gradient-text">AI 토론방</h2>
          <button
            onClick={onClose}
            className="glass-button px-4 py-2 rounded-lg text-white/70 hover:text-white"
          >
            닫기
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-6 h-[calc(100%-80px)]">
          {/* James 영역 */}
          <div className="debater-james rounded-xl p-4">
            <div className="text-center mb-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-james-red/20 flex items-center justify-center">
                <span className="text-3xl">🔴</span>
              </div>
              <h3 className="mt-2 font-bold text-james-red">James</h3>
              <p className="text-sm text-white/60">찬성 측</p>
            </div>
          </div>
          
          {/* 중앙 채팅 영역 */}
          <div className="glass rounded-xl p-4 flex flex-col">
            <div className="flex-1 overflow-y-auto">
              {/* 채팅 메시지들이 여기에 표시됩니다 */}
              <p className="text-center text-white/40 py-8">
                토론을 시작하려면 주제를 선택하세요
              </p>
            </div>
            
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="의견을 입력하세요..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/40 focus:outline-none focus:border-yeoul-cyan/50"
              />
              <button className="bg-yeoul-cyan text-yeoul-navy px-6 py-2 rounded-lg font-medium hover:bg-yeoul-cyan/90 transition-colors">
                전송
              </button>
            </div>
          </div>
          
          {/* Linda 영역 */}
          <div className="debater-linda rounded-xl p-4">
            <div className="text-center mb-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-linda-green/20 flex items-center justify-center">
                <span className="text-3xl">🟢</span>
              </div>
              <h3 className="mt-2 font-bold text-linda-green">Linda</h3>
              <p className="text-sm text-white/60">반대 측</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
