import { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaEye, FaFilter, FaBriefcase } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
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
      await api.put(`/applications/${selectedApplication.application_id}`, {
        status: newStatus
      });
      toast.success('Application status updated!');
      fetchApplications();
      setShowStatusModal(false);
      setSelectedApplication(null);
    } catch (error) {
      toast.error('Failed to update status');
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
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        {jobId ? 'Job Applicants' : 'All Applicants'}
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-4 text-white">
          <p className="text-sm opacity-90">Total</p>
          <p className="text-2xl font-bold mt-1">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-xl shadow-lg p-4 text-white">
          <p className="text-sm opacity-90">Pending</p>
          <p className="text-2xl font-bold mt-1">{stats.pending}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl shadow-lg p-4 text-white">
          <p className="text-sm opacity-90">Shortlisted</p>
          <p className="text-2xl font-bold mt-1">{stats.shortlisted}</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl shadow-lg p-4 text-white">
          <p className="text-sm opacity-90">Interview</p>
          <p className="text-2xl font-bold mt-1">{stats.interviewed}</p>
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
          <input
            type="text"
            placeholder="Search by name, email, or job title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
          />
          <div className="flex gap-2 flex-wrap">
            {['all', 'pending', 'shortlisted', 'interview', 'hired', 'rejected'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  statusFilter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Applicants List */}
      {filteredApplications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <FaUser className="text-6xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-gray-700 mb-2">No applications found</h3>
          <p className="text-gray-500">Try adjusting your filters or search query</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <div key={application.application_id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {application.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{application.full_name}</h3>
                      <p className="text-sm text-gray-600">
                        Applied for: <span className="font-semibold">{application.job_title}</span>
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <FaEnvelope className="text-primary-600" />
                      <span>{application.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaPhone className="text-green-600" />
                      <span>{application.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaBriefcase className="text-blue-600" />
                      <span>Applied {new Date(application.applied_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    {getStatusBadge(application.status)}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => navigate(`/recruiter/applicant/${application.application_id}`)}
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
                  >
                    <FaEye /> View Profile
                  </button>
                  <button
                    onClick={() => {
                      setSelectedApplication(application);
                      setShowStatusModal(true);
                    }}
                    className="flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-all"
                  >
                    <FaFilter /> Update Status
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Update Application Status</h3>
            <p className="text-gray-700 mb-6">
              Applicant: <strong>{selectedApplication.full_name}</strong><br />
              Current Status: {getStatusBadge(selectedApplication.status)}
            </p>
            <div className="space-y-2 mb-6">
              {['pending', 'reviewing', 'shortlisted', 'interview', 'hired', 'rejected'].map(status => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={status === selectedApplication.status}
                  className={`w-full px-4 py-3 rounded-lg transition-all ${
                    status === selectedApplication.status
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : status === 'hired'
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : status === 'rejected'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
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
              className="w-full bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
    </Layout>
  );
};

export default ApplicantsList;
