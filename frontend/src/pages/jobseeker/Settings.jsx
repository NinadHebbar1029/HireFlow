import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { FaCog, FaLock, FaCamera, FaTrash, FaSave, FaSignOutAlt } from 'react-icons/fa';
import { logout } from '../../redux/slices/authSlice';
import api from '../../utils/api';
import Layout from '../../components/Layout';

const JobSeekerSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [faceRecognitionEnabled, setFaceRecognitionEnabled] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    fetchUserSettings();
  }, []);

  const fetchUserSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/me');
      setUser(response.data);
      setFaceRecognitionEnabled(response.data.face_recognition_enabled || false);
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setSaving(true);
      await api.put('/users/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      toast.success('Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const toggleFaceRecognition = async () => {
    try {
      const newStatus = !faceRecognitionEnabled;
      await api.put('/users/face-recognition', { enabled: newStatus });
      setFaceRecognitionEnabled(newStatus);
      toast.success(`Face recognition ${newStatus ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to update face recognition settings');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will remove all your data including applications, saved jobs, and messages.'
    );
    
    if (confirmed) {
      const doubleConfirm = window.confirm(
        'This is your final warning. Are you absolutely sure you want to permanently delete your account?'
      );
      
      if (doubleConfirm) {
        try {
          await api.delete('/users/me');
          dispatch(logout());
          navigate('/');
          toast.success('Account deleted successfully');
        } catch (error) {
          toast.error('Failed to delete account');
        }
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
              <FaCog className="mr-4 text-primary-600" />
              Account Settings
            </h1>
            <p className="text-gray-600 text-lg">Manage your account preferences and security</p>
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Information</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Email Address</p>
                  <p className="text-lg font-semibold text-gray-900">{user?.email}</p>
                </div>
                <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Verified
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Account Type</p>
                  <p className="text-lg font-semibold text-gray-900">Job Seeker</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {user?.created_at && new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <FaLock className="mr-3 text-primary-600" />
              Change Password
            </h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                  minLength="6"
                />
                <p className="text-sm text-gray-500 mt-1">Must be at least 6 characters long</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 font-semibold flex items-center disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    Update Password
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Face Recognition */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <FaCamera className="mr-3 text-primary-600" />
              Face Recognition Login
            </h2>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="font-semibold text-gray-900 mb-1">Enable Face Recognition</p>
                <p className="text-sm text-gray-600">
                  Login securely using your face instead of a password
                </p>
              </div>
              <button
                onClick={toggleFaceRecognition}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  faceRecognitionEnabled ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    faceRecognitionEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {faceRecognitionEnabled && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">
                  ✓ Face recognition is enabled. You can now use face login on the login page.
                </p>
              </div>
            )}
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-red-200">
            <h2 className="text-2xl font-bold text-red-600 mb-6">Danger Zone</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-1">Logout from all devices</p>
                    <p className="text-sm text-gray-600">
                      Sign out from your account on this device
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="ml-4 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium flex items-center"
                  >
                    <FaSignOutAlt className="mr-2" />
                    Logout
                  </button>
                </div>
              </div>

              <div className="p-4 bg-red-50 rounded-lg border-2 border-red-300">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-red-900 mb-1">Delete Account</p>
                    <p className="text-sm text-red-700">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                  </div>
                  <button
                    onClick={handleDeleteAccount}
                    className="ml-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center"
                  >
                    <FaTrash className="mr-2" />
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl">
            <p className="text-gray-700">
              Need to update your profile information?
            </p>
            <button
              onClick={() => navigate('/job-seeker/profile')}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
            >
              Go to Profile
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default JobSeekerSettings;
