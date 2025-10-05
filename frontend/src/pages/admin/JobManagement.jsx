import { useState, useEffect } from 'react';
import { FaBriefcase, FaSearch, FaCheck, FaTimes, FaTrash, FaEye, FaMapMarkerAlt, FaBuilding } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const JobManagement = () => {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/admin/jobs');
      setJobs(response.data || []);
    } catch (error) {
      console.error('Failed to load jobs:', error);
      setJobs([]);
      // Don't show error toast - just show empty state
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (jobId) => {
    try {
      await api.put(`/admin/jobs/${jobId}/approve`);
      toast.success('Job approved successfully!');
      fetchJobs();
    } catch (error) {
      toast.error('Failed to approve job');
    }
  };

  const handleReject = async (jobId) => {
    try {
      await api.put(`/admin/jobs/${jobId}/reject`);
      toast.success('Job rejected successfully!');
      fetchJobs();
    } catch (error) {
      toast.error('Failed to reject job');
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await api.delete(`/admin/jobs/${jobId}`);
      toast.success('Job deleted successfully!');
      fetchJobs();
    } catch (error) {
      toast.error('Failed to delete job');
    }
  };

  const filteredJobs = jobs
    .filter(job => statusFilter === 'all' || job.status === statusFilter)
    .filter(job =>
      job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const stats = {
    total: jobs.length,
    active: jobs.filter(j => j.status === 'active').length,
    pending: jobs.filter(j => j.status === 'pending').length,
    closed: jobs.filter(j => j.status === 'closed').length,
    rejected: jobs.filter(j => j.status === 'rejected').length
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Job Management</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-4 text-white">
          <p className="text-sm opacity-90">Total Jobs</p>
          <p className="text-2xl font-bold mt-1">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl shadow-lg p-4 text-white">
          <p className="text-sm opacity-90">Active</p>
          <p className="text-2xl font-bold mt-1">{stats.active}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-xl shadow-lg p-4 text-white">
          <p className="text-sm opacity-90">Pending</p>
          <p className="text-2xl font-bold mt-1">{stats.pending}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl shadow-lg p-4 text-white">
          <p className="text-sm opacity-90">Closed</p>
          <p className="text-2xl font-bold mt-1">{stats.closed}</p>
        </div>
        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl shadow-lg p-4 text-white">
          <p className="text-sm opacity-90">Rejected</p>
          <p className="text-2xl font-bold mt-1">{stats.rejected}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="closed">Closed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
              <tr>
                <th className="px-6 py-4 text-left">Job Title</th>
                <th className="px-6 py-4 text-left">Company</th>
                <th className="px-6 py-4 text-left">Location</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Applications</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <FaBriefcase className="mx-auto text-5xl text-gray-300 mb-3" />
                    No jobs found
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr key={job.job_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{job.title}</p>
                        <p className="text-sm text-gray-600">{job.job_type}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FaBuilding className="text-gray-400" />
                        <span className="text-gray-700">{job.company_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FaMapMarkerAlt className="text-red-500" />
                        <span className="text-gray-700">{job.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        job.status === 'active' ? 'bg-green-100 text-green-800' :
                        job.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        job.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {job.application_count || 0} applications
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        {job.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(job.job_id)}
                              className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-all text-sm"
                            >
                              <FaCheck /> Approve
                            </button>
                            <button
                              onClick={() => handleReject(job.job_id)}
                              className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-all text-sm"
                            >
                              <FaTimes /> Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(job.job_id)}
                          className="flex items-center gap-1 bg-gray-600 text-white px-3 py-1 rounded-lg hover:bg-gray-700 transition-all text-sm"
                        >
                          <FaTrash /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JobManagement;
