import { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle, Settings, RefreshCw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { generateAlerts } from '../lib/alerts';
import { GeneratedAlert } from '../lib/types';
import { AlertSettingsModal } from './AlertSettingsModal';

interface AlertsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAlertsLoaded?: (count: number) => void;
}

export function AlertsPanel({ isOpen, onClose, onAlertsLoaded }: AlertsPanelProps) {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const { currency } = useCurrency();
  const [alerts, setAlerts] = useState<GeneratedAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen && user) {
      fetchAlerts();
    }
  }, [isOpen, user, currency]);

  const fetchAlerts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const generatedAlerts = await generateAlerts(user.id, currency);
      // Deduplicate per alert_setting_id + title to avoid repeating the same alert
      const unique = new Map<string, GeneratedAlert>();
      generatedAlerts.forEach((a) => {
        const key = `${a.alert_setting_id || a.id}-${a.title}`;
        if (!unique.has(key)) unique.set(key, a);
      });
      const filtered = Array.from(unique.values()).filter((a) => !dismissedIds.has(a.alert_setting_id || a.id));
      setAlerts(filtered);
      onAlertsLoaded?.(filtered.length);
    } catch (error: any) {
      console.error('Error fetching alerts:', error);
      // If alert_settings table doesn't exist yet, just show empty alerts
      if (error?.code === 'PGRST204' || error?.message?.includes('alert_settings')) {
        setAlerts([]);
        onAlertsLoaded?.(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (type: GeneratedAlert['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getAlertBgColor = (type: GeneratedAlert['type']) => {
    switch (type) {
      case 'success':
        return isDarkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200';
      case 'error':
        return isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200';
      case 'warning':
        return isDarkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200';
      case 'info':
        return isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      return `${Math.floor(hours / 24)}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return 'Just now';
    }
  };

  const removeAlert = (id: string, settingId?: string) => {
    const key = settingId || id;
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
    setAlerts((prev) => {
      const next = prev.filter((alert) => (alert.alert_setting_id || alert.id) !== key);
      onAlertsLoaded?.(next.length);
      return next;
    });
  };

  const handleRefresh = () => {
    fetchAlerts();
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50" />
      </div>
      <div
        className={`fixed right-0 top-0 h-full w-80 max-w-[90vw] z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-2xl flex flex-col`}
      >
        <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Alerts
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              title="Alert Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              } disabled:opacity-50`}
              title="Refresh"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : alerts.length === 0 ? (
            <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No alerts</p>
              <p className="text-sm mt-2">Configure alerts in settings to get notified about your budget</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${getAlertBgColor(alert.type)}`}
              >
                <div className="flex items-start gap-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {alert.title}
                      </h3>
                      <button
                        onClick={() => removeAlert(alert.id, alert.alert_setting_id)}
                        className={`p-1 rounded transition-colors ${
                          isDarkMode
                            ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {alert.message}
                    </p>
                    <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {formatTime(alert.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <AlertSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}

