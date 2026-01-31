'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X } from 'lucide-react'
import { useState } from 'react'

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

  return (
    <div className="relative">
      <motion.button
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

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50"
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-96 bg-slate-900 border border-gray-600 rounded-xl shadow-2xl z-[60]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-600">
                <h3 className="text-white font-semibold text-lg">알림</h3>
                {notifications.length > 0 && (
                  <button
                    onClick={handleClear}
                    className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                  >
                    모두 삭제
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto bg-slate-900/50">
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
      </AnimatePresence>
    </div>
  )
}
