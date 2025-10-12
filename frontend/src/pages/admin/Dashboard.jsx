import { useState, useEffect } from 'react';
import { FaUsers, FaBriefcase, FaFileAlt, FaChartLine, FaCheckCircle, FaTimesCircle, FaUserTie, FaBuilding } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import PersonalizedGreeting from '../../components/PersonalizedGreeting';
import ActivityFeed from '../../components/ActivityFeed';
import { LineChartComponent, PieChartComponent } from '../../components/Charts';

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
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, activityRes, analyticsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/recent-activity'),
        api.get('/analytics/admin/stats?period=7d')
      ]);
      setStats(statsRes.data);
      setRecentActivity(activityRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
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
      {/* Personalized Greeting */}
      <PersonalizedGreeting stats={stats} userRole="admin" />

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

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">User Growth (Last 7 Days)</h2>
          {analytics?.userGrowth && analytics.userGrowth.length > 0 ? (
            <LineChartComponent
              data={analytics.userGrowth}
              dataKeys={['count']}
              xAxisKey="date"
              height={250}
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <p>No data available</p>
            </div>
          )}
        </div>

        {/* User Distribution Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">User Distribution</h2>
          {analytics?.userDistribution && analytics.userDistribution.length > 0 ? (
            <PieChartComponent
              data={analytics.userDistribution.map(item => ({
                name: item.role === 'job_seeker' ? 'Job Seekers' : item.role === 'recruiter' ? 'Recruiters' : 'Admins',
                value: item.count
              }))}
              dataKey="value"
              nameKey="name"
              height={250}
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <p>No data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity and Overview */}
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

        {/* Real-time Activity Feed */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Live Activity Feed</h2>
          <ActivityFeed userRole="admin" limit={10} />
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
