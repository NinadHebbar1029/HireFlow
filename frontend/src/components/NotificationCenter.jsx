import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaCheckCircle, FaTimes, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';
import api from '../utils/api';
import { useSocket } from '../contexts/SocketContext';
import { toast } from 'react-toastify';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { socket } = useSocket();

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    // Poll for updates every minute
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Listen for real-time notifications
  useEffect(() => {
    if (socket) {
      socket.on('new-notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show toast notification
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
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/unread/count');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/all/read');
      setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
      case 'application_accepted':
      case 'hired':
        return <FaCheckCircle className="text-green-500" />;
      case 'warning':
      case 'account_status_update':
        return <FaExclamationCircle className="text-yellow-500" />;
      case 'error':
      case 'application_rejected':
        return <FaTimes className="text-red-500" />;
      default:
        return <FaInfoCircle className="text-blue-500" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <FaBell className="text-2xl" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            ></div>

            {/* Dropdown Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl z-50 border border-gray-200 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-3 flex items-center justify-between">
                <h3 className="text-white font-semibold text-lg">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-white text-sm hover:underline focus:outline-none"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-4 space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse flex items-start gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : notifications.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                          !notification.is_read ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => !notification.is_read && markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-gray-500">
                                {formatTimestamp(notification.created_at)}
                              </span>
                              {!notification.is_read && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <FaBell className="mx-auto text-gray-300 text-4xl mb-2" />
                    <p className="text-gray-500">No notifications yet</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="bg-gray-50 px-4 py-3 text-center border-t border-gray-200">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      // Navigate to notifications page if exists
                    }}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    View all notifications
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;
