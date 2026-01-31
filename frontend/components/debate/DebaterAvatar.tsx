import { motion } from 'framer-motion'

interface DebaterAvatarProps {
  name: 'james' | 'linda'
  isActive?: boolean
  isSpeaking?: boolean
  score?: number
}

export default function DebaterAvatar({ name, isActive, isSpeaking, score }: DebaterAvatarProps) {
  const isJames = name === 'james'
  
  const avatarStyles = isJames
    ? 'bg-james-red/20 border-james-red'
    : 'bg-linda-green/20 border-linda-green'
  
  const glowStyles = isJames
    ? 'shadow-[0_0_30px_rgba(255,71,87,0.5)]'
    : 'shadow-[0_0_30px_rgba(46,213,115,0.5)]'

  return (
    <motion.div
      animate={{
        scale: isSpeaking ? [1, 1.05, 1] : 1,
      }}
      transition={{
        duration: 0.5,
        repeat: isSpeaking ? Infinity : 0,
      }}
      className="text-center"
    >
      <div
        className={`
          relative w-24 h-24 mx-auto rounded-full border-2 
          flex items-center justify-center transition-all duration-300
          ${avatarStyles}
          ${isActive || isSpeaking ? glowStyles : ''}
        `}
      >
        <span className="text-4xl">{isJames ? '🧔' : '👩'}</span>
        
        {/* Speaking indicator */}
        {isSpeaking && (
          <motion.div
            className={`absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-medium ${
              isJames ? 'bg-james-red text-white' : 'bg-linda-green text-white'
            }`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            발언 중
          </motion.div>
        )}
      </div>
      
      <h3 className={`mt-3 font-bold text-lg ${isJames ? 'text-james-red' : 'text-linda-green'}`}>
        {isJames ? 'James' : 'Linda'}
      </h3>
      
      <p className="text-sm text-white/60">
        {isJames ? '찬성 측' : '반대 측'}
      </p>
      
      {score !== undefined && (
        <div className="mt-2">
          <div className="text-sm text-white/40 mb-1">점수</div>
          <div className={`text-xl font-bold ${isJames ? 'text-james-red' : 'text-linda-green'}`}>
            {score}
          </div>
        </div>
      )}
    </motion.div>
  )
}
