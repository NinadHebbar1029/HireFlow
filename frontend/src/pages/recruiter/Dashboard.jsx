import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaBriefcase, FaUsers, FaEye, FaCheckCircle, FaPlus, FaChartLine } from 'react-icons/fa';
import api from '../../utils/api';
import Layout from '../../components/Layout';

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
    } catch (error) {
      console.error('Dashboard error:', error);
      // Don't show error toast - just load with default data
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, subtitle, onClick }) => (
    <div 
      className={`bg-gradient-to-br ${color} rounded-xl shadow-lg p-6 cursor-pointer transform hover:scale-105 transition-all duration-300`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white text-opacity-90 text-sm font-medium">{title}</p>
          <p className="text-white text-4xl font-bold mt-2">{value}</p>
          {subtitle && <p className="text-white text-opacity-75 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className="bg-white bg-opacity-20 rounded-full p-4">
          <Icon className="text-white text-3xl" />
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
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Recruiter Dashboard 👔</h1>
              <p className="text-gray-600 text-lg">Manage your job postings and find the best talent</p>
            </div>
            <button
              onClick={() => navigate('/recruiter/post-job')}
              className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 font-semibold flex items-center shadow-lg"
            >
              <FaPlus className="mr-2" /> Post New Job
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard 
              icon={FaBriefcase}
              title="Active Job Postings"
              value={stats.activeJobs}
              color="from-blue-500 to-blue-600"
              onClick={() => navigate('/recruiter/jobs')}
            />
            <StatCard 
              icon={FaUsers}
              title="Total Applications"
              value={stats.totalApplications}
              color="from-purple-500 to-purple-600"
              onClick={() => navigate('/recruiter/applicants')}
            />
            <StatCard 
              icon={FaEye}
              title="Pending Review"
              value={stats.pendingReview}
              color="from-yellow-500 to-yellow-600"
              subtitle="Awaiting your response"
              onClick={() => navigate('/recruiter/applicants')}
            />
            <StatCard 
              icon={FaCheckCircle}
              title="Shortlisted"
              value={stats.shortlisted}
              color="from-green-500 to-green-600"
              onClick={() => navigate('/recruiter/applicants')}
            />
            <StatCard 
              icon={FaUsers}
              title="Interviewed"
              value={stats.interviewed}
              color="from-indigo-500 to-indigo-600"
              onClick={() => navigate('/recruiter/applicants')}
            />
            <StatCard 
              icon={FaCheckCircle}
              title="Hired"
              value={stats.hired}
              color="from-teal-500 to-teal-600"
              subtitle="Successful placements"
              onClick={() => navigate('/recruiter/applicants')}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Active Jobs */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <FaBriefcase className="mr-3" />
                  Active Job Postings
                </h2>
                <button
                  onClick={() => navigate('/recruiter/jobs')}
                  className="text-white hover:bg-white hover:bg-opacity-20 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                >
                  View All
                </button>
              </div>
              <div className="p-6">
                {activeJobs.length > 0 ? (
                  <div className="space-y-4">
                    {activeJobs.map((job) => (
                      <div 
                        key={job.job_id}
                        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/recruiter/jobs`)}
                      >
                        <h3 className="font-semibold text-gray-900 mb-2">{job.title}</h3>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>{job.location}</span>
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            Active
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Posted {new Date(job.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FaBriefcase className="text-gray-300 text-5xl mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">No active job postings</p>
                    <button
                      onClick={() => navigate('/recruiter/post-job')}
                      className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      Post Your First Job
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Applications */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <FaUsers className="mr-3" />
                  Recent Applications
                </h2>
                <button
                  onClick={() => navigate('/recruiter/applicants')}
                  className="text-white hover:bg-white hover:bg-opacity-20 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                >
                  View All
                </button>
              </div>
              <div className="p-6">
                {recentApplications.length > 0 ? (
                  <div className="space-y-4">
                    {recentApplications.map((app) => (
                      <div 
                        key={app.application_id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => navigate(`/recruiter/applicants`)}
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{app.applicant_name}</h3>
                          <p className="text-sm text-gray-600">{app.job_title}</p>
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
                          <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                            View →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FaUsers className="text-gray-300 text-5xl mx-auto mb-3" />
                    <p className="text-gray-500">No applications yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/recruiter/post-job')}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-6 rounded-xl transition-all transform hover:scale-105"
              >
                <FaPlus className="text-3xl mb-3 mx-auto" />
                <p className="font-semibold">Post New Job</p>
              </button>
              <button
                onClick={() => navigate('/recruiter/applicants')}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-6 rounded-xl transition-all transform hover:scale-105"
              >
                <FaUsers className="text-3xl mb-3 mx-auto" />
                <p className="font-semibold">Review Applications</p>
              </button>
              <button
                onClick={() => navigate('/recruiter/jobs')}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-6 rounded-xl transition-all transform hover:scale-105"
              >
                <FaChartLine className="text-3xl mb-3 mx-auto" />
                <p className="font-semibold">Manage Jobs</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RecruiterDashboard;
