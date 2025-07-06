import React, { useState, useEffect } from 'react';
import { Settings, Bell, Download, Database, User, Shield, Save, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useSettings } from '../../contexts/SettingsContext';

interface AppSettings {
  // Notification Settings
  notifications: {
    desktop: boolean;
    inApp: boolean;
    requestCreated: boolean;
    requestFilled: boolean;
    requestCancelled: boolean;
    autoMarkRead: boolean;
    soundEnabled: boolean;
  };
  
  // System Settings
  system: {
    autoRefreshInterval: number; // minutes
    defaultTimeRange: '30d' | '90d' | '1y';
    timezone: string;
    dateFormat: 'MM/dd/yyyy' | 'dd/MM/yyyy' | 'yyyy-MM-dd';
    timeFormat: '12h' | '24h';
  };
  
  // Export Settings
  export: {
    defaultFormat: 'csv' | 'excel';
    includeTimestamps: boolean;
    includeSummary: boolean;
    maxRows: number;
  };
  
  // UI Settings
  ui: {
    theme: 'light' | 'dark' | 'system';
    compactMode: boolean;
    showHelpTips: boolean;
    defaultPage: string;
  };
  
  // Security Settings
  security: {
    sessionTimeout: number; // minutes
    requirePasswordChange: boolean;
    passwordChangeInterval: number; // days
    enableAuditLog: boolean;
  };
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
    sessionTimeout: 480, // 8 hours
    requirePasswordChange: false,
    passwordChangeInterval: 90,
    enableAuditLog: true,
  },
};

