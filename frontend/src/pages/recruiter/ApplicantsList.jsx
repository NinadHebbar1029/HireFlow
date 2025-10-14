import { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaEye, FaFilter, FaBriefcase, FaUsers, FaClock, FaCheckCircle, FaTimesCircle, FaStar, FaRocket, FaSearch, FaCalendar, FaChartLine } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import Layout from '../../components/Layout';

const ApplicantsList = () => {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const { jobId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, [jobId]);

  const fetchApplications = async () => {
    try {
      const endpoint = jobId 
        ? `/applications/job/${jobId}`
        : '/recruiters/applications';
      const response = await api.get(endpoint);
      setApplications(response.data);
    } catch (error) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const appId = selectedApplication.id || selectedApplication.application_id;
      
      await api.put(`/applications/${appId}/status`, {
        status: newStatus
      });
      toast.success('Application status updated!');
      fetchApplications();
      setShowStatusModal(false);
      setSelectedApplication(null);
    } catch (error) {
      toast.error('Failed to update status');
      console.error('Status update error:', error);
      console.error('Error response:', error.response?.data);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white',
      reviewing: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
      shortlisted: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
      interview: 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white',
      hired: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white',
      rejected: 'bg-gradient-to-r from-red-500 to-red-600 text-white'
    };
    return (
      <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-lg ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredApplications = applications
    .filter(app => statusFilter === 'all' || app.status === statusFilter)
    .filter(app => 
      app.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job_title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    interviewed: applications.filter(a => a.status === 'interview').length,
    hired: applications.filter(a => a.status === 'hired').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col justify-center items-center h-screen">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <FaUsers className="text-6xl text-primary-600 mb-4" />
          </motion.div>
          <p className="text-gray-600 text-lg font-semibold">Loading applicants...</p>
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
          <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden group">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 bg-cyan-300 opacity-5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                  <FaUsers className="text-3xl" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black">
                  {jobId ? 'Job Applicants' : 'All Applicants'}
                </h1>
              </div>
              <p className="text-lg text-white text-opacity-90 ml-1">
                Review and manage candidate applications
              </p>
            </div>
          </div>
        </motion.div>

      {/* Stats Cards - Enhanced */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8"
      >
        <div className="group relative bg-white rounded-2xl shadow-xl p-5 hover:shadow-2xl transition-all overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10 group-hover:text-white transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg group-hover:bg-white group-hover:bg-opacity-20">
                <FaChartLine className="text-xl text-white" />
              </div>
            </div>
            <p className="text-xs font-semibold text-gray-600 group-hover:text-white group-hover:text-opacity-90">Total</p>
            <p className="text-3xl font-black mt-1">{stats.total}</p>
          </div>
        </div>

        <div className="group relative bg-white rounded-2xl shadow-xl p-5 hover:shadow-2xl transition-all overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10 group-hover:text-white transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg shadow-lg group-hover:bg-white group-hover:bg-opacity-20">
                <FaClock className="text-xl text-white" />
              </div>
            </div>
            <p className="text-xs font-semibold text-gray-600 group-hover:text-white group-hover:text-opacity-90">Pending</p>
            <p className="text-3xl font-black mt-1">{stats.pending}</p>
          </div>
        </div>

        <div className="group relative bg-white rounded-2xl shadow-xl p-5 hover:shadow-2xl transition-all overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10 group-hover:text-white transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg group-hover:bg-white group-hover:bg-opacity-20">
                <FaStar className="text-xl text-white" />
              </div>
            </div>
            <p className="text-xs font-semibold text-gray-600 group-hover:text-white group-hover:text-opacity-90">Shortlisted</p>
            <p className="text-3xl font-black mt-1">{stats.shortlisted}</p>
          </div>
        </div>

        <div className="group relative bg-white rounded-2xl shadow-xl p-5 hover:shadow-2xl transition-all overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10 group-hover:text-white transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-lg group-hover:bg-white group-hover:bg-opacity-20">
                <FaUsers className="text-xl text-white" />
              </div>
            </div>
            <p className="text-xs font-semibold text-gray-600 group-hover:text-white group-hover:text-opacity-90">Interview</p>
            <p className="text-3xl font-black mt-1">{stats.interviewed}</p>
          </div>
        </div>

        <div className="group relative bg-white rounded-2xl shadow-xl p-5 hover:shadow-2xl transition-all overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10 group-hover:text-white transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg group-hover:bg-white group-hover:bg-opacity-20">
                <FaCheckCircle className="text-xl text-white" />
              </div>
            </div>
            <p className="text-xs font-semibold text-gray-600 group-hover:text-white group-hover:text-opacity-90">Hired</p>
            <p className="text-3xl font-black mt-1">{stats.hired}</p>
          </div>
        </div>

        <div className="group relative bg-white rounded-2xl shadow-xl p-5 hover:shadow-2xl transition-all overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10 group-hover:text-white transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg group-hover:bg-white group-hover:bg-opacity-20">
                <FaTimesCircle className="text-xl text-white" />
              </div>
            </div>
            <p className="text-xs font-semibold text-gray-600 group-hover:text-white group-hover:text-opacity-90">Rejected</p>
            <p className="text-3xl font-black mt-1">{stats.rejected}</p>
          </div>
        </div>
      </motion.div>

      {/* Filters - Enhanced */}
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
              placeholder="Search by name, email, or job title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-700 font-medium"
            />
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <FaFilter className="text-gray-500 text-lg" />
            {['all', 'pending', 'shortlisted', 'interview', 'hired', 'rejected'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                  statusFilter === status
                    ? status === 'all' 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : status === 'hired'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                      : status === 'rejected'
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                      : status === 'pending'
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg'
                      : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Applicants List */}
      {filteredApplications.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl shadow-xl p-16 text-center"
        >
          <div className="inline-block p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-6">
            <FaUsers className="text-6xl text-white" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-3">No applications found</h3>
          <p className="text-gray-600 text-lg">Try adjusting your filters or search query</p>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {filteredApplications.map((application, index) => (
            <motion.div 
              key={application.application_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all border-2 border-transparent hover:border-indigo-200"
            >
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg group-hover:scale-110 transition-transform">
                        {application.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{application.full_name}</h3>
                        {getStatusBadge(application.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                        <FaBriefcase className="text-indigo-500" />
                        <span>Applied for: <span className="font-semibold text-gray-900">{application.job_title}</span></span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-3">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <FaEnvelope className="text-white" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs text-blue-600 font-semibold">Email</p>
                        <p className="text-sm font-bold text-gray-900 truncate">{application.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-3">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <FaPhone className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-green-600 font-semibold">Phone</p>
                        <p className="text-sm font-bold text-gray-900">{application.phone || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-3">
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <FaCalendar className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-purple-600 font-semibold">Applied On</p>
                        <p className="text-sm font-bold text-gray-900">{new Date(application.applied_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex lg:flex-col gap-3">
                  <button
                    onClick={() => navigate(`/recruiter/applicant/${application.application_id}`)}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-3 rounded-xl hover:shadow-lg transition-all transform hover:scale-105 font-semibold"
                  >
                    <FaEye /> View Profile
                  </button>
                  <button
                    onClick={() => {
                      setSelectedApplication(application);
                      setShowStatusModal(true);
                    }}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-3 rounded-xl hover:shadow-lg transition-all transform hover:scale-105 font-semibold"
                  >
                    <FaFilter /> Update Status
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Status Update Modal - Enhanced */}
      {showStatusModal && selectedApplication && (
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
              <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full">
                <FaFilter className="text-4xl text-white" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2 text-center">Update Status</h3>
            <p className="text-gray-600 mb-2 text-center">
              <strong className="text-indigo-600 text-lg">{selectedApplication.full_name}</strong>
            </p>
            <div className="flex justify-center mb-6">
              {getStatusBadge(selectedApplication.status)}
            </div>
            <div className="space-y-3 mb-6">
              {['pending', 'reviewing', 'shortlisted', 'interview', 'hired', 'rejected'].map(status => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={status === selectedApplication.status}
                  className={`w-full px-5 py-4 rounded-xl font-bold transition-all transform hover:scale-105 ${
                    status === selectedApplication.status
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : status === 'hired'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl'
                      : status === 'rejected'
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl'
                      : status === 'pending'
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg hover:shadow-xl'
                      : status === 'shortlisted'
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl'
                      : status === 'interview'
                      ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setShowStatusModal(false);
                setSelectedApplication(null);
              }}
              className="w-full bg-gray-200 text-gray-700 px-6 py-4 rounded-xl hover:bg-gray-300 transition-all font-bold"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
    </Layout>
  );
};

export default ApplicantsList;
