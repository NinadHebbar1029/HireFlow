import { useState, useEffect } from 'react';
import { FaCog, FaSave, FaBell, FaDatabase, FaShieldAlt, FaEnvelope, FaGlobe, FaRobot } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import AIServiceStatus from '../../components/AIServiceStatus';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    siteName: 'HireFlow',
    siteDescription: 'Professional Job Portal',
    contactEmail: 'admin@hireflow.com',
    maxFileSize: 5,
    allowRegistration: true,
    requireEmailVerification: true,
    enableNotifications: true,
    maintenanceMode: false
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/admin/settings');
      setSettings(response.data);
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await api.put('/admin/settings', settings);
      toast.success('Settings updated successfully!');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-2">Configure platform-wide settings</p>
        </div>
        <button
          onClick={handleSaveSettings}
          className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
        >
          <FaSave /> Save Changes
        </button>
      </div>

      <div className="space-y-6">
        {/* AI Service Status */}
        <AIServiceStatus />

        {/* General Settings */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <FaGlobe className="text-primary-600" /> General Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                rows="3"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* File Upload Settings */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <FaDatabase className="text-primary-600" /> File Upload Settings
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum File Size (MB)
            </label>
            <input
              type="number"
              value={settings.maxFileSize}
              onChange={(e) => setSettings({ ...settings, maxFileSize: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              min="1"
              max="50"
            />
            <p className="text-sm text-gray-500 mt-2">Maximum allowed file size for uploads (resumes, logos, etc.)</p>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <FaShieldAlt className="text-primary-600" /> Security Settings
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Allow User Registration</h3>
                <p className="text-sm text-gray-600">Allow new users to register on the platform</p>
              </div>
              <button
                onClick={() => handleToggle('allowRegistration')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.allowRegistration ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.allowRegistration ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Require Email Verification</h3>
                <p className="text-sm text-gray-600">Users must verify email before accessing platform</p>
              </div>
              <button
                onClick={() => handleToggle('requireEmailVerification')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.requireEmailVerification ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.requireEmailVerification ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <FaBell className="text-primary-600" /> Notification Settings
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Enable System Notifications</h3>
              <p className="text-sm text-gray-600">Send email notifications for system events</p>
            </div>
            <button
              onClick={() => handleToggle('enableNotifications')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.enableNotifications ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.enableNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Maintenance Mode */}
        <div className="bg-red-50 border-2 border-red-200 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-red-700">
            <FaCog className="text-red-600" /> Maintenance Mode
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Enable Maintenance Mode</h3>
              <p className="text-sm text-gray-600">Temporarily disable public access to the platform</p>
            </div>
            <button
              onClick={() => handleToggle('maintenanceMode')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.maintenanceMode ? 'bg-red-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          {settings.maintenanceMode && (
            <div className="mt-4 p-4 bg-red-100 rounded-lg">
              <p className="text-red-800 font-semibold">⚠️ Platform is currently in maintenance mode</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
