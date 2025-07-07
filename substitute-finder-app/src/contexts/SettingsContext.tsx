import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface AppSettings {
  notifications: {
    desktop: boolean
    inApp: boolean
    requestCreated: boolean
    requestFilled: boolean
    requestCancelled: boolean
    autoMarkRead: boolean
    soundEnabled: boolean
  }

  system: {
    autoRefreshInterval: number
    defaultTimeRange: '30d' | '90d' | '1y'
    timezone: string
    dateFormat: 'MM/dd/yyyy' | 'dd/MM/yyyy' | 'yyyy-MM-dd'
    timeFormat: '12h' | '24h'
  }

  export: {
    defaultFormat: 'csv' | 'excel'
    includeTimestamps: boolean
    includeSummary: boolean
    maxRows: number
  }

  ui: {
    theme: 'light' | 'dark' | 'system'
    compactMode: boolean
    showHelpTips: boolean
    defaultPage: string
  }

  security: {
    sessionTimeout: number
    requirePasswordChange: boolean
    passwordChangeInterval: number
    enableAuditLog: boolean
  }
}

const defaultSettings: AppSettings = {
  notifications: {
    desktop: true,
    inApp: true,
    requestCreated: true,
    requestFilled: true,
    requestCancelled: false,
    autoMarkRead: false,
    soundEnabled: true,
  },
  system: {
    autoRefreshInterval: 5,
    defaultTimeRange: '30d',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12h',
  },
  export: {
    defaultFormat: 'csv',
    includeTimestamps: true,
    includeSummary: true,
    maxRows: 10000,
  },
  ui: {
    theme: 'system',
    compactMode: false,
    showHelpTips: true,
    defaultPage: 'dashboard',
  },
  security: {
    sessionTimeout: 480,
    requirePasswordChange: false,
    passwordChangeInterval: 90,
    enableAuditLog: true,
  },
}

interface SettingsContextType {
  settings: AppSettings
  updateSettings: (newSettings: Partial<AppSettings>) => void
  updateSetting: (section: keyof AppSettings, key: string, value: any) => void
  resetSettings: () => void
  saveSettings: () => Promise<void>
  loadSettings: () => Promise<void>
  isLoading: boolean
}

const SettingsContext = createContext<SettingsContextType | null>(null)

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

interface SettingsProviderProps {
  children: ReactNode
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async (): Promise<void> => {
    try {
      setIsLoading(true)
      const savedSettings = localStorage.getItem('app-settings')
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...defaultSettings, ...parsed })
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async (): Promise<void> => {
    try {
      setIsLoading(true)
      localStorage.setItem('app-settings', JSON.stringify(settings))
    } catch (error) {
      console.error('Failed to save settings:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  const updateSetting = (section: keyof AppSettings, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }))
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        updateSetting,
        resetSettings,
        saveSettings,
        loadSettings,
        isLoading,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}
