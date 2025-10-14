import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { FaCog, FaLock, FaCamera, FaTrash, FaSave, FaSignOutAlt, FaUser, FaEnvelope, FaCalendarAlt, FaCheckCircle, FaShieldAlt, FaExclamationTriangle, FaBell } from 'react-icons/fa';
import { motion } from 'framer-motion';
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
          const response = await api.delete('/users/me');
          toast.success('Account deleted successfully');
          dispatch(logout());
          navigate('/login');
        } catch (error) {
          console.error('Delete account error:', error);
          const errorMsg = error.response?.data?.details || error.response?.data?.error || 'Failed to delete account';
          toast.error(errorMsg);
        }
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
          <div className="text-center">
            <div className="relative inline-block">
              <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-purple-600"></div>
              <FaCog className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-purple-600 text-2xl animate-pulse" />
            </div>
            <p className="mt-6 text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Loading settings...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 rounded-3xl shadow-2xl p-10 mb-12 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-yellow-300 opacity-10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            
            <div className="relative z-10 flex items-center gap-6">
              <div className="p-5 bg-white/20 backdrop-blur-sm rounded-2xl">
                <FaCog className="text-6xl text-white animate-spin-slow" />
              </div>
              <div>
                <h1 className="text-5xl font-black text-white mb-2">Account Settings</h1>
                <p className="text-pink-100 text-lg">Manage your account preferences and security</p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-8">
            {/* Account Information Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6">
                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                  <FaUser className="text-3xl" />
                  Account Information
                </h2>
              </div>
              
              <div className="p-8 space-y-4">
                <div className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500 rounded-xl">
                      <FaEnvelope className="text-white text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Email Address</p>
                      <p className="text-lg font-bold text-gray-900">{user?.email}</p>
                    </div>
                  </div>
                  <span className="px-4 py-2 bg-green-500 text-white rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                    <FaCheckCircle />
                    Verified
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <FaUser className="text-white" />
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Account Type</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900 ml-11">Job Seeker</p>
                  </div>

                  <div className="p-5 bg-gradient-to-r from-pink-50 to-orange-50 rounded-xl border border-pink-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-pink-500 rounded-lg">
                        <FaCalendarAlt className="text-white" />
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Member Since</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900 ml-11">
                      {user?.created_at && new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Change Password Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6">
                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                  <FaLock className="text-3xl" />
                  Change Password
                </h2>
              </div>
              
              <form onSubmit={handlePasswordChange} className="p-8 space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                    <FaShieldAlt className="text-indigo-600" />
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all text-gray-900 font-medium"
                    placeholder="Enter current password"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                    <FaLock className="text-purple-600" />
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all text-gray-900 font-medium"
                    placeholder="Enter new password"
                    required
                    minLength="6"
                  />
                  <p className="text-sm text-gray-500 mt-2 ml-1">Must be at least 6 characters long</p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                    <FaCheckCircle className="text-green-600" />
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all text-gray-900 font-medium"
                    placeholder="Confirm new password"
                    required
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={saving}
                  className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-black text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                      Updating Password...
                    </>
                  ) : (
                    <>
                      <FaSave className="text-xl" />
                      Update Password
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>

            {/* Face Recognition Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-6">
                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                  <FaCamera className="text-3xl" />
                  Face Recognition Login
                </h2>
              </div>
              
              <div className="p-8">
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border-2 border-pink-200">
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 mb-2 text-lg">Enable Face Recognition</p>
                    <p className="text-sm text-gray-600">
                      Login securely using your face instead of a password
                    </p>
                  </div>
                  <button
                    onClick={toggleFaceRecognition}
                    className={`relative inline-flex h-10 w-20 items-center rounded-full transition-all duration-300 shadow-lg ${
                      faceRecognitionEnabled ? 'bg-gradient-to-r from-pink-500 to-rose-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`flex items-center justify-center h-8 w-8 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                        faceRecognitionEnabled ? 'translate-x-11' : 'translate-x-1'
                      }`}
                    >
                      {faceRecognitionEnabled ? (
                        <FaCheckCircle className="text-pink-500 text-sm" />
                      ) : (
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      )}
                    </span>
                  </button>
                </div>
                
                {faceRecognitionEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl"
                  >
                    <div className="flex items-start gap-3">
                      <FaCheckCircle className="text-green-600 text-xl flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-green-900 font-bold mb-1">Face Recognition Enabled!</p>
                        <p className="text-green-700 text-sm">
                          You can now use face login on the login page for quick and secure access.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Danger Zone Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-xl border-2 border-red-300 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-red-500 to-rose-600 p-6">
                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                  <FaExclamationTriangle className="text-3xl" />
                  Danger Zone
                </h2>
              </div>
              
              <div className="p-8 space-y-4">
                <div className="p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 mb-2 text-lg flex items-center gap-2">
                        <FaSignOutAlt className="text-gray-700" />
                        Logout from Account
                      </p>
                      <p className="text-sm text-gray-600">
                        Sign out from your account on this device
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLogout}
                      className="ml-6 px-8 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 font-bold flex items-center gap-2 shadow-lg transition-all"
                    >
                      <FaSignOutAlt />
                      Logout
                    </motion.button>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border-2 border-red-400">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-bold text-red-900 mb-2 text-lg flex items-center gap-2">
                        <FaTrash className="text-red-600" />
                        Delete Account Permanently
                      </p>
                      <p className="text-sm text-red-700">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDeleteAccount}
                      className="ml-6 px-8 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold flex items-center gap-2 shadow-lg transition-all"
                    >
                      <FaTrash />
                      Delete
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-2xl"
            >
              <div className="text-white">
                <p className="font-bold text-lg mb-1">Need to update your profile information?</p>
                <p className="text-blue-100 text-sm">Manage your personal details, resume, and skills</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/job-seeker/profile')}
                className="px-8 py-4 bg-white text-purple-600 rounded-xl font-black shadow-lg hover:shadow-xl transition-all"
              >
                Go to Profile
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default JobSeekerSettings;
