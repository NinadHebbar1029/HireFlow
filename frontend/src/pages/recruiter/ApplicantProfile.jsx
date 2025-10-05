import { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaDownload, FaBriefcase, FaGraduationCap, FaStar, FaArrowLeft, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';

const ApplicantProfile = () => {
  const [loading, setLoading] = useState(true);
  const [applicant, setApplicant] = useState(null);
  const [application, setApplication] = useState(null);
  const { applicationId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplicantData();
  }, [applicationId]);

  const fetchApplicantData = async () => {
    try {
      const response = await api.get(`/applications/${applicationId}/details`);
      setApplication(response.data.application);
      setApplicant(response.data.applicant);
    } catch (error) {
      toast.error('Failed to load applicant profile');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.put(`/applications/${applicationId}`, { status: newStatus });
      toast.success('Application status updated!');
      fetchApplicantData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDownloadResume = () => {
    if (applicant?.resume_url) {
      window.open(applicant.resume_url, '_blank');
    } else {
      toast.error('Resume not available');
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
      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6 font-semibold"
      >
        <FaArrowLeft /> Back to Applicants
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Summary */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center text-white text-5xl font-bold mb-4">
                {applicant?.full_name?.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{applicant?.full_name}</h2>
              <p className="text-gray-600 mb-4">{applicant?.headline || 'Job Seeker'}</p>
              {application && getStatusBadge(application.status)}
            </div>

            <div className="mt-6 space-y-3 border-t pt-4">
              <div className="flex items-center gap-3 text-gray-700">
                <FaEnvelope className="text-primary-600" />
                <span className="text-sm">{applicant?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <FaPhone className="text-green-600" />
                <span className="text-sm">{applicant?.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <FaMapMarkerAlt className="text-red-600" />
                <span className="text-sm">{applicant?.location || 'N/A'}</span>
              </div>
            </div>

            {applicant?.resume_url && (
              <button
                onClick={handleDownloadResume}
                className="w-full mt-6 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
              >
                <FaDownload /> Download Resume
              </button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleStatusChange('shortlisted')}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all"
              >
                <FaStar /> Shortlist
              </button>
              <button
                onClick={() => handleStatusChange('interview')}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all"
              >
                <FaBriefcase /> Schedule Interview
              </button>
              <button
                onClick={() => handleStatusChange('hired')}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all"
              >
                <FaCheckCircle /> Hire
              </button>
              <button
                onClick={() => handleStatusChange('rejected')}
                className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all"
              >
                <FaTimesCircle /> Reject
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Detailed Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Application Details */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Application Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Applied For</p>
                <p className="font-semibold text-gray-900">{application?.job_title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Applied On</p>
                <p className="font-semibold text-gray-900">
                  {new Date(application?.applied_at).toLocaleDateString()}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 mb-2">Cover Letter</p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">
                    {application?.cover_letter || 'No cover letter provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaStar className="text-yellow-500" /> Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {applicant?.skills && applicant.skills.length > 0 ? (
                applicant.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-lg font-semibold"
                  >
                    {skill.skill_name}
                    {skill.proficiency && (
                      <span className="ml-2 text-xs opacity-75">• {skill.proficiency}</span>
                    )}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">No skills listed</p>
              )}
            </div>
          </div>

          {/* Experience */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaBriefcase className="text-primary-600" /> Experience
            </h3>
            {applicant?.experience && applicant.experience.length > 0 ? (
              <div className="space-y-4">
                {applicant.experience.map((exp, index) => (
                  <div key={index} className="border-l-4 border-primary-600 pl-4 py-2">
                    <h4 className="font-bold text-gray-900">{exp.job_title}</h4>
                    <p className="text-gray-600">{exp.company_name}</p>
                    <p className="text-sm text-gray-500">
                      {exp.start_date} - {exp.end_date || 'Present'}
                    </p>
                    {exp.description && (
                      <p className="text-gray-700 mt-2">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No experience listed</p>
            )}
          </div>

          {/* Education */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaGraduationCap className="text-green-600" /> Education
            </h3>
            {applicant?.education && applicant.education.length > 0 ? (
              <div className="space-y-4">
                {applicant.education.map((edu, index) => (
                  <div key={index} className="border-l-4 border-green-600 pl-4 py-2">
                    <h4 className="font-bold text-gray-900">{edu.degree}</h4>
                    <p className="text-gray-600">{edu.institution}</p>
                    <p className="text-sm text-gray-500">
                      {edu.start_date} - {edu.end_date || 'Present'}
                    </p>
                    {edu.grade && (
                      <p className="text-gray-700 mt-1">Grade: {edu.grade}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No education listed</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantProfile;
