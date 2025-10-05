import { useState, useEffect } from 'react';
import { FaUsers, FaBriefcase, FaFileAlt, FaChartLine, FaCheckCircle, FaTimesCircle, FaUserTie, FaBuilding } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalApplications: 0,
    activeJobs: 0,
    jobSeekers: 0,
    recruiters: 0,
    pendingApplications: 0,
    hiredCount: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/recent-activity')
      ]);
      setStats(statsRes.data);
      setRecentActivity(activityRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, gradient, textColor }) => (
    <div className={`bg-gradient-to-br ${gradient} rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">{title}</p>
          <p className="text-4xl font-bold mt-2">{value}</p>
        </div>
        <Icon className="text-5xl opacity-80" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to the HireFlow administration panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={FaUsers}
          gradient="from-blue-600 to-blue-700"
        />
        <StatCard
          title="Job Seekers"
          value={stats.jobSeekers}
          icon={FaUserTie}
          gradient="from-green-600 to-green-700"
        />
        <StatCard
          title="Recruiters"
          value={stats.recruiters}
          icon={FaBuilding}
          gradient="from-purple-600 to-purple-700"
        />
        <StatCard
          title="Total Jobs"
          value={stats.totalJobs}
          icon={FaBriefcase}
          gradient="from-orange-600 to-orange-700"
        />
        <StatCard
          title="Active Jobs"
          value={stats.activeJobs}
          icon={FaCheckCircle}
          gradient="from-teal-600 to-teal-700"
        />
        <StatCard
          title="Applications"
          value={stats.totalApplications}
          icon={FaFileAlt}
          gradient="from-indigo-600 to-indigo-700"
        />
        <StatCard
          title="Pending Apps"
          value={stats.pendingApplications}
          icon={FaChartLine}
          gradient="from-yellow-600 to-yellow-700"
        />
        <StatCard
          title="Hired"
          value={stats.hiredCount}
          icon={FaCheckCircle}
          gradient="from-pink-600 to-pink-700"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">System Overview</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
              <span className="font-semibold text-gray-700">User Growth Rate</span>
              <span className="text-2xl font-bold text-blue-600">+12%</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <span className="font-semibold text-gray-700">Job Posting Rate</span>
              <span className="text-2xl font-bold text-green-600">+8%</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
              <span className="font-semibold text-gray-700">Application Rate</span>
              <span className="text-2xl font-bold text-purple-600">+15%</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
              <span className="font-semibold text-gray-700">Success Rate</span>
              <span className="text-2xl font-bold text-orange-600">67%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No recent activity</p>
            ) : (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{activity.description}</p>
                    <p className="text-sm text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-xl hover:bg-blue-700 transition-all">
            <FaUsers /> Manage Users
          </button>
          <button className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-4 rounded-xl hover:bg-green-700 transition-all">
            <FaBriefcase /> Manage Jobs
          </button>
          <button className="flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-4 rounded-xl hover:bg-purple-700 transition-all">
            <FaFileAlt /> Applications
          </button>
          <button className="flex items-center justify-center gap-2 bg-orange-600 text-white px-6 py-4 rounded-xl hover:bg-orange-700 transition-all">
            <FaChartLine /> Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
