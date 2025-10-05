import { useState, useEffect } from 'react';
import { FaUser, FaLock, FaBell, FaSignOutAlt, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import api from '../../utils/api';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    applicationAlerts: true,
    messageAlerts: true
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/users/me');
      setUser(response.data);
      setNotifications({
        emailNotifications: response.data.email_notifications ?? true,
        applicationAlerts: response.data.application_alerts ?? true,
        messageAlerts: response.data.message_alerts ?? true
      });
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await api.put('/users/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error('Failed to update password');
    }
  };

  const handleNotificationToggle = async (key) => {
    try {
      const updatedNotifications = { ...notifications, [key]: !notifications[key] };
      await api.put('/users/notifications', updatedNotifications);
      setNotifications(updatedNotifications);
      toast.success('Notification settings updated!');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    toast.success('Logged out successfully!');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    try {
      await api.delete('/users/account');
      dispatch(logout());
      navigate('/');
      toast.success('Account deleted successfully');
    } catch (error) {
      toast.error('Failed to delete account');
    }
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
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="space-y-6">
        {/* Account Information */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <FaUser className="text-primary-600" /> Account Information
          </h2>
          <div className="space-y-3 text-gray-700">
            <div>
              <span className="font-semibold">Email:</span> {user?.email}
            </div>
            <div>
              <span className="font-semibold">Account Type:</span> Recruiter
            </div>
            <div>
              <span className="font-semibold">Member Since:</span> {new Date(user?.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <FaLock className="text-primary-600" /> Change Password
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button
              onClick={handlePasswordChange}
              className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
            >
              Update Password
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <FaBell className="text-primary-600" /> Notification Preferences
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Email Notifications</h3>
                <p className="text-sm text-gray-600">Receive email updates about your account</p>
              </div>
              <button
                onClick={() => handleNotificationToggle('emailNotifications')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.emailNotifications ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Application Alerts</h3>
                <p className="text-sm text-gray-600">Get notified about new applications</p>
              </div>
              <button
                onClick={() => handleNotificationToggle('applicationAlerts')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.applicationAlerts ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.applicationAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Message Alerts</h3>
                <p className="text-sm text-gray-600">Get notified about new messages</p>
              </div>
              <button
                onClick={() => handleNotificationToggle('messageAlerts')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.messageAlerts ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.messageAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border-2 border-red-200 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-red-700">
            <FaExclamationTriangle /> Danger Zone
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Logout</h3>
                <p className="text-sm text-gray-600">Sign out of your account</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-all"
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-red-300">
              <div>
                <h3 className="font-semibold text-gray-900">Delete Account</h3>
                <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-all"
              >
                <FaTrash /> Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-red-600 mb-4">⚠️ Delete Account</h3>
            <p className="text-gray-700 mb-4">
              This action cannot be undone. All your data, including jobs, applications, and messages will be permanently deleted.
            </p>
            <p className="text-gray-700 mb-6">
              Type <strong>DELETE</strong> to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg mb-6 focus:ring-2 focus:ring-red-500"
              placeholder="Type DELETE"
            />
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmation !== 'DELETE'}
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete My Account
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
