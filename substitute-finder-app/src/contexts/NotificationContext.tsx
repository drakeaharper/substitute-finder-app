import type React from 'react'
import { createContext, useContext, useState, useEffect } from 'react'
import { listen } from '@tauri-apps/api/event'
import { notificationApi } from '../lib/api'

interface NotificationData {
  id: string
  title: string
  body: string
  request_id?: string
  user_id?: string
  notification_type: string
  timestamp: Date
}

interface InAppNotification extends NotificationData {
  read: boolean
  actions?: NotificationAction[]
}

interface NotificationAction {
  label: string
  action: () => void
  variant?: 'default' | 'destructive'
}

interface NotificationContextType {
  notifications: InAppNotification[]
  unreadCount: number
  addNotification: (notification: Omit<InAppNotification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotification: (id: string) => void
  clearAllNotifications: () => void
  sendNotification: (
    title: string,
    body: string,
    requestId?: string,
    userId?: string
  ) => Promise<void>
  requestPermission: () => Promise<boolean>
}

const NotificationContext = createContext<NotificationContextType | null>(null)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: React.ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<InAppNotification[]>([])

  useEffect(() => {
    // Request notification permission on mount
    requestPermission()

    // Listen for notifications from Tauri
    const unlisten = listen('notification', (event) => {
      const data = event.payload as NotificationData
      addNotification({
        ...data,
        notification_type: data.notification_type || 'info',
      })
    })

    return () => {
      unlisten.then((fn) => fn())
    }
  }, [])

  const addNotification = (notification: Omit<InAppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: InAppNotification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
    }

    setNotifications((prev) => [newNotification, ...prev].slice(0, 50)) // Keep only latest 50
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const sendNotification = async (
    title: string,
    body: string,
    requestId?: string,
    userId?: string
  ) => {
    try {
      await notificationApi.send(title, body, requestId, userId)
    } catch (error) {
      console.error('Failed to send notification:', error)
      // Add an error notification to the in-app system
      addNotification({
        title: 'Notification Error',
        body: 'Failed to send notification',
        notification_type: 'error',
      })
    }
  }

  const requestPermission = async (): Promise<boolean> => {
    try {
      const granted = await notificationApi.requestPermission()
      return granted
    } catch (error) {
      console.error('Failed to request notification permission:', error)
      return false
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAllNotifications,
        sendNotification,
        requestPermission,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
