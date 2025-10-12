import { useState, useEffect } from 'react';
import { FaBriefcase, FaEdit, FaTrash, FaEye, FaUsers, FaMapMarkerAlt, FaDollarSign, FaClock, FaPlus, FaRocket, FaChartLine, FaCheckCircle, FaTimesCircle, FaSearch, FaFilter, FaStar, FaFire } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import Layout from '../../components/Layout';

const ManageJobs = () => {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs/recruiter/my-jobs');
      setJobs(response.data || []);
    } catch (error) {
      console.error('Failed to load jobs:', error);
      setJobs([]);
      // Don't show error toast - just show empty state
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (job) => {
    setJobToDelete(job);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/jobs/${jobToDelete.id}`);
      toast.success('Job deleted successfully!');
      setJobs(jobs.filter(j => j.id !== jobToDelete.id));
      setShowDeleteModal(false);
      setJobToDelete(null);
    } catch (error) {
      toast.error('Failed to delete job');
    }
  };

  const handleStatusToggle = async (jobId, currentStatus) => {
    try {
      const newStatus = (currentStatus === 'active' || !currentStatus) ? 'closed' : 'active';
      await api.put(`/jobs/${jobId}`, { status: newStatus });
      toast.success(`Job ${newStatus === 'active' ? 'activated' : 'closed'} successfully!`);
      fetchJobs();
    } catch (error) {
      toast.error('Failed to update job status');
    }
  };

  const filteredJobs = jobs
    .filter(job => {
      if (filter === 'all') return true;
      return job.status === filter;
    })
    .filter(job => 
      (job.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.location || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

  const stats = {
    total: jobs.length,
    active: jobs.filter(j => j.status === 'active').length,
    closed: jobs.filter(j => j.status === 'closed').length,
    draft: jobs.filter(j => j.status === 'draft').length
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col justify-center items-center h-screen">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <FaRocket className="text-6xl text-primary-600 mb-4" />
          </motion.div>
          <p className="text-gray-600 text-lg font-semibold">Loading your job postings...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Section with Gradient */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden group">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 bg-yellow-300 opacity-5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
            
            <div className="relative z-10 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                    <FaBriefcase className="text-3xl" />
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black">Manage Jobs</h1>
                </div>
                <p className="text-lg text-white text-opacity-90 ml-1">
                  Track and manage all your job postings in one place
                </p>
              </div>
              <button
                onClick={() => navigate('/recruiter/post-job')}
                className="group flex items-center gap-3 bg-white text-purple-600 px-6 py-4 rounded-2xl hover:shadow-2xl font-bold transition-all transform hover:scale-105"
              >
                <FaRocket className="text-xl group-hover:rotate-12 transition-transform" />
                <span>Post New Job</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards - Enhanced */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="group relative bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 group-hover:text-white transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:bg-white group-hover:bg-opacity-20 transition-all">
                  <FaBriefcase className="text-2xl text-white" />
                </div>
                <FaChartLine className="text-2xl text-blue-500 group-hover:text-white opacity-50" />
              </div>
              <p className="text-sm font-semibold text-gray-600 group-hover:text-white group-hover:text-opacity-90 transition-colors">Total Jobs</p>
              <p className="text-4xl font-black mt-2">{stats.total}</p>
            </div>
          </div>

          <div className="group relative bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 group-hover:text-white transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg group-hover:bg-white group-hover:bg-opacity-20 transition-all">
                  <FaCheckCircle className="text-2xl text-white" />
                </div>
                <FaFire className="text-2xl text-green-500 group-hover:text-white opacity-50" />
              </div>
              <p className="text-sm font-semibold text-gray-600 group-hover:text-white group-hover:text-opacity-90 transition-colors">Active Jobs</p>
              <p className="text-4xl font-black mt-2">{stats.active}</p>
            </div>
          </div>

          <div className="group relative bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-500 to-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 group-hover:text-white transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl shadow-lg group-hover:bg-white group-hover:bg-opacity-20 transition-all">
                  <FaTimesCircle className="text-2xl text-white" />
                </div>
                <FaClock className="text-2xl text-gray-500 group-hover:text-white opacity-50" />
              </div>
              <p className="text-sm font-semibold text-gray-600 group-hover:text-white group-hover:text-opacity-90 transition-colors">Closed</p>
              <p className="text-4xl font-black mt-2">{stats.closed}</p>
            </div>
          </div>

          <div className="group relative bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 group-hover:text-white transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg group-hover:bg-white group-hover:bg-opacity-20 transition-all">
                  <FaEdit className="text-2xl text-white" />
                </div>
                <FaStar className="text-2xl text-yellow-500 group-hover:text-white opacity-50" />
              </div>
              <p className="text-sm font-semibold text-gray-600 group-hover:text-white group-hover:text-opacity-90 transition-colors">Draft</p>
              <p className="text-4xl font-black mt-2">{stats.draft}</p>
            </div>
          </div>
        </motion.div>

      {/* Filters and Search - Enhanced */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-xl p-6 mb-8"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Search by job title or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-700 font-medium"
            />
          </div>
          <div className="flex gap-2 items-center">
            <FaFilter className="text-gray-500 text-lg" />
            <button
              onClick={() => setFilter('all')}
              className={`px-5 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-5 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                filter === 'active'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('closed')}
              className={`px-5 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                filter === 'closed'
                  ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Closed
            </button>
          </div>
        </div>
      </motion.div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl shadow-xl p-16 text-center"
        >
          <div className="inline-block p-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-6">
            <FaBriefcase className="text-6xl text-white" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-3">No jobs found</h3>
          <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
            {searchQuery || filter !== 'all' 
              ? 'Try adjusting your filters or search terms' 
              : 'Start building your dream team by posting your first job!'}
          </p>
          {!searchQuery && filter === 'all' && (
            <button
              onClick={() => navigate('/recruiter/post-job')}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:shadow-2xl transition-all transform hover:scale-105 font-bold text-lg"
            >
              <FaRocket className="text-xl" /> Post Your First Job
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {filteredJobs.map((job, index) => (
            <motion.div 
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all border-2 border-transparent hover:border-purple-200"
            >
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                      <FaBriefcase className="text-2xl text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{job.title}</h3>
                        <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-md ${
                          job.status === 'active' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' :
                          job.status === 'closed' ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white' :
                          'bg-gradient-to-r from-yellow-500 to-orange-600 text-white'
                        }`}>
                          {job.status ? job.status.charAt(0).toUpperCase() + job.status.slice(1) : 'Unknown'}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-4 line-clamp-2 leading-relaxed">{job.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-3">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <FaMapMarkerAlt className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-blue-600 font-semibold">Location</p>
                        <p className="text-sm font-bold text-gray-900">{job.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-3">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <FaDollarSign className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-green-600 font-semibold">Salary Range</p>
                        <p className="text-sm font-bold text-gray-900">${job.salary_min?.toLocaleString()} - ${job.salary_max?.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-3">
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <FaUsers className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-purple-600 font-semibold">Applications</p>
                        <p className="text-sm font-bold text-gray-900">{job.application_count || 0} Received</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex lg:flex-col gap-3">
                  <button
                    onClick={() => navigate(`/recruiter/applicants/${job.id}`)}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-3 rounded-xl hover:shadow-lg transition-all transform hover:scale-105 font-semibold"
                  >
                    <FaEye /> View Applicants
                  </button>
                  <button
                    onClick={() => navigate(`/recruiter/post-job?edit=${job.id}`)}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-3 rounded-xl hover:shadow-lg transition-all transform hover:scale-105 font-semibold"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleStatusToggle(job.id, job.status)}
                    className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl hover:shadow-lg transition-all transform hover:scale-105 font-semibold ${
                      job.status === 'active'
                        ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white'
                        : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                    }`}
                  >
                    <FaClock /> {job.status === 'active' ? 'Close' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDeleteClick(job)}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-5 py-3 rounded-xl hover:shadow-lg transition-all transform hover:scale-105 font-semibold"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Delete Confirmation Modal - Enhanced */}
      {showDeleteModal && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-full">
                <FaTrash className="text-4xl text-white" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4 text-center">Delete Job?</h3>
            <p className="text-gray-700 mb-2 text-center text-lg">
              Are you sure you want to delete
            </p>
            <p className="text-purple-600 font-bold text-xl mb-4 text-center">
              "{jobToDelete?.title}"
            </p>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
              <p className="text-red-800 text-sm">
                ⚠️ This action cannot be undone. All associated applications will be affected.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 rounded-xl hover:shadow-xl transition-all transform hover:scale-105 font-bold"
              >
                Delete Job
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setJobToDelete(null);
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-4 rounded-xl hover:bg-gray-300 transition-all font-bold"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
    </Layout>
  );
};

export default ManageJobs;
