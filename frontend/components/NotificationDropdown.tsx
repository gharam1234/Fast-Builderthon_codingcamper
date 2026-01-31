'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface Notification {
  id: number
  title: string
  message: string
  timestamp: Date
  read: boolean
  type: 'course' | 'system' | 'achievement'
}

const mockNotifications: Notification[] = [
  {
    id: 1,
    title: 'React 강의 시작',
    message: '추천 강의 "React 완벽 마스터"가 오픈되었습니다!',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
    type: 'course',
  },
  {
    id: 2,
    title: '토론 완료',
    message: '"AI의 미래"에 대한 토론이 완료되었습니다.',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    read: false,
    type: 'achievement',
  },
  {
    id: 3,
    title: '시스템 공지',
    message: 'Yeoul 서비스가 새로워졌습니다. 새로운 기능을 확인하세요!',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    read: true,
    type: 'system',
  },
]

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [mounted, setMounted] = useState(false)
  const [panelPos, setPanelPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const panelWidth = 420

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const handleClear = () => {
    setNotifications([])
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'course':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
      case 'achievement':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'system':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    return `${days}일 전`
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const updatePosition = () => {
      const rect = buttonRef.current?.getBoundingClientRect()
      if (!rect) return
      const top = rect.bottom + 8
      const left = Math.min(
        Math.max(12, rect.right - panelWidth),
        window.innerWidth - panelWidth - 12
      )
      setPanelPos({ top, left })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition)
    }
  }, [isOpen])

  return (
    <div className="relative">
      <motion.button
        ref={buttonRef}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-white/10 rounded-xl transition-colors relative"
      >
        <Bell className="text-gray-300" size={22} />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"
          />
        )}
      </motion.button>

      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.98 }}
                style={{ top: panelPos.top, left: panelPos.left, width: panelWidth }}
                className="fixed z-[9999] max-w-[90vw] bg-slate-900 border border-gray-600 rounded-2xl shadow-2xl"
              >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-600">
                <h3 className="text-white font-semibold text-lg">알림</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label="알림 닫기"
                >
                  <X className="text-gray-300" size={18} />
                </button>
              </div>
              
              {notifications.length > 0 && (
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700/60">
                  <span className="text-xs text-gray-400">
                    읽지 않음 {unreadCount}개
                  </span>
                  <button
                    onClick={handleClear}
                    className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                  >
                    모두 삭제
                  </button>
              </div>
              )}

              {/* Notifications List */}
              <div className="max-h-[60vh] overflow-y-auto bg-slate-900/50">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-300">
                    알림이 없습니다
                  </div>
                ) : (
                  <div className="divide-y divide-gray-700/50">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        onClick={() => handleMarkAsRead(notification.id)}
                        className={`p-4 cursor-pointer transition-colors ${
                          notification.read
                            ? 'bg-transparent hover:bg-white/10'
                            : 'bg-cyan-500/20 hover:bg-cyan-500/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-white font-semibold text-sm">
                                {notification.title}
                              </h4>
                              <span
                                className={`text-xs px-2 py-1 rounded border font-medium ${getTypeColor(
                                  notification.type
                                )}`}
                              >
                                {notification.type === 'course'
                                  ? '강의'
                                  : notification.type === 'achievement'
                                    ? '성취'
                                    : '공지'}
                              </span>
                            </div>
                            <p className="text-gray-200 text-sm line-clamp-2 mb-1">
                              {notification.message}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {formatTime(notification.timestamp)}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-4 border-t border-gray-600 text-center bg-slate-950/50">
                  <button className="text-sm text-cyan-300 hover:text-cyan-200 transition-colors font-semibold">
                    모든 알림 보기
                  </button>
                </div>
              )}
            </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}
