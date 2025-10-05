import { useState, useEffect } from 'react';
import { FaChartLine, FaUsers, FaBriefcase, FaFileAlt, FaArrowUp, FaArrowDown, FaCalendar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    userGrowth: [],
    jobPosting: [],
    applications: [],
    successRate: 0,
    avgTimeToHire: 0,
    topJobs: [],
    topRecruiters: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/admin/analytics');
      setAnalytics(response.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({ title, value, change, icon: Icon, gradient }) => (
    <div className={`bg-gradient-to-br ${gradient} rounded-xl shadow-lg p-6 text-white`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold opacity-90">{title}</h3>
        <Icon className="text-3xl opacity-80" />
      </div>
      <p className="text-4xl font-bold mb-2">{value}</p>
      {change && (
        <div className="flex items-center gap-2 text-sm">
          {change > 0 ? (
            <><FaArrowUp /> <span>+{change}% from last month</span></>
          ) : (
            <><FaArrowDown /> <span>{change}% from last month</span></>
          )}
        </div>
      )}
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Platform insights and performance metrics</p>
        </div>
        <button className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-all">
          <FaCalendar /> This Month
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricCard
          title="Total Users"
          value="2,547"
          change={12}
          icon={FaUsers}
          gradient="from-blue-600 to-blue-700"
        />
        <MetricCard
          title="Active Jobs"
          value="342"
          change={8}
          icon={FaBriefcase}
          gradient="from-green-600 to-green-700"
        />
        <MetricCard
          title="Applications"
          value="1,234"
          change={15}
          icon={FaFileAlt}
          gradient="from-purple-600 to-purple-700"
        />
        <MetricCard
          title="Success Rate"
          value="67%"
          change={3}
          icon={FaChartLine}
          gradient="from-orange-600 to-orange-700"
        />
      </div>

      {/* Charts and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">User Growth Trend</h2>
          <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="text-center">
              <FaChartLine className="text-6xl text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Chart visualization would go here</p>
              <p className="text-sm text-gray-500 mt-2">(Integration with Chart.js or Recharts recommended)</p>
            </div>
          </div>
        </div>

        {/* Application Success Rate */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Pipeline</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold text-gray-700">Applied</span>
                <span className="font-bold text-blue-600">1,234</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-blue-600 rounded-full h-3" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold text-gray-700">Shortlisted</span>
                <span className="font-bold text-purple-600">456</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-purple-600 rounded-full h-3" style={{ width: '37%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold text-gray-700">Interviewed</span>
                <span className="font-bold text-indigo-600">234</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-indigo-600 rounded-full h-3" style={{ width: '19%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold text-gray-700">Hired</span>
                <span className="font-bold text-green-600">89</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-green-600 rounded-full h-3" style={{ width: '7%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Jobs */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Top Performing Jobs</h2>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {i}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Senior Software Engineer</p>
                    <p className="text-sm text-gray-600">TechCorp Inc.</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary-600">{150 - i * 20}</p>
                  <p className="text-xs text-gray-500">applications</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Recruiters */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Top Recruiters</h2>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {i}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Company Name {i}</p>
                    <p className="text-sm text-gray-600">Industry Sector</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{50 - i * 5}</p>
                  <p className="text-xs text-gray-500">active jobs</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
