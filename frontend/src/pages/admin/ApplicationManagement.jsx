import { useState, useEffect } from 'react';
import { FaFileAlt, FaSearch, FaUser, FaBriefcase, FaFilter } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const ApplicationManagement = () => {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/admin/applications');
      setApplications(response.data);
    } catch (error) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewing: 'bg-blue-100 text-blue-800',
      shortlisted: 'bg-purple-100 text-purple-800',
      interview: 'bg-indigo-100 text-indigo-800',
      hired: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredApplications = applications
    .filter(app => statusFilter === 'all' || app.status === statusFilter)
    .filter(app =>
      app.applicant_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job_title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    reviewing: applications.filter(a => a.status === 'reviewing').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    interview: applications.filter(a => a.status === 'interview').length,
    hired: applications.filter(a => a.status === 'hired').length,
    rejected: applications.filter(a => a.status === 'rejected').length
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
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Application Management</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-4 text-white">
          <p className="text-sm opacity-90">Total</p>
          <p className="text-2xl font-bold mt-1">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-xl shadow-lg p-4 text-white">
          <p className="text-sm opacity-90">Pending</p>
          <p className="text-2xl font-bold mt-1">{stats.pending}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 text-white">
          <p className="text-sm opacity-90">Reviewing</p>
          <p className="text-2xl font-bold mt-1">{stats.reviewing}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl shadow-lg p-4 text-white">
          <p className="text-sm opacity-90">Shortlisted</p>
          <p className="text-2xl font-bold mt-1">{stats.shortlisted}</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl shadow-lg p-4 text-white">
          <p className="text-sm opacity-90">Interview</p>
          <p className="text-2xl font-bold mt-1">{stats.interview}</p>
        </div>
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl shadow-lg p-4 text-white">
          <p className="text-sm opacity-90">Hired</p>
          <p className="text-2xl font-bold mt-1">{stats.hired}</p>
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
              placeholder="Search by applicant or job title..."
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
            <option value="pending">Pending</option>
            <option value="reviewing">Reviewing</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interview">Interview</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
              <tr>
                <th className="px-6 py-4 text-left">Applicant</th>
                <th className="px-6 py-4 text-left">Job Title</th>
                <th className="px-6 py-4 text-left">Company</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Applied Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <FaFileAlt className="mx-auto text-5xl text-gray-300 mb-3" />
                    No applications found
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => (
                  <tr key={app.application_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center text-white font-bold">
                          {app.applicant_name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{app.applicant_name}</p>
                          <p className="text-sm text-gray-600">{app.applicant_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FaBriefcase className="text-blue-600" />
                        <span className="font-medium text-gray-900">{app.job_title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{app.company_name}</td>
                    <td className="px-6 py-4">{getStatusBadge(app.status)}</td>
                    <td className="px-6 py-4 text-gray-700">
                      {new Date(app.applied_at).toLocaleDateString()}
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

export default ApplicationManagement;
