import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaMapMarkerAlt, FaBriefcase, FaDollarSign, FaCalendar, FaBuilding, FaBookmark, FaRegBookmark, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import api from '../../utils/api';
import Layout from '../../components/Layout';

const JobDetails = () => {
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobDetails();
    checkIfSaved();
    checkIfApplied();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching job details for ID:', id);
      const response = await api.get(`/jobs/${id}`);
      console.log('Job details received:', response.data);
      setJob(response.data);
    } catch (error) {
      console.error('Failed to fetch job details:', error);
      toast.error('Failed to load job details');
      navigate('/job-seeker/jobs');
    } finally {
      setLoading(false);
    }
  };

  const checkIfSaved = async () => {
    try {
      const response = await api.get('/applications/saved/my-saved-jobs');
      setIsSaved(response.data.some(job => job.job_id === parseInt(id)));
    } catch (error) {
      console.error('Failed to check saved status');
    }
  };

  const checkIfApplied = async () => {
    try {
      const response = await api.get('/applications/my-applications');
      setHasApplied(response.data.some(app => app.job_id === parseInt(id)));
    } catch (error) {
      console.error('Failed to check application status');
    }
  };

  const toggleSaveJob = async () => {
    try {
      if (isSaved) {
        await api.delete(`/applications/save-job/${id}`);
        setIsSaved(false);
        toast.success('Job unsaved');
      } else {
        await api.post('/applications/save-job', { job_id: id });
        setIsSaved(true);
        toast.success('Job saved!');
      }
    } catch (error) {
      toast.error('Failed to save job');
    }
  };

  const handleApply = () => {
    navigate(`/job-seeker/apply/${id}`);
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

  if (!job) {
    return null;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <button
            onClick={() => navigate('/job-seeker/jobs')}
            className="mb-6 flex items-center text-primary-600 hover:text-primary-700 font-medium"
          >
            <FaArrowLeft className="mr-2" /> Back to Search
          </button>

          {/* Main Job Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-8">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold mb-4">{job.title}</h1>
                  <div className="flex items-center space-x-2 mb-4">
                    <FaBuilding className="text-primary-200" />
                    <span className="text-xl text-primary-100">{job.company_name}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-primary-100">
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="mr-2" />
                      {job.location}
                    </div>
                    <div className="flex items-center">
                      <FaBriefcase className="mr-2" />
                      {job.job_type?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                    {(job.salary_min || job.salary_max) && (
                      <div className="flex items-center">
                        <FaDollarSign className="mr-2" />
                        ${job.salary_min?.toLocaleString()} - ${job.salary_max?.toLocaleString()}
                      </div>
                    )}
                    <div className="flex items-center">
                      <FaCalendar className="mr-2" />
                      Posted {new Date(job.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={toggleSaveJob}
                    className="p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-colors"
                  >
                    {isSaved ? (
                      <FaBookmark className="text-white text-2xl" />
                    ) : (
                      <FaRegBookmark className="text-white text-2xl" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 bg-gray-50 border-b">
              <div className="flex items-center justify-between">
                {hasApplied ? (
                  <div className="flex items-center text-green-600 font-semibold text-lg">
                    <FaCheckCircle className="mr-2 text-2xl" />
                    Application Submitted
                  </div>
                ) : (
                  <button
                    onClick={handleApply}
                    className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 font-bold text-lg shadow-lg transform hover:scale-105 transition-all"
                  >
                    Apply Now
                  </button>
                )}
                <button
                  onClick={toggleSaveJob}
                  className="px-6 py-3 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 font-medium flex items-center"
                >
                  {isSaved ? (
                    <>
                      <FaBookmark className="mr-2" /> Saved
                    </>
                  ) : (
                    <>
                      <FaRegBookmark className="mr-2" /> Save Job
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Job Details */}
            <div className="p-8">
              {/* Job Description */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Description</h2>
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {job.description}
                </div>
              </div>

              {/* Requirements */}
              {job.requirements && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements</h2>
                  <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {job.requirements}
                  </div>
                </div>
              )}

              {/* Required Skills */}
              {job.required_skills && job.required_skills.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Required Skills</h2>
                  <div className="flex flex-wrap gap-3">
                    {job.required_skills.map((skill) => (
                      <span
                        key={skill.id}
                        className={`px-4 py-2 rounded-full font-medium shadow-sm ${
                          skill.is_mandatory 
                            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white' 
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {skill.name} {skill.is_mandatory && '*'}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">* Required skills</p>
                </div>
              )}

              {/* Company Info */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Company</h2>
                <div className="flex items-start">
                  <FaBuilding className="text-4xl text-primary-600 mr-4 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.company_name}</h3>
                    {job.company_description && (
                      <p className="text-gray-700 leading-relaxed">{job.company_description}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Apply CTA */}
          {!hasApplied && (
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-xl p-8 text-center text-white">
              <h3 className="text-3xl font-bold mb-4">Ready to Apply?</h3>
              <p className="text-primary-100 mb-6 text-lg">Join {job.company_name} and take the next step in your career</p>
              <button
                onClick={handleApply}
                className="px-10 py-4 bg-white text-primary-700 rounded-xl hover:bg-gray-100 font-bold text-lg shadow-lg transform hover:scale-105 transition-all"
              >
                Submit Your Application
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default JobDetails;
