import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaBriefcase, FaFileAlt, FaCheckCircle, FaEnvelope, FaClock } from 'react-icons/fa';
import api from '../utils/api';
import { useSocket } from '../contexts/SocketContext';

const ActivityFeed = ({ userRole = 'admin', limit = 15, className = '' }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  useEffect(() => {
    fetchActivities();
    
    // Set up polling for real-time updates (every 30 seconds)
    const interval = setInterval(fetchActivities, 30000);
    
    return () => clearInterval(interval);
  }, [userRole, limit]);

  // Listen for socket events
  useEffect(() => {
    if (socket) {
      socket.on('new-activity', (activity) => {
        setActivities(prev => [activity, ...prev].slice(0, limit));
      });

      return () => {
        socket.off('new-activity');
      };
    }
  }, [socket, limit]);

  const fetchActivities = async () => {
    try {
      const endpoint = `/activity/${userRole === 'admin' ? 'admin' : userRole === 'job_seeker' ? 'job-seeker' : 'recruiter'}`;
      const response = await api.get(endpoint, { params: { limit } });
      setActivities(response.data);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_registered':
        return <FaUser className="text-blue-500" />;
      case 'job_posted':
      case 'new_job_match':
        return <FaBriefcase className="text-green-500" />;
      case 'application_submitted':
      case 'new_application':
      case 'application_status_changed':
        return <FaFileAlt className="text-purple-500" />;
      case 'message_received':
        return <FaEnvelope className="text-orange-500" />;
      case 'job_view':
        return <FaClock className="text-teal-500" />;
      default:
        return <FaCheckCircle className="text-gray-500" />;
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'hired':
      case 'matched':
        return 'bg-green-100 text-green-800';
      case 'shortlisted':
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'interviewed':
        return 'bg-purple-100 text-purple-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <AnimatePresence>
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <motion.div
              key={`${activity.type}-${activity.entity_id}-${index}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 font-medium truncate">
                  {activity.entity_name}
                </p>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {activity.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(activity.timestamp)}
                  </span>
                  {activity.status && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8">
            <FaClock className="mx-auto text-gray-300 text-4xl mb-2" />
            <p className="text-gray-500">No recent activity</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActivityFeed;
