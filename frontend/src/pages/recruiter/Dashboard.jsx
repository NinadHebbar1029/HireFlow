import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaBriefcase, FaUsers, FaEye, FaCheckCircle, FaPlus, FaChartLine, FaClock, FaTrophy, FaRocket, FaStar, FaFire, FaArrowUp, FaUserCheck, FaTimesCircle } from 'react-icons/fa';
import api from '../../utils/api';
import Layout from '../../components/Layout';
import PersonalizedGreeting from '../../components/PersonalizedGreeting';
import ActivityFeed from '../../components/ActivityFeed';
import { FunnelChart, LineChartComponent } from '../../components/Charts';

const RecruiterDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    pendingReview: 0,
    shortlisted: 0,
    interviewed: 0,
    hired: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [activeJobs, setActiveJobs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats with fallback
      try {
        const statsRes = await api.get('/recruiters/stats');
        setStats(statsRes.data);
      } catch (err) {
        console.log('Stats not available, using defaults');
        // Stats will use default values
      }
      
      // Fetch jobs with fallback
      try {
        const jobsRes = await api.get('/jobs/recruiter/my-jobs');
        const activeJobsList = jobsRes.data.filter(job => job.status === 'active').slice(0, 5);
        setActiveJobs(activeJobsList);
        
        // Get recent applications across all jobs
        if (activeJobsList.length > 0) {
          const applicationsPromises = activeJobsList.map(job => 
            api.get(`/applications/job/${job.job_id}`).catch(() => ({ data: [] }))
          );
          const applicationsResults = await Promise.all(applicationsPromises);
          const allApplications = applicationsResults.flatMap(res => res.data);
          setRecentApplications(allApplications.slice(0, 10));
        }
      } catch (err) {
        console.log('Jobs not available, using defaults');
        // Jobs will use empty array
      }

      // Fetch analytics
      try {
        const analyticsRes = await api.get('/analytics/recruiter/stats');
        setAnalytics(analyticsRes.data);
      } catch (err) {
        console.log('Analytics not available');
      }
    } catch (error) {
      console.error('Dashboard error:', error);
      // Don't show error toast - just load with default data
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, subtitle, onClick, trend }) => (
    <div 
      className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl p-6 cursor-pointer transform hover:scale-105 transition-all duration-300 overflow-hidden`}
      onClick={onClick}
    >
      {/* Gradient Background Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-4 bg-gradient-to-br ${color} rounded-xl shadow-lg`}>
            <Icon className="text-white text-2xl" />
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-green-600 text-sm font-bold">
              <FaArrowUp />
              <span>{trend}%</span>
            </div>
          )}
        </div>
        <p className="text-gray-600 text-sm font-semibold mb-1">{title}</p>
        <p className="text-gray-900 text-4xl font-bold mb-1">{value}</p>
        {subtitle && <p className="text-gray-500 text-xs">{subtitle}</p>}
      </div>

      {/* Hover Effect Border */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
    </div>
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-primary-600 mx-auto"></div>
              <FaRocket className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary-600 text-3xl animate-pulse" />
            </div>
            <p className="text-gray-600 font-semibold mt-6 text-lg">Loading your dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section with Greeting */}
          <div className="mb-8">
            <PersonalizedGreeting stats={stats} userRole="recruiter" />
            
            {/* Quick Action Hero Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => navigate('/recruiter/post-job')}
                className="group px-8 py-4 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 text-white rounded-2xl hover:shadow-2xl font-bold flex items-center transform hover:scale-105 transition-all shadow-xl"
              >
                <FaRocket className="mr-3 text-xl group-hover:rotate-12 transition-transform" />
                <span>Post New Job</span>
              </button>
            </div>
          </div>

          {/* Performance Overview Banner */}
          <div className="mb-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 text-white">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                  <FaTrophy className="text-3xl" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Recruitment Performance</h2>
                  <p className="text-white text-opacity-90">Track your hiring success</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold">{stats.hired}</p>
                <p className="text-sm text-white text-opacity-90">Successful Hires</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 text-center">
                <FaUsers className="text-2xl mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.totalApplications}</p>
                <p className="text-sm text-white text-opacity-90">Total Apps</p>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 text-center">
                <FaEye className="text-2xl mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.pendingReview}</p>
                <p className="text-sm text-white text-opacity-90">Pending</p>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 text-center">
                <FaStar className="text-2xl mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.shortlisted}</p>
                <p className="text-sm text-white text-opacity-90">Shortlisted</p>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 text-center">
                <FaUserCheck className="text-2xl mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.interviewed}</p>
                <p className="text-sm text-white text-opacity-90">Interviewed</p>
              </div>
            </div>
          </div>

          {/* Stats Grid - Modern Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard 
              icon={FaBriefcase}
              title="Active Job Postings"
              value={stats.activeJobs}
              color="from-blue-500 to-blue-600"
              subtitle="Currently hiring"
              trend={12}
              onClick={() => navigate('/recruiter/jobs')}
            />
            <StatCard 
              icon={FaFire}
              title="Applications This Week"
              value={stats.totalApplications}
              color="from-orange-500 to-red-600"
              subtitle="New candidates"
              trend={8}
              onClick={() => navigate('/recruiter/applicants')}
            />
            <StatCard 
              icon={FaClock}
              title="Awaiting Review"
              value={stats.pendingReview}
              color="from-yellow-500 to-orange-600"
              subtitle="Action required"
              onClick={() => navigate('/recruiter/applicants')}
            />
            <StatCard 
              icon={FaStar}
              title="Top Candidates"
              value={stats.shortlisted}
              color="from-purple-500 to-pink-600"
              subtitle="Shortlisted"
              onClick={() => navigate('/recruiter/applicants')}
            />
            <StatCard 
              icon={FaUsers}
              title="Interview Pipeline"
              value={stats.interviewed}
              color="from-indigo-500 to-purple-600"
              subtitle="In progress"
              onClick={() => navigate('/recruiter/applicants')}
            />
            <StatCard 
              icon={FaTrophy}
              title="Successful Hires"
              value={stats.hired}
              color="from-green-500 to-emerald-600"
              subtitle="Positions filled"
              trend={15}
              onClick={() => navigate('/recruiter/applicants')}
            />
          </div>

          {/* Hiring Funnel and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Hiring Funnel */}
            {analytics?.funnelData && analytics.funnelData.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                    <FaChartLine className="text-white text-2xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Hiring Funnel</h2>
                    <p className="text-gray-600 text-sm">Conversion analytics</p>
                  </div>
                </div>
                <FunnelChart
                  data={analytics.funnelData.map(item => [
                    { name: 'Total Applications', value: item.total_applications },
                    { name: 'Pending Review', value: item.pending },
                    { name: 'Shortlisted', value: item.shortlisted },
                    { name: 'Interviewed', value: item.interviewed },
                    { name: 'Hired', value: item.hired }
                  ]).flat()}
                />
              </div>
            )}

            {/* Application Trends */}
            {analytics?.applicationTrends && analytics.applicationTrends.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                    <FaChartLine className="text-white text-2xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Application Trends</h2>
                    <p className="text-gray-600 text-sm">Last 30 days</p>
                  </div>
                </div>
                <LineChartComponent
                  data={analytics.applicationTrends}
                  dataKeys={['count']}
                  xAxisKey="date"
                  height={250}
                />
              </div>
            )}
          </div>

          {/* Jobs and Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Active Jobs */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow">
              <div className="px-8 py-6 bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl">
                    <FaBriefcase className="text-white text-2xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Active Jobs</h2>
                    <p className="text-white text-opacity-90 text-sm">Your current openings</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/recruiter/jobs')}
                  className="text-white hover:bg-white hover:bg-opacity-20 px-4 py-2 rounded-xl text-sm font-semibold transition-all backdrop-blur-sm"
                >
                  View All →
                </button>
              </div>
              <div className="p-6">
                {activeJobs.length > 0 ? (
                  <div className="space-y-4">
                    {activeJobs.map((job) => (
                      <div 
                        key={job.job_id}
                        className="group p-5 border-2 border-gray-100 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-white to-gray-50"
                        onClick={() => navigate(`/recruiter/jobs`)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{job.title}</h3>
                          <span className="px-3 py-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full text-xs font-bold shadow-sm">
                            ● Active
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span className="flex items-center gap-1">
                            <FaBriefcase className="text-blue-500" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaClock className="text-gray-400" />
                            {new Date(job.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <span className="text-xs text-gray-500">Posted {new Date(job.created_at).toLocaleDateString()}</span>
                          <span className="text-blue-600 font-semibold text-sm group-hover:translate-x-1 transition-transform inline-block">
                            View Details →
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FaBriefcase className="text-blue-500 text-4xl" />
                    </div>
                    <p className="text-gray-600 font-semibold mb-4">No active job postings</p>
                    <button
                      onClick={() => navigate('/recruiter/post-job')}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg font-semibold transition-all"
                    >
                      Post Your First Job
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Applications */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow">
              <div className="px-8 py-6 bg-gradient-to-r from-purple-500 via-purple-600 to-pink-600 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl">
                    <FaUsers className="text-white text-2xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">New Applications</h2>
                    <p className="text-white text-opacity-90 text-sm">Recent candidates</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/recruiter/applicants')}
                  className="text-white hover:bg-white hover:bg-opacity-20 px-4 py-2 rounded-xl text-sm font-semibold transition-all backdrop-blur-sm"
                >
                  View All →
                </button>
              </div>
              <div className="p-6">
                {recentApplications.length > 0 ? (
                  <div className="space-y-3">
                    {recentApplications.slice(0, 5).map((app) => (
                      <div 
                        key={app.application_id}
                        className="group flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl hover:shadow-md transition-all cursor-pointer border-2 border-transparent hover:border-purple-200"
                        onClick={() => navigate(`/recruiter/applicants`)}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {app.applicant_name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{app.applicant_name}</h3>
                            <p className="text-sm text-gray-600">{app.job_title}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm ${
                            app.status === 'pending' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' :
                            app.status === 'shortlisted' ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white' :
                            app.status === 'interviewed' ? 'bg-gradient-to-r from-purple-400 to-purple-600 text-white' :
                            app.status === 'hired' ? 'bg-gradient-to-r from-green-400 to-emerald-600 text-white' :
                            'bg-gradient-to-r from-red-400 to-red-600 text-white'
                          }`}>
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </span>
                          <span className="text-purple-600 font-semibold text-sm group-hover:translate-x-1 transition-transform inline-block">
                            →
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FaUsers className="text-purple-500 text-4xl" />
                    </div>
                    <p className="text-gray-600 font-semibold">No applications yet</p>
                    <p className="text-gray-500 text-sm mt-2">Start posting jobs to receive applications</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="grid grid-cols-1 mb-8">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow">
              <div className="px-8 py-6 bg-gradient-to-r from-orange-500 via-red-500 to-pink-600">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl">
                    <FaFire className="text-white text-2xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
                    <p className="text-white text-opacity-90 text-sm">Real-time updates</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <ActivityFeed userRole="recruiter" limit={10} />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition-shadow">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl">
                <FaRocket className="text-white text-3xl" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Quick Actions</h2>
                <p className="text-white text-opacity-90">Take control of your recruitment</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => navigate('/recruiter/post-job')}
                className="group bg-white bg-opacity-10 backdrop-blur-sm hover:bg-opacity-20 text-white p-8 rounded-2xl transition-all transform hover:scale-105 border-2 border-white border-opacity-20 hover:border-opacity-40"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FaPlus className="text-4xl" />
                  </div>
                  <p className="font-bold text-lg mb-2">Post New Job</p>
                  <p className="text-sm text-white text-opacity-80">Create a job opening</p>
                </div>
              </button>
              <button
                onClick={() => navigate('/recruiter/applicants')}
                className="group bg-white bg-opacity-10 backdrop-blur-sm hover:bg-opacity-20 text-white p-8 rounded-2xl transition-all transform hover:scale-105 border-2 border-white border-opacity-20 hover:border-opacity-40"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FaUsers className="text-4xl" />
                  </div>
                  <p className="font-bold text-lg mb-2">Review Applications</p>
                  <p className="text-sm text-white text-opacity-80">Manage candidates</p>
                </div>
              </button>
              <button
                onClick={() => navigate('/recruiter/jobs')}
                className="group bg-white bg-opacity-10 backdrop-blur-sm hover:bg-opacity-20 text-white p-8 rounded-2xl transition-all transform hover:scale-105 border-2 border-white border-opacity-20 hover:border-opacity-40"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FaChartLine className="text-4xl" />
                  </div>
                  <p className="font-bold text-lg mb-2">Manage Jobs</p>
                  <p className="text-sm text-white text-opacity-80">Track performance</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RecruiterDashboard;
