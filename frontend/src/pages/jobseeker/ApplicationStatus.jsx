import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaClipboardList, FaEye, FaFilter, FaClock, FaCheckCircle, FaTimesCircle, FaUserCheck, FaTrophy } from 'react-icons/fa';
import api from '../../utils/api';
import Layout from '../../components/Layout';

const ApplicationStatus = () => {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    shortlisted: 0,
    interviewed: 0,
    hired: 0,
    rejected: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [statusFilter, applications]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/applications/my-applications');
      setApplications(response.data);
      calculateStats(response.data);
    } catch (error) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (apps) => {
    setStats({
      total: apps.length,
      pending: apps.filter(a => a.status === 'pending').length,
      shortlisted: apps.filter(a => a.status === 'shortlisted').length,
      interviewed: apps.filter(a => a.status === 'interviewed').length,
      hired: apps.filter(a => a.status === 'hired').length,
      rejected: apps.filter(a => a.status === 'rejected').length
    });
  };

  const filterApplications = () => {
    if (statusFilter === 'all') {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(applications.filter(app => app.status === statusFilter));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FaClock className="text-yellow-500" />;
      case 'shortlisted': return <FaCheckCircle className="text-blue-500" />;
      case 'interviewed': return <FaUserCheck className="text-purple-500" />;
      case 'hired': return <FaTrophy className="text-green-500" />;
      case 'rejected': return <FaTimesCircle className="text-red-500" />;
      default: return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      shortlisted: 'bg-blue-100 text-blue-800',
      interviewed: 'bg-purple-100 text-purple-800',
      hired: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const StatCard = ({ label, value, icon: Icon, color, isActive, onClick }) => (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow-lg p-6 cursor-pointer transform transition-all duration-200 ${
        isActive ? 'ring-4 ring-primary-500 scale-105' : 'hover:shadow-xl hover:scale-102'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-2">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-4 rounded-full ${color}`}>
          <Icon className="text-2xl text-white" />
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
              <FaClipboardList className="mr-4 text-primary-600" />
              Application Tracker
            </h1>
            <p className="text-gray-600 text-lg">Track the status of all your job applications</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
            <StatCard
              label="Total Applications"
              value={stats.total}
              icon={FaClipboardList}
              color="bg-gradient-to-br from-primary-500 to-primary-600"
              isActive={statusFilter === 'all'}
              onClick={() => setStatusFilter('all')}
            />
            <StatCard
              label="Pending"
              value={stats.pending}
              icon={FaClock}
              color="bg-gradient-to-br from-yellow-400 to-yellow-500"
              isActive={statusFilter === 'pending'}
              onClick={() => setStatusFilter('pending')}
            />
            <StatCard
              label="Shortlisted"
              value={stats.shortlisted}
              icon={FaCheckCircle}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
              isActive={statusFilter === 'shortlisted'}
              onClick={() => setStatusFilter('shortlisted')}
            />
            <StatCard
              label="Interviewed"
              value={stats.interviewed}
              icon={FaUserCheck}
              color="bg-gradient-to-br from-purple-500 to-purple-600"
              isActive={statusFilter === 'interviewed'}
              onClick={() => setStatusFilter('interviewed')}
            />
            <StatCard
              label="Hired"
              value={stats.hired}
              icon={FaTrophy}
              color="bg-gradient-to-br from-green-500 to-green-600"
              isActive={statusFilter === 'hired'}
              onClick={() => setStatusFilter('hired')}
            />
            <StatCard
              label="Rejected"
              value={stats.rejected}
              icon={FaTimesCircle}
              color="bg-gradient-to-br from-red-500 to-red-600"
              isActive={statusFilter === 'rejected'}
              onClick={() => setStatusFilter('rejected')}
            />
          </div>

          {/* Applications List */}
          {filteredApplications.length > 0 ? (
            <div className="space-y-4">
              {filteredApplications.map((app) => (
                <div
                  key={app.application_id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden border border-gray-100"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="text-3xl">
                            {getStatusIcon(app.status)}
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900">{app.job_title}</h3>
                            <p className="text-lg text-gray-600">{app.company_name}</p>
                          </div>
                          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadge(app.status)}`}>
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <div className="flex items-center text-gray-600">
                            <FaClock className="mr-2 text-primary-600" />
                            <div>
                              <p className="text-xs text-gray-500">Applied on</p>
                              <p className="font-medium">{new Date(app.applied_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          {app.updated_at && app.updated_at !== app.applied_at && (
                            <div className="flex items-center text-gray-600">
                              <FaCheckCircle className="mr-2 text-primary-600" />
                              <div>
                                <p className="text-xs text-gray-500">Last updated</p>
                                <p className="font-medium">{new Date(app.updated_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {app.cover_letter && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 font-medium mb-2">Cover Letter Excerpt:</p>
                            <p className="text-gray-700 line-clamp-2">{app.cover_letter}</p>
                          </div>
                        )}
                      </div>

                      <div className="ml-6">
                        <button
                          onClick={() => navigate(`/jobseeker/job-details/${app.job_id}`)}
                          className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 font-medium flex items-center shadow-md"
                        >
                          <FaEye className="mr-2" /> View Job
                        </button>
                      </div>
                    </div>

                    {/* Timeline for this application */}
                    {app.status !== 'pending' && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center space-x-4">
                          <div className={`flex items-center ${app.status === 'rejected' ? 'text-red-600' : 'text-green-600'}`}>
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
                              <FaCheckCircle />
                            </div>
                            <span className="font-medium">Applied</span>
                          </div>
                          <div className={`flex-1 h-1 ${app.status === 'pending' ? 'bg-gray-200' : app.status === 'rejected' ? 'bg-red-300' : 'bg-green-300'}`}></div>
                          
                          {app.status !== 'rejected' && (
                            <>
                              <div className={`flex items-center ${['shortlisted', 'interviewed', 'hired'].includes(app.status) ? 'text-green-600' : 'text-gray-400'}`}>
                                <div className={`w-8 h-8 rounded-full ${['shortlisted', 'interviewed', 'hired'].includes(app.status) ? 'bg-green-100' : 'bg-gray-100'} flex items-center justify-center mr-2`}>
                                  <FaCheckCircle />
                                </div>
                                <span className="font-medium">Shortlisted</span>
                              </div>
                              <div className={`flex-1 h-1 ${['interviewed', 'hired'].includes(app.status) ? 'bg-green-300' : 'bg-gray-200'}`}></div>
                              
                              <div className={`flex items-center ${['interviewed', 'hired'].includes(app.status) ? 'text-green-600' : 'text-gray-400'}`}>
                                <div className={`w-8 h-8 rounded-full ${['interviewed', 'hired'].includes(app.status) ? 'bg-green-100' : 'bg-gray-100'} flex items-center justify-center mr-2`}>
                                  <FaUserCheck />
                                </div>
                                <span className="font-medium">Interviewed</span>
                              </div>
                              <div className={`flex-1 h-1 ${app.status === 'hired' ? 'bg-green-300' : 'bg-gray-200'}`}></div>
                              
                              <div className={`flex items-center ${app.status === 'hired' ? 'text-green-600' : 'text-gray-400'}`}>
                                <div className={`w-8 h-8 rounded-full ${app.status === 'hired' ? 'bg-green-100' : 'bg-gray-100'} flex items-center justify-center mr-2`}>
                                  <FaTrophy />
                                </div>
                                <span className="font-medium">Hired</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl shadow-lg">
              <div className="text-gray-300 text-8xl mb-6">📋</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {statusFilter === 'all' ? 'No Applications Yet' : `No ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Applications`}
              </h2>
              <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                {statusFilter === 'all' 
                  ? "Start your job search journey and apply to positions that match your skills"
                  : "Try selecting a different status filter to view other applications"
                }
              </p>
              {statusFilter === 'all' ? (
                <button
                  onClick={() => navigate('/jobseeker/job-search')}
                  className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 font-bold text-lg shadow-lg"
                >
                  Browse Jobs
                </button>
              ) : (
                <button
                  onClick={() => setStatusFilter('all')}
                  className="px-8 py-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 font-bold text-lg shadow-lg flex items-center mx-auto"
                >
                  <FaFilter className="mr-2" /> View All Applications
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ApplicationStatus;
