import { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaDownload, FaBriefcase, FaGraduationCap, FaStar, FaArrowLeft, FaCheckCircle, FaTimesCircle, FaCalendar, FaFileAlt, FaUserTie, FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';
import Layout from '../../components/Layout';

const ApplicantProfile = () => {
  const [loading, setLoading] = useState(true);
  const [applicant, setApplicant] = useState(null);
  const [application, setApplication] = useState(null);
  const { applicantId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplicantData();
  }, [applicantId]);

  const fetchApplicantData = async () => {
    try {
      console.log('Fetching applicant data for application ID:', applicantId);
      const response = await api.get(`/applications/${applicantId}/details`);
      console.log('Application data received:', response.data);
      setApplication(response.data.application);
      setApplicant(response.data.applicant);
    } catch (error) {
      console.error('Failed to load applicant profile:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.error || 'Failed to load applicant profile');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.put(`/applications/${applicantId}/status`, { status: newStatus });
      toast.success('Application status updated successfully!');
      fetchApplicantData();
    } catch (error) {
      toast.error('Failed to update status');
      console.error('Status update error:', error);
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
      pending: 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-lg shadow-yellow-200',
      reviewing: 'bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-lg shadow-blue-200',
      shortlisted: 'bg-gradient-to-r from-purple-400 to-purple-500 text-white shadow-lg shadow-purple-200',
      interview: 'bg-gradient-to-r from-indigo-400 to-indigo-500 text-white shadow-lg shadow-indigo-200',
      hired: 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-lg shadow-green-200',
      rejected: 'bg-gradient-to-r from-red-400 to-red-500 text-white shadow-lg shadow-red-200'
    };
    return (
      <span className={`px-5 py-2 rounded-full text-sm font-bold ${statusStyles[status] || 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getProficiencyColor = (level) => {
    const colors = {
      beginner: 'from-blue-400 to-blue-500',
      intermediate: 'from-purple-400 to-purple-500',
      advanced: 'from-green-400 to-green-500',
      expert: 'from-yellow-400 to-yellow-500'
    };
    return colors[level?.toLowerCase()] || 'from-gray-400 to-gray-500';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-semibold">Loading applicant profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!applicant || !application) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 p-6">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6 font-semibold transition-all hover:gap-3"
            >
              <FaArrowLeft /> Back to Applicants
            </button>
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
              <div className="text-8xl mb-6">⚠️</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Applicant Profile Not Found</h2>
              <p className="text-gray-600 text-lg">Unable to load the applicant's profile. Please try again or contact support.</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4 font-semibold transition-all hover:gap-3"
            >
              <FaArrowLeft /> Back to Applicants
            </button>
            <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              Applicant Profile
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile Summary */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Card */}
              <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:scale-105 transition-all duration-300">
                <div className="flex flex-col items-center">
                  {applicant?.profile_image_url ? (
                    <img 
                      src={applicant.profile_image_url} 
                      alt={applicant.full_name}
                      className="w-36 h-36 rounded-full object-cover border-4 border-primary-200 shadow-xl mb-4"
                    />
                  ) : (
                    <div className="w-36 h-36 bg-gradient-to-br from-primary-500 via-primary-600 to-purple-600 rounded-full flex items-center justify-center text-white text-6xl font-bold mb-4 shadow-xl">
                      {applicant?.full_name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <h2 className="text-2xl font-bold text-gray-900 mb-1 text-center">{applicant?.full_name}</h2>
                  <p className="text-gray-600 mb-4 text-center flex items-center gap-2">
                    <FaUserTie className="text-primary-600" />
                    {applicant?.headline || 'Job Seeker'}
                  </p>
                  <div className="mb-4">
                    {application && getStatusBadge(application.status)}
                  </div>
                </div>

                {/* Bio */}
                {applicant?.bio && (
                  <div className="mt-6 p-4 bg-gradient-to-br from-primary-50 to-purple-50 rounded-xl">
                    <p className="text-sm text-gray-700 italic">"{applicant.bio}"</p>
                  </div>
                )}

                {/* Contact Info */}
                <div className="mt-6 space-y-4 border-t pt-6">
                  <div className="flex items-center gap-3 text-gray-700 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                      <FaEnvelope className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-semibold break-all">{applicant?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <FaPhone className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm font-semibold">{applicant?.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                      <FaMapMarkerAlt className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="text-sm font-semibold">{applicant?.location || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Download Resume */}
                {applicant?.resume_url && (
                  <button
                    onClick={handleDownloadResume}
                    className="w-full mt-6 flex items-center justify-center gap-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white px-6 py-4 rounded-xl hover:shadow-2xl transition-all transform hover:scale-105 font-semibold"
                  >
                    <FaDownload className="text-lg" /> Download Resume
                  </button>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                  <FaCheckCircle className="text-primary-600" />
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => handleStatusChange('shortlisted')}
                    disabled={application?.status === 'shortlisted'}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-3 rounded-xl hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold"
                  >
                    <FaStar /> Shortlist Candidate
                  </button>
                  <button
                    onClick={() => handleStatusChange('interview')}
                    disabled={application?.status === 'interview'}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-4 py-3 rounded-xl hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold"
                  >
                    <FaBriefcase /> Schedule Interview
                  </button>
                  <button
                    onClick={() => handleStatusChange('hired')}
                    disabled={application?.status === 'hired'}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-xl hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold"
                  >
                    <FaCheckCircle /> Hire Candidate
                  </button>
                  <button
                    onClick={() => handleStatusChange('rejected')}
                    disabled={application?.status === 'rejected'}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-xl hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold"
                  >
                    <FaTimesCircle /> Reject Application
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Detailed Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Application Details */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <FaFileAlt className="text-white" />
                  </div>
                  Application Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                    <p className="text-sm text-blue-600 font-semibold mb-1 flex items-center gap-2">
                      <FaBriefcase /> Applied For
                    </p>
                    <p className="font-bold text-gray-900 text-lg">{application?.job_title}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                    <p className="text-sm text-green-600 font-semibold mb-1 flex items-center gap-2">
                      <FaCalendar /> Applied On
                    </p>
                    <p className="font-bold text-gray-900 text-lg">
                      {new Date(application?.applied_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  {application?.cover_letter && (
                    <div className="md:col-span-2 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                      <p className="text-sm text-purple-600 font-semibold mb-3 flex items-center gap-2">
                        <FaFileAlt /> Cover Letter
                      </p>
                      <div className="bg-white rounded-lg p-4 shadow-inner">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {application.cover_letter}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Skills */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center">
                    <FaStar className="text-white" />
                  </div>
                  Skills & Expertise
                </h3>
                <div className="flex flex-wrap gap-3">
                  {applicant?.skills && applicant.skills.length > 0 ? (
                    applicant.skills.map((skill, index) => (
                      <div
                        key={index}
                        className={`group px-5 py-3 bg-gradient-to-r ${getProficiencyColor(skill.proficiency_level)} text-white rounded-xl font-semibold shadow-lg transform hover:scale-110 transition-all cursor-pointer`}
                      >
                        <span className="flex items-center gap-2">
                          {skill.skill_name}
                          {skill.proficiency_level && (
                            <span className="text-xs bg-white bg-opacity-30 px-2 py-1 rounded-full">
                              {skill.proficiency_level}
                            </span>
                          )}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No skills listed</p>
                  )}
                </div>
              </div>

              {/* Experience */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                    <FaBriefcase className="text-white" />
                  </div>
                  Work Experience
                </h3>
                {applicant?.experience && applicant.experience.length > 0 ? (
                  <div className="space-y-6">
                    {applicant.experience.map((exp, index) => (
                      <div key={index} className="relative pl-8 pb-6 border-l-4 border-primary-500 last:pb-0">
                        <div className="absolute -left-3 top-0 w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full border-4 border-white shadow-lg"></div>
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 hover:shadow-lg transition-all">
                          <h4 className="font-bold text-xl text-gray-900 mb-1">{exp.job_title}</h4>
                          <p className="text-primary-600 font-semibold mb-2">{exp.company_name}</p>
                          <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                            <FaClock className="text-gray-400" />
                            {exp.start_date} - {exp.end_date || 'Present'}
                          </p>
                          {exp.description && (
                            <p className="text-gray-700 leading-relaxed">{exp.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No work experience listed</p>
                )}
              </div>

              {/* Education */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <FaGraduationCap className="text-white" />
                  </div>
                  Education
                </h3>
                {applicant?.education && applicant.education.length > 0 ? (
                  <div className="space-y-6">
                    {applicant.education.map((edu, index) => (
                      <div key={index} className="relative pl-8 pb-6 border-l-4 border-green-500 last:pb-0">
                        <div className="absolute -left-3 top-0 w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full border-4 border-white shadow-lg"></div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 hover:shadow-lg transition-all">
                          <h4 className="font-bold text-xl text-gray-900 mb-1">{edu.degree}</h4>
                          <p className="text-green-600 font-semibold mb-2">{edu.institution}</p>
                          <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                            <FaClock className="text-gray-400" />
                            {edu.start_date} - {edu.end_date || 'Present'}
                          </p>
                          {edu.grade && (
                            <div className="inline-block bg-white px-4 py-2 rounded-lg shadow-sm">
                              <p className="text-gray-700">
                                <span className="font-semibold">Grade:</span> {edu.grade}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No education listed</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ApplicantProfile;
