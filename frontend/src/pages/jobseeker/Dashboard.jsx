import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaBriefcase, FaBookmark, FaClipboardList, FaChartLine, FaBell, FaRocket } from 'react-icons/fa';
import api from '../../utils/api';
import Layout from '../../components/Layout';

const JobSeekerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalApplications: 0,
    savedJobs: 0,
    profileCompletion: 0,
    interviewsScheduled: 0
  });
  const [recommendations, setRecommendations] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch with individual error handling
      let applications = [];
      let savedJobs = [];
      let recommendationsList = [];
      let notificationsList = [];
      
      try {
        const applicationsRes = await api.get('/applications/my-applications');
        applications = applicationsRes.data || [];
        setRecentApplications(applications.slice(0, 5));
      } catch (err) {
        console.log('Applications not available');
      }
      
      try {
        const savedRes = await api.get('/applications/saved/my-saved-jobs');
        savedJobs = savedRes.data || [];
      } catch (err) {
        console.log('Saved jobs not available');
      }
      
      try {
        const recommendationsRes = await api.get('/job-seekers/recommendations');
        recommendationsList = recommendationsRes.data || [];
        setRecommendations(recommendationsList.slice(0, 6));
      } catch (err) {
        console.log('Recommendations not available');
      }
      
      try {
        const notificationsRes = await api.get('/notifications');
        notificationsList = notificationsRes.data || [];
        setNotifications(notificationsList.slice(0, 5));
      } catch (err) {
        console.log('Notifications not available');
      }

      // Calculate stats with available data
      setStats({
        totalApplications: applications.length,
        savedJobs: savedJobs.length,
        profileCompletion: 75, // Calculate based on profile fields
        interviewsScheduled: applications.filter(app => app.status === 'interviewed').length
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      // Don't show error toast - just load with default data
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, onClick }) => (
    <div 
      className={`bg-gradient-to-br ${color} rounded-xl shadow-lg p-6 cursor-pointer transform hover:scale-105 transition-all duration-300`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white text-opacity-90 text-sm font-medium">{title}</p>
          <p className="text-white text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className="bg-white bg-opacity-20 rounded-full p-4">
          <Icon className="text-white text-2xl" />
        </div>
      </div>
    </div>
  );

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back! 👋</h1>
            <p className="text-gray-600 text-lg">Here's what's happening with your job search today.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              icon={FaBriefcase}
              title="Total Applications"
              value={stats.totalApplications}
              color="from-blue-500 to-blue-600"
              onClick={() => navigate('/job-seeker/applications')}
            />
            <StatCard 
              icon={FaBookmark}
              title="Saved Jobs"
              value={stats.savedJobs}
              color="from-purple-500 to-purple-600"
              onClick={() => navigate('/job-seeker/saved-jobs')}
            />
            <StatCard 
              icon={FaChartLine}
              title="Profile Completion"
              value={`${stats.profileCompletion}%`}
              color="from-green-500 to-green-600"
              onClick={() => navigate('/job-seeker/profile')}
            />
            <StatCard 
              icon={FaClipboardList}
              title="Interviews Scheduled"
              value={stats.interviewsScheduled}
              color="from-orange-500 to-orange-600"
              onClick={() => navigate('/job-seeker/applications')}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - 2 columns */}
            <div className="lg:col-span-2 space-y-8">
              {/* AI Recommendations */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
                  <div className="flex items-center">
                    <FaRocket className="text-white text-2xl mr-3" />
                    <h2 className="text-xl font-bold text-white">AI-Powered Job Recommendations</h2>
                  </div>
                </div>
                <div className="p-6">
                  {recommendations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {recommendations.map((job) => (
                        <div 
                          key={job.job_id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer hover:border-primary-500"
                          onClick={() => navigate(`/job-seeker/jobs/${job.job_id}`)}
                        >
                          <h3 className="font-semibold text-gray-900 mb-2">{job.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{job.company_name}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              {job.match_percentage}% Match
                            </span>
                            <span className="text-xs text-gray-500">{job.location}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Complete your profile to get personalized recommendations!</p>
                      <button 
                        onClick={() => navigate('/job-seeker/profile')}
                        className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                      >
                        Complete Profile
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Applications */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Recent Applications</h2>
                </div>
                <div className="p-6">
                  {recentApplications.length > 0 ? (
                    <div className="space-y-4">
                      {recentApplications.map((app) => (
                        <div key={app.application_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{app.job_title}</h3>
                            <p className="text-sm text-gray-600">{app.company_name}</p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              app.status === 'shortlisted' ? 'bg-blue-100 text-blue-800' :
                              app.status === 'interviewed' ? 'bg-purple-100 text-purple-800' :
                              app.status === 'hired' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                            </span>
                            <button 
                              onClick={() => navigate('/job-seeker/applications')}
                              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                            >
                              View →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FaBriefcase className="mx-auto text-gray-300 text-5xl mb-3" />
                      <p className="text-gray-500 mb-4">No applications yet</p>
                      <button 
                        onClick={() => navigate('/job-seeker/jobs')}
                        className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                      >
                        Browse Jobs
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar - 1 column */}
            <div className="space-y-8">
              {/* Notifications */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
                    <FaBell className="text-primary-600" />
                  </div>
                </div>
                <div className="p-4">
                  {notifications.length > 0 ? (
                    <div className="space-y-3">
                      {notifications.map((notif) => (
                        <div key={notif.notification_id} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                          <h4 className="font-semibold text-sm text-gray-900">{notif.title}</h4>
                          <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 text-sm py-4">No new notifications</p>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
                </div>
                <div className="p-4 space-y-2">
                  <button 
                    onClick={() => navigate('/job-seeker/jobs')}
                    className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
                  >
                    🔍 Search Jobs
                  </button>
                  <button 
                    onClick={() => navigate('/job-seeker/profile')}
                    className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                  >
                    👤 Edit Profile
                  </button>
                  <button 
                    onClick={() => navigate('/job-seeker/messages')}
                    className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                  >
                    💬 Messages
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default JobSeekerDashboard;
