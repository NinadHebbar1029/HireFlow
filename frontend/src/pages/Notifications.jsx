import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBell, 
  FaCheckCircle, 
  FaTimes, 
  FaExclamationCircle, 
  FaInfoCircle, 
  FaBriefcase, 
  FaUserCheck, 
  FaEnvelope,
  FaTrash,
  FaFilter,
  FaCheckDouble,
  FaCircle
} from 'react-icons/fa';
import api from '../utils/api';
import { useSocket } from '../contexts/SocketContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [typeFilter, setTypeFilter] = useState('all');
  const { socket } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [notifications, filter, typeFilter]);

  // Listen for real-time notifications
  useEffect(() => {
    if (socket) {
      socket.on('new-notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        toast.info(notification.title, {
          position: 'top-right',
          autoClose: 5000,
        });
      });

      return () => {
        socket.off('new-notification');
      };
    }
  }, [socket]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...notifications];

    // Apply read/unread filter
    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.is_read);
    } else if (filter === 'read') {
      filtered = filtered.filter(n => n.is_read);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(n => n.type === typeFilter);
    }

    setFilteredNotifications(filtered);
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast.error('Failed to update notification');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/all/read');
      setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to update notifications');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const deleteAllRead = async () => {
    try {
      await api.delete('/notifications/read');
      setNotifications(prev => prev.filter(n => !n.is_read));
      toast.success('All read notifications deleted');
    } catch (error) {
      console.error('Failed to delete notifications:', error);
      toast.error('Failed to delete notifications');
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
      case 'application_accepted':
      case 'hired':
        return <FaCheckCircle className="text-2xl" />;
      case 'warning':
      case 'account_status_update':
        return <FaExclamationCircle className="text-2xl" />;
      case 'error':
      case 'application_rejected':
        return <FaTimes className="text-2xl" />;
      case 'new_application':
        return <FaBriefcase className="text-2xl" />;
      case 'message':
        return <FaEnvelope className="text-2xl" />;
      default:
        return <FaInfoCircle className="text-2xl" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
      case 'application_accepted':
      case 'hired':
        return 'from-green-500 to-emerald-600';
      case 'warning':
      case 'account_status_update':
        return 'from-yellow-500 to-orange-600';
      case 'error':
      case 'application_rejected':
        return 'from-red-500 to-red-600';
      case 'new_application':
        return 'from-blue-500 to-blue-600';
      case 'message':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.is_read).length,
    read: notifications.filter(n => n.is_read).length,
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col justify-center items-center h-screen">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <FaBell className="text-6xl text-primary-600 mb-4" />
          </motion.div>
          <p className="text-gray-600 text-lg font-semibold">Loading notifications...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Section with Gradient */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden group">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 bg-cyan-300 opacity-5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                  <FaBell className="text-3xl" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black">
                  Notifications
                </h1>
              </div>
              <p className="text-lg text-white text-opacity-90 ml-1">
                Stay updated with all your activities
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <div className="group relative bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 group-hover:text-white transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:bg-white group-hover:bg-opacity-20">
                  <FaBell className="text-2xl text-white" />
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-600 group-hover:text-white group-hover:text-opacity-90">Total Notifications</p>
              <p className="text-4xl font-black mt-1">{stats.total}</p>
            </div>
          </div>

          <div className="group relative bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 group-hover:text-white transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg group-hover:bg-white group-hover:bg-opacity-20">
                  <FaCircle className="text-2xl text-white" />
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-600 group-hover:text-white group-hover:text-opacity-90">Unread</p>
              <p className="text-4xl font-black mt-1">{stats.unread}</p>
            </div>
          </div>

          <div className="group relative bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 group-hover:text-white transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg group-hover:bg-white group-hover:bg-opacity-20">
                  <FaCheckDouble className="text-2xl text-white" />
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-600 group-hover:text-white group-hover:text-opacity-90">Read</p>
              <p className="text-4xl font-black mt-1">{stats.read}</p>
            </div>
          </div>
        </motion.div>

        {/* Filters and Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-wrap gap-2">
              <FaFilter className="text-gray-500 text-xl mt-2" />
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                  filter === 'unread'
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                  filter === 'read'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Read
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {stats.unread > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105 font-semibold"
                >
                  <FaCheckDouble /> Mark All Read
                </button>
              )}
              {stats.read > 0 && (
                <button
                  onClick={deleteAllRead}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105 font-semibold"
                >
                  <FaTrash /> Clear Read
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl shadow-xl p-16 text-center"
          >
            <div className="inline-block p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-6">
              <FaBell className="text-6xl text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-3">No notifications found</h3>
            <p className="text-gray-600 text-lg">
              {filter === 'unread' ? "You're all caught up! 🎉" : "Try adjusting your filters"}
            </p>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <AnimatePresence>
              {filteredNotifications.map((notification, index) => (
                <motion.div 
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all border-l-4 ${
                    !notification.is_read 
                      ? 'border-l-orange-500 bg-gradient-to-r from-orange-50 to-white' 
                      : 'border-l-gray-300'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-14 h-14 bg-gradient-to-br ${getNotificationColor(notification.type)} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {notification.title}
                          </h3>
                          {!notification.is_read && (
                            <span className="flex-shrink-0 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></span>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-3 leading-relaxed">
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <span className="text-sm text-gray-500 font-medium flex items-center gap-2">
                            <FaBell className="text-xs" />
                            {formatTimestamp(notification.created_at)}
                          </span>

                          <div className="flex gap-2">
                            {notification.link && (
                              <button
                                onClick={() => handleNotificationClick(notification)}
                                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105 text-sm font-semibold"
                              >
                                View Details
                              </button>
                            )}
                            {!notification.is_read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105 text-sm font-semibold"
                              >
                                <FaCheckCircle className="inline mr-1" /> Mark Read
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105 text-sm font-semibold"
                            >
                              <FaTrash className="inline" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default Notifications;
