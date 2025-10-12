import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaClipboardList, FaEye, FaFilter, FaClock, FaCheckCircle, FaTimesCircle, FaUserCheck, FaTrophy, FaBuilding, FaMapMarkerAlt, FaBriefcase, FaRocket, FaHourglassHalf, FaHandshake, FaStar, FaFire, FaChartLine, FaCalendarAlt, FaArrowRight, FaEnvelope } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
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

  const StatCard = ({ label, value, icon: Icon, color, gradientFrom, gradientTo, isActive, onClick }) => (
    <motion.div
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative cursor-pointer overflow-hidden rounded-2xl transition-all duration-300 ${
        isActive 
          ? 'ring-4 ring-offset-2 ring-blue-500 shadow-2xl' 
          : 'shadow-lg hover:shadow-xl'
      }`}
    >
      <div className={`bg-gradient-to-br ${gradientFrom} ${gradientTo} p-6`}>
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-300"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Icon className="text-2xl text-white" />
            </div>
            {isActive && (
              <div className="flex items-center gap-1 px-3 py-1 bg-white/30 backdrop-blur-sm rounded-full">
                <FaCheckCircle className="text-white text-sm" />
                <span className="text-white text-xs font-bold">Active</span>
              </div>
            )}
          </div>
          <p className="text-white/80 text-sm font-medium mb-1">{label}</p>
          <p className="text-4xl font-black text-white">{value}</p>
        </div>

        {/* Shine effect */}
        <div className="absolute top-0 -left-full h-full w-1/2 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 group-hover:left-full transition-all duration-700 ease-in-out"></div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="relative inline-block">
              <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-600"></div>
              <FaClipboardList className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-600 text-2xl animate-pulse" />
            </div>
            <p className="mt-6 text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Loading your applications...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced Hero Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-10 mb-12 overflow-hidden"
          >
            {/* Animated background orbs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-yellow-300 opacity-10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                    <FaClipboardList className="text-5xl text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-2 flex items-center gap-3">
                      Application Tracker
                      <FaChartLine className="text-yellow-300 animate-pulse" />
                    </h1>
                    <p className="text-blue-100 text-lg">Monitor and manage all your job applications in one place</p>
                  </div>
                </div>
                
                {stats.total > 0 && (
                  <div className="flex items-center gap-4">
                    <div className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                      <div className="text-center">
                        <div className="text-3xl font-black text-white">{stats.total}</div>
                        <div className="text-sm text-blue-100 font-medium">Total Applications</div>
                      </div>
                    </div>
                    {stats.hired > 0 && (
                      <div className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                        <div className="flex items-center gap-2">
                          <FaTrophy className="text-white text-2xl" />
                          <div>
                            <div className="text-2xl font-black text-white">{stats.hired}</div>
                            <div className="text-xs text-green-100 font-medium">Hired!</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
            <StatCard
              label="All Applications"
              value={stats.total}
              icon={FaClipboardList}
              gradientFrom="from-indigo-500"
              gradientTo="to-indigo-600"
              isActive={statusFilter === 'all'}
              onClick={() => setStatusFilter('all')}
            />
            <StatCard
              label="Pending Review"
              value={stats.pending}
              icon={FaHourglassHalf}
              gradientFrom="from-yellow-400"
              gradientTo="to-orange-500"
              isActive={statusFilter === 'pending'}
              onClick={() => setStatusFilter('pending')}
            />
            <StatCard
              label="Shortlisted"
              value={stats.shortlisted}
              icon={FaStar}
              gradientFrom="from-blue-500"
              gradientTo="to-cyan-600"
              isActive={statusFilter === 'shortlisted'}
              onClick={() => setStatusFilter('shortlisted')}
            />
            <StatCard
              label="Interviewed"
              value={stats.interviewed}
              icon={FaHandshake}
              gradientFrom="from-purple-500"
              gradientTo="to-pink-600"
              isActive={statusFilter === 'interviewed'}
              onClick={() => setStatusFilter('interviewed')}
            />
            <StatCard
              label="Hired"
              value={stats.hired}
              icon={FaTrophy}
              gradientFrom="from-green-500"
              gradientTo="to-emerald-600"
              isActive={statusFilter === 'hired'}
              onClick={() => setStatusFilter('hired')}
            />
            <StatCard
              label="Not Selected"
              value={stats.rejected}
              icon={FaTimesCircle}
              gradientFrom="from-red-500"
              gradientTo="to-rose-600"
              isActive={statusFilter === 'rejected'}
              onClick={() => setStatusFilter('rejected')}
            />
          </div>

          {/* Enhanced Applications List */}
          <AnimatePresence mode="wait">
            {filteredApplications.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {filteredApplications.map((app, index) => (
                  <motion.div
                    key={app.application_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -4 }}
                    className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-blue-300"
                  >
                    {/* Status Color Bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-2 ${
                      app.status === 'pending' ? 'bg-gradient-to-b from-yellow-400 to-orange-500' :
                      app.status === 'shortlisted' ? 'bg-gradient-to-b from-blue-500 to-cyan-600' :
                      app.status === 'interviewed' ? 'bg-gradient-to-b from-purple-500 to-pink-600' :
                      app.status === 'hired' ? 'bg-gradient-to-b from-green-500 to-emerald-600' :
                      'bg-gradient-to-b from-red-500 to-rose-600'
                    }`}></div>

                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="relative p-8 pl-10">
                      {/* Header Section */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-start gap-4 flex-1">
                          {/* Status Icon */}
                          <div className={`p-4 rounded-2xl shadow-lg ${
                            app.status === 'pending' ? 'bg-gradient-to-br from-yellow-100 to-orange-100' :
                            app.status === 'shortlisted' ? 'bg-gradient-to-br from-blue-100 to-cyan-100' :
                            app.status === 'interviewed' ? 'bg-gradient-to-br from-purple-100 to-pink-100' :
                            app.status === 'hired' ? 'bg-gradient-to-br from-green-100 to-emerald-100' :
                            'bg-gradient-to-br from-red-100 to-rose-100'
                          }`}>
                            {getStatusIcon(app.status)}
                          </div>

                          {/* Job Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-2xl md:text-3xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                                {app.job_title}
                              </h3>
                              <span className={`px-4 py-2 rounded-xl text-sm font-bold shadow-md ${
                                app.status === 'pending' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' :
                                app.status === 'shortlisted' ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white' :
                                app.status === 'interviewed' ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white' :
                                app.status === 'hired' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' :
                                'bg-gradient-to-r from-red-500 to-rose-600 text-white'
                              }`}>
                                {app.status === 'pending' && <FaHourglassHalf className="inline mr-1" />}
                                {app.status === 'shortlisted' && <FaStar className="inline mr-1" />}
                                {app.status === 'interviewed' && <FaHandshake className="inline mr-1" />}
                                {app.status === 'hired' && <FaTrophy className="inline mr-1" />}
                                {app.status === 'rejected' && <FaTimesCircle className="inline mr-1" />}
                                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                              </span>
                            </div>
                            
                            <p className="text-lg text-gray-600 font-semibold mb-4 flex items-center gap-2">
                              <FaBuilding className="text-blue-500" />
                              {app.company_name}
                            </p>

                            {/* Date Info */}
                            <div className="flex flex-wrap gap-6 text-sm">
                              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                  <FaCalendarAlt className="text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 font-medium">Applied On</p>
                                  <p className="font-bold text-gray-900">{new Date(app.applied_at).toLocaleDateString()}</p>
                                </div>
                              </div>
                              
                              {app.updated_at && app.updated_at !== app.applied_at && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                                  <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <FaClock className="text-purple-600" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 font-medium">Last Updated</p>
                                    <p className="font-bold text-gray-900">{new Date(app.updated_at).toLocaleDateString()}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* View Job Button */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => navigate(`/job-seeker/jobs/${app.job_id}`)}
                          className="ml-6 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-black shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 whitespace-nowrap"
                        >
                          <FaRocket className="text-lg" />
                          View Job
                        </motion.button>
                      </div>

                      {/* Cover Letter Excerpt */}
                      {app.cover_letter && (
                        <div className="mb-6 p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-100">
                          <div className="flex items-center gap-2 mb-3">
                            <FaEnvelope className="text-indigo-600" />
                            <p className="text-sm font-bold text-indigo-900">Cover Letter Excerpt</p>
                          </div>
                          <p className="text-gray-700 line-clamp-2 leading-relaxed">{app.cover_letter}</p>
                        </div>
                      )}

                      {/* Enhanced Progress Timeline */}
                      {app.status !== 'pending' && (
                        <div className="mt-6 pt-6 border-t-2 border-gray-100">
                          <div className="flex items-center gap-2 mb-4">
                            <FaChartLine className="text-blue-600" />
                            <h4 className="font-bold text-gray-900">Application Journey</h4>
                          </div>
                          
                          <div className="relative">
                            <div className="flex items-center justify-between">
                              {/* Applied Stage */}
                              <div className="flex flex-col items-center flex-1">
                                <div className={`w-12 h-12 rounded-full ${app.status === 'rejected' ? 'bg-gradient-to-br from-red-400 to-red-500' : 'bg-gradient-to-br from-green-400 to-green-500'} flex items-center justify-center shadow-lg mb-2`}>
                                  <FaCheckCircle className="text-white text-xl" />
                                </div>
                                <span className="text-xs font-bold text-gray-900">Applied</span>
                                <span className="text-xs text-gray-500">{new Date(app.applied_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                              </div>

                              {/* Progress Bar 1 */}
                              <div className={`flex-1 h-2 mx-2 rounded-full ${
                                app.status === 'pending' ? 'bg-gray-200' : 
                                app.status === 'rejected' ? 'bg-gradient-to-r from-red-300 to-red-400' : 
                                'bg-gradient-to-r from-green-300 to-blue-400'
                              }`}></div>
                              
                              {/* Shortlisted Stage */}
                              <div className="flex flex-col items-center flex-1">
                                <div className={`w-12 h-12 rounded-full ${
                                  ['shortlisted', 'interviewed', 'hired'].includes(app.status) 
                                    ? 'bg-gradient-to-br from-blue-400 to-blue-500' 
                                    : 'bg-gray-200'
                                } flex items-center justify-center shadow-lg mb-2`}>
                                  <FaStar className={`${['shortlisted', 'interviewed', 'hired'].includes(app.status) ? 'text-white' : 'text-gray-400'} text-xl`} />
                                </div>
                                <span className={`text-xs font-bold ${['shortlisted', 'interviewed', 'hired'].includes(app.status) ? 'text-gray-900' : 'text-gray-400'}`}>Shortlisted</span>
                              </div>

                              {/* Progress Bar 2 */}
                              <div className={`flex-1 h-2 mx-2 rounded-full ${
                                ['interviewed', 'hired'].includes(app.status) 
                                  ? 'bg-gradient-to-r from-blue-400 to-purple-500' 
                                  : 'bg-gray-200'
                              }`}></div>
                              
                              {/* Interviewed Stage */}
                              <div className="flex flex-col items-center flex-1">
                                <div className={`w-12 h-12 rounded-full ${
                                  ['interviewed', 'hired'].includes(app.status) 
                                    ? 'bg-gradient-to-br from-purple-400 to-purple-500' 
                                    : 'bg-gray-200'
                                } flex items-center justify-center shadow-lg mb-2`}>
                                  <FaHandshake className={`${['interviewed', 'hired'].includes(app.status) ? 'text-white' : 'text-gray-400'} text-xl`} />
                                </div>
                                <span className={`text-xs font-bold ${['interviewed', 'hired'].includes(app.status) ? 'text-gray-900' : 'text-gray-400'}`}>Interviewed</span>
                              </div>

                              {/* Progress Bar 3 */}
                              <div className={`flex-1 h-2 mx-2 rounded-full ${
                                app.status === 'hired' 
                                  ? 'bg-gradient-to-r from-purple-500 to-green-500' 
                                  : 'bg-gray-200'
                              }`}></div>
                              
                              {/* Hired Stage */}
                              <div className="flex flex-col items-center flex-1">
                                <div className={`w-12 h-12 rounded-full ${
                                  app.status === 'hired' 
                                    ? 'bg-gradient-to-br from-green-400 to-green-500' 
                                    : 'bg-gray-200'
                                } flex items-center justify-center shadow-lg mb-2`}>
                                  <FaTrophy className={`${app.status === 'hired' ? 'text-white' : 'text-gray-400'} text-xl`} />
                                </div>
                                <span className={`text-xs font-bold ${app.status === 'hired' ? 'text-gray-900' : 'text-gray-400'}`}>Hired!</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Animated shine effect */}
                    <div className="absolute top-0 -left-full h-full w-1/2 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 group-hover:left-full transition-all duration-1000 ease-in-out"></div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-20 bg-white rounded-3xl shadow-2xl"
              >
                <div className="inline-block p-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-6">
                  <FaClipboardList className="text-gray-400 text-7xl" />
                </div>
                <h2 className="text-4xl font-black text-gray-900 mb-4">
                  {statusFilter === 'all' ? 'No Applications Yet' : `No ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Applications`}
                </h2>
                <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                  {statusFilter === 'all' 
                    ? "Start your job search journey and apply to positions that match your skills and experience"
                    : `You don't have any ${statusFilter} applications. Try selecting a different status filter.`
                  }
                </p>
                {statusFilter === 'all' ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/job-seeker/jobs')}
                    className="px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 font-black text-lg shadow-2xl flex items-center gap-3 mx-auto"
                  >
                    <FaFire className="text-2xl" />
                    Browse Jobs Now
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setStatusFilter('all')}
                    className="px-10 py-5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-2xl hover:from-gray-700 hover:to-gray-800 font-black text-lg shadow-2xl flex items-center gap-3 mx-auto"
                  >
                    <FaFilter className="text-xl" />
                    View All Applications
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
};

export default ApplicationStatus;