export function SettingsPage() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const { 
    settings, 
    updateSetting, 
    resetSettings: contextResetSettings, 
    saveSettings: contextSaveSettings, 
    isLoading: loading 
  } = useSettings();
  const [hasChanges, setHasChanges] = useState(false);

  const saveSettings = async () => {
    try {
      await contextSaveSettings();
      setHasChanges(false);
      
      addNotification({
        title: 'Settings Saved',
        body: 'Your settings have been saved successfully',
        notification_type: 'success'
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      addNotification({
        title: 'Save Error',
        body: 'Failed to save settings',
        notification_type: 'error'
      });
    }
  };

  const resetSettings = () => {
    contextResetSettings();
    setHasChanges(true);
    addNotification({
      title: 'Settings Reset',
      body: 'Settings have been reset to defaults',
      notification_type: 'info'
    });
  };

  const handleUpdateSetting = (section: keyof AppSettings, key: string, value: any) => {
    updateSetting(section, key, value);
    setHasChanges(true);
  };

  const testNotification = async () => {
    addNotification({
      title: 'Test Notification',
      body: 'This is a test notification to verify your settings',
      notification_type: 'info'
    });
  };

  if (loading && !hasChanges) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold">Settings</h2>
          <p className="text-muted-foreground">
            Configure application preferences and behavior
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={resetSettings}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          
          <Button 
            onClick={saveSettings} 
            disabled={!hasChanges || loading}
            className={hasChanges ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            <Save className="w-4 h-4 mr-2" />
            {hasChanges ? 'Save Changes' : 'Saved'}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Configure how and when you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.notifications.desktop}
                    onChange={(e) => handleUpdateSetting('notifications', 'desktop', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Desktop Notifications</span>
                </label>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.notifications.inApp}
                    onChange={(e) => handleUpdateSetting('notifications', 'inApp', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">In-App Notifications</span>
                </label>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.notifications.soundEnabled}
                    onChange={(e) => handleUpdateSetting('notifications', 'soundEnabled', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Sound Notifications</span>
                </label>
              </div>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.notifications.requestCreated}
                    onChange={(e) => handleUpdateSetting('notifications', 'requestCreated', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">New Request Created</span>
                </label>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.notifications.requestFilled}
                    onChange={(e) => handleUpdateSetting('notifications', 'requestFilled', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Request Filled</span>
                </label>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.notifications.autoMarkRead}
                    onChange={(e) => handleUpdateSetting('notifications', 'autoMarkRead', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Auto-mark as Read</span>
                </label>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <Button variant="outline" onClick={testNotification}>
                Test Notification
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              System Settings
            </CardTitle>
            <CardDescription>
              Configure system behavior and defaults
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Auto Refresh Interval</label>
                  <select
                    value={settings.system.autoRefreshInterval}
                    onChange={(e) => handleUpdateSetting('system', 'autoRefreshInterval', parseInt(e.target.value))}
                    className="w-full p-2 border border-border rounded-md"
                  >
                    <option value={1}>1 minute</option>
                    <option value={5}>5 minutes</option>
                    <option value={10}>10 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={0}>Never</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Default Time Range</label>
                  <select
                    value={settings.system.defaultTimeRange}
                    onChange={(e) => handleUpdateSetting('system', 'defaultTimeRange', e.target.value)}
                    className="w-full p-2 border border-border rounded-md"
                  >
                    <option value="30d">30 Days</option>
                    <option value="90d">90 Days</option>
                    <option value="1y">1 Year</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Date Format</label>
                  <select
                    value={settings.system.dateFormat}
                    onChange={(e) => handleUpdateSetting('system', 'dateFormat', e.target.value)}
                    className="w-full p-2 border border-border rounded-md"
                  >
                    <option value="MM/dd/yyyy">MM/DD/YYYY (US)</option>
                    <option value="dd/MM/yyyy">DD/MM/YYYY (EU)</option>
                    <option value="yyyy-MM-dd">YYYY-MM-DD (ISO)</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Time Format</label>
                  <select
                    value={settings.system.timeFormat}
                    onChange={(e) => handleUpdateSetting('system', 'timeFormat', e.target.value)}
                    className="w-full p-2 border border-border rounded-md"
                  >
                    <option value="12h">12 Hour (AM/PM)</option>
                    <option value="24h">24 Hour</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Timezone</label>
                  <Input
                    value={settings.system.timezone}
                    onChange={(e) => handleUpdateSetting('system', 'timezone', e.target.value)}
                    placeholder="America/New_York"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export Settings
            </CardTitle>
            <CardDescription>
              Configure default export behavior and formats
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Default Format</label>
                  <select
                    value={settings.export.defaultFormat}
                    onChange={(e) => handleUpdateSetting('export', 'defaultFormat', e.target.value)}
                    className="w-full p-2 border border-border rounded-md"
                  >
                    <option value="csv">CSV</option>
                    <option value="excel">Excel</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Maximum Rows</label>
                  <Input
                    type="number"
                    value={settings.export.maxRows}
                    onChange={(e) => handleUpdateSetting('export', 'maxRows', parseInt(e.target.value))}
                    min={100}
                    max={100000}
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.export.includeTimestamps}
                    onChange={(e) => handleUpdateSetting('export', 'includeTimestamps', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Include Timestamps in Filenames</span>
                </label>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.export.includeSummary}
                    onChange={(e) => handleUpdateSetting('export', 'includeSummary', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Include Summary in Reports</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* UI Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              User Interface
            </CardTitle>
            <CardDescription>
              Customize the application appearance and behavior
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Theme</label>
                  <select
                    value={settings.ui.theme}
                    onChange={(e) => handleUpdateSetting('ui', 'theme', e.target.value)}
                    className="w-full p-2 border border-border rounded-md"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Default Page</label>
                  <select
                    value={settings.ui.defaultPage}
                    onChange={(e) => handleUpdateSetting('ui', 'defaultPage', e.target.value)}
                    className="w-full p-2 border border-border rounded-md"
                  >
                    <option value="dashboard">Dashboard</option>
                    <option value="analytics">Analytics</option>
                    <option value="requests">Requests</option>
                    <option value="users">Users</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.ui.compactMode}
                    onChange={(e) => handleUpdateSetting('ui', 'compactMode', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Compact Mode</span>
                </label>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.ui.showHelpTips}
                    onChange={(e) => handleUpdateSetting('ui', 'showHelpTips', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Show Help Tips</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings - Admin Only */}
        {user?.role === 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure security and access control settings (Admin only)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Session Timeout (minutes)</label>
                    <Input
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => handleUpdateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                      min={30}
                      max={1440}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Password Change Interval (days)</label>
                    <Input
                      type="number"
                      value={settings.security.passwordChangeInterval}
                      onChange={(e) => handleUpdateSetting('security', 'passwordChangeInterval', parseInt(e.target.value))}
                      min={30}
                      max={365}
                      disabled={!settings.security.requirePasswordChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.security.requirePasswordChange}
                      onChange={(e) => handleUpdateSetting('security', 'requirePasswordChange', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Require Periodic Password Changes</span>
                  </label>
                  
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.security.enableAuditLog}
                      onChange={(e) => handleUpdateSetting('security', 'enableAuditLog', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Enable Audit Logging</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Database Settings - Admin Only */}
        {user?.role === 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Database Settings
              </CardTitle>
              <CardDescription>
                Database maintenance and backup settings (Admin only)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Database settings would be available here in a production environment.
                This might include backup scheduling, cleanup policies, and maintenance windows.
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button variant="outline" disabled>
                  Backup Database
                </Button>
                <Button variant="outline" disabled>
                  Cleanup Old Data
                </Button>
                <Button variant="outline" disabled>
                  Export Database
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Save Reminder */}
      {hasChanges && (
        <div className="fixed bottom-4 right-4 bg-orange-100 border border-orange-300 text-orange-800 px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">You have unsaved changes</span>
            <Button size="sm" onClick={saveSettings}>
              Save Now
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}