import { useState, useEffect } from 'react';
import { FaBriefcase, FaEdit, FaTrash, FaEye, FaUsers, FaMapMarkerAlt, FaDollarSign, FaClock, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
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
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-gray-900">Manage Jobs</h1>
        <button
          onClick={() => navigate('/recruiter/post-job')}
          className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
        >
          <FaPlus /> Post New Job
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Jobs</p>
              <p className="text-3xl font-bold mt-2">{stats.total}</p>
            </div>
            <FaBriefcase className="text-4xl opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Active</p>
              <p className="text-3xl font-bold mt-2">{stats.active}</p>
            </div>
            <FaClock className="text-4xl opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Closed</p>
              <p className="text-3xl font-bold mt-2">{stats.closed}</p>
            </div>
            <FaBriefcase className="text-4xl opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Draft</p>
              <p className="text-3xl font-bold mt-2">{stats.draft}</p>
            </div>
            <FaEdit className="text-4xl opacity-80" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('closed')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === 'closed'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Closed
            </button>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <FaBriefcase className="text-6xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-gray-700 mb-2">No jobs found</h3>
          <p className="text-gray-500 mb-6">Start by posting your first job!</p>
          <button
            onClick={() => navigate('/recruiter/post-job')}
            className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
          >
            <FaPlus className="inline mr-2" /> Post a Job
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-gray-900">{job.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      job.status === 'active' ? 'bg-green-100 text-green-800' :
                      job.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {job.status ? job.status.charAt(0).toUpperCase() + job.status.slice(1) : 'Unknown'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-primary-600" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaDollarSign className="text-green-600" />
                      <span>${job.salary_min?.toLocaleString()} - ${job.salary_max?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaUsers className="text-blue-600" />
                      <span>{job.application_count || 0} Applications</span>
                    </div>
                  </div>
                  <p className="text-gray-700 line-clamp-2">{job.description}</p>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => navigate(`/recruiter/applicants/${job.id}`)}
                    className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-all"
                  >
                    <FaEye /> View Applicants
                  </button>
                  <button
                    onClick={() => navigate(`/recruiter/post-job?edit=${job.id}`)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleStatusToggle(job.id, job.status)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      job.status === 'active'
                        ? 'bg-gray-600 text-white hover:bg-gray-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    <FaClock /> {job.status === 'active' ? 'Close' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDeleteClick(job)}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Delete Job?</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <strong>{jobToDelete?.title}</strong>? This action cannot be undone and all associated applications will be affected.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all"
              >
                Delete Job
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setJobToDelete(null);
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </Layout>
  );
};

export default ManageJobs;
