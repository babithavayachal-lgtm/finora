import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import { Category, AlertSetting } from '../lib/types';

interface AlertSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AlertSettingsModal({ isOpen, onClose }: AlertSettingsModalProps) {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [alertSettings, setAlertSettings] = useState<AlertSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAlert, setNewAlert] = useState({
    alert_type: 'category_threshold' as 'category_threshold' | 'total_budget_threshold' | 'monthly_completion',
    category_id: '',
    threshold_percentage: 80,
  });

  useEffect(() => {
    if (isOpen && user) {
      fetchData();
    }
  }, [isOpen, user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const [categoriesRes, settingsRes] = await Promise.all([
        supabase.from('categories').select('*').eq('user_id', user.id).order('name'),
        supabase.from('alert_settings').select('*').eq('user_id', user.id),
      ]);

      if (categoriesRes.data) setCategories(categoriesRes.data);
      
      // Handle case where alert_settings table doesn't exist yet
      if (settingsRes.error && (settingsRes.error.code === 'PGRST204' || settingsRes.error.message?.includes('alert_settings'))) {
        console.warn('alert_settings table not found. Please run the migration.');
        setAlertSettings([]);
      } else if (settingsRes.data) {
        setAlertSettings(settingsRes.data as AlertSetting[]);
      }
    } catch (error) {
      console.error('Error fetching alert settings:', error);
      setAlertSettings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAlert = async () => {
    if (!user) return;

    // Validate
    if (newAlert.alert_type === 'category_threshold' && !newAlert.category_id) {
      alert('Please select a category');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('alert_settings').insert({
        user_id: user.id,
        alert_type: newAlert.alert_type,
        category_id: newAlert.alert_type === 'category_threshold' ? newAlert.category_id : null,
        threshold_percentage: newAlert.threshold_percentage,
        is_enabled: true,
      });

      if (error) {
        if (error.code === 'PGRST204' || error.message?.includes('alert_settings')) {
          alert('Alert settings table not found. Please run the database migration first.');
        } else {
          throw error;
        }
        return;
      }

      await fetchData();
      setShowAddForm(false);
      setNewAlert({
        alert_type: 'category_threshold',
        category_id: '',
        threshold_percentage: 80,
      });
    } catch (error) {
      console.error('Error adding alert:', error);
      alert('Failed to add alert setting');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAlert = async (id: string) => {
    if (!confirm('Are you sure you want to delete this alert?')) return;

    try {
      const { error } = await supabase.from('alert_settings').delete().eq('id', id);
      if (error) throw error;
      await fetchData();
    } catch (error) {
      console.error('Error deleting alert:', error);
      alert('Failed to delete alert');
    }
  };

  const handleToggleEnabled = async (setting: AlertSetting) => {
    try {
      const { error } = await supabase
        .from('alert_settings')
        .update({ is_enabled: !setting.is_enabled })
        .eq('id', setting.id);

      if (error) throw error;
      await fetchData();
    } catch (error) {
      console.error('Error toggling alert:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div
        className={`relative z-10 w-full max-w-2xl mx-4 max-h-[90vh] rounded-2xl shadow-xl flex flex-col ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Alert Settings
          </h2>
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

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Custom Alerts
                </h3>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Alert
                </button>
              </div>

              {showAddForm && (
                <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="space-y-3">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        Alert Type
                      </label>
                      <select
                        value={newAlert.alert_type}
                        onChange={(e) =>
                          setNewAlert({
                            ...newAlert,
                            alert_type: e.target.value as any,
                            category_id: '',
                          })
                        }
                        className={`w-full px-3 py-2 rounded-lg border text-sm ${
                          isDarkMode
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="category_threshold">Category Budget Threshold</option>
                        <option value="total_budget_threshold">Total Budget Threshold</option>
                        <option value="monthly_completion">Monthly Budget Completion</option>
                      </select>
                    </div>

                    {newAlert.alert_type === 'category_threshold' && (
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          Category
                        </label>
                        <select
                          value={newAlert.category_id}
                          onChange={(e) => setNewAlert({ ...newAlert, category_id: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border text-sm ${
                            isDarkMode
                              ? 'bg-gray-600 border-gray-500 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        >
                          <option value="">Select a category</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        Threshold Percentage
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={newAlert.threshold_percentage}
                        onChange={(e) =>
                          setNewAlert({ ...newAlert, threshold_percentage: parseFloat(e.target.value) || 0 })
                        }
                        className={`w-full px-3 py-2 rounded-lg border text-sm ${
                          isDarkMode
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleAddAlert}
                        disabled={saving}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {saving ? 'Adding...' : 'Add Alert'}
                      </button>
                      <button
                        onClick={() => {
                          setShowAddForm(false);
                          setNewAlert({
                            alert_type: 'category_threshold',
                            category_id: '',
                            threshold_percentage: 80,
                          });
                        }}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          isDarkMode
                            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {alertSettings.length === 0 ? (
                  <p className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No alert settings configured. Click "Add Alert" to create one.
                  </p>
                ) : (
                  alertSettings.map((setting) => {
                    const category = setting.category_id
                      ? categories.find((c) => c.id === setting.category_id)
                      : null;

                    return (
                      <div
                        key={setting.id}
                        className={`p-4 rounded-lg border flex items-center justify-between ${
                          isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {setting.alert_type === 'category_threshold'
                                ? `Category: ${category?.name || 'Unknown'}`
                                : setting.alert_type === 'total_budget_threshold'
                                  ? 'Total Budget'
                                  : 'Monthly Completion'}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-xs ${
                                setting.is_enabled
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {setting.is_enabled ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Alert at {setting.threshold_percentage}%
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleEnabled(setting)}
                            className={`px-3 py-1 text-xs rounded transition-colors ${
                              setting.is_enabled
                                ? isDarkMode
                                  ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                : isDarkMode
                                  ? 'bg-green-600 text-white hover:bg-green-700'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {setting.is_enabled ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            onClick={() => handleDeleteAlert(setting.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

