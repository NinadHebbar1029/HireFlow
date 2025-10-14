import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaBriefcase, FaDollarSign, FaCalendar, FaBuilding, FaBookmark, FaRegBookmark, FaArrowLeft, FaCheckCircle, FaClock, FaUsers, FaChartLine, FaGraduationCap, FaLightbulb, FaShare } from 'react-icons/fa';
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
      const response = await api.get(`/jobs/${id}`);
      setJob(response.data);
    } catch (error) {
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

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: `Check out this job opportunity at ${job.company_name}`,
        url: url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/job-seeker/jobs')}
            className="mb-6 flex items-center text-gray-600 hover:text-primary-600 font-medium transition-colors group"
          >
            <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Search
          </motion.button>

          {/* Main Job Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8"
          >
            {/* Header Section with Gradient */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-8 relative overflow-hidden">
              {/* Decorative Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full translate-y-48 -translate-x-48"></div>
              </div>

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-4xl md:text-5xl font-bold mb-4 leading-tight"
                    >
                      {job.title}
                    </motion.h1>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center space-x-3 mb-6"
                    >
                      <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                        <FaBuilding className="text-2xl" />
                      </div>
                      <div>
                        <span className="text-2xl font-semibold">{job.company_name}</span>
                      </div>
                    </motion.div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col md:flex-row gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={toggleSaveJob}
                      className="p-4 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl transition-all backdrop-blur-sm"
                    >
                      {isSaved ? (
                        <FaBookmark className="text-white text-2xl" />
                      ) : (
                        <FaRegBookmark className="text-white text-2xl" />
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleShare}
                      className="p-4 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl transition-all backdrop-blur-sm"
                    >
                      <FaShare className="text-white text-2xl" />
                    </motion.button>
                  </div>
                </div>

                {/* Job Meta Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                  <div className="flex items-center space-x-3 bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4">
                    <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                      <FaMapMarkerAlt className="text-xl" />
                    </div>
                    <div>
                      <p className="text-xs text-indigo-100">Location</p>
                      <p className="font-semibold">{job.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4">
                    <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                      <FaBriefcase className="text-xl" />
                    </div>
                    <div>
                      <p className="text-xs text-indigo-100">Job Type</p>
                      <p className="font-semibold">{job.job_type?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                    </div>
                  </div>

                  {(job.salary_min || job.salary_max) && (
                    <div className="flex items-center space-x-3 bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4">
                      <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                        <FaDollarSign className="text-xl" />
                      </div>
                      <div>
                        <p className="text-xs text-indigo-100">Salary Range</p>
                        <p className="font-semibold">${job.salary_min?.toLocaleString()} - ${job.salary_max?.toLocaleString()}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3 bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4">
                    <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                      <FaCalendar className="text-xl" />
                    </div>
                    <div>
                      <p className="text-xs text-indigo-100">Posted</p>
                      <p className="font-semibold">{new Date(job.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Apply Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {hasApplied ? (
                  <div className="flex items-center text-green-600 font-semibold text-lg bg-green-50 px-6 py-3 rounded-xl">
                    <FaCheckCircle className="mr-3 text-2xl" />
                    Application Successfully Submitted
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleApply}
                    className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-bold text-lg shadow-lg transform transition-all flex items-center space-x-2"
                  >
                    <FaCheckCircle className="text-xl" />
                    <span>Apply Now</span>
                  </motion.button>
                )}

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleSaveJob}
                    className={`px-6 py-3 rounded-xl font-medium flex items-center space-x-2 transition-all ${
                      isSaved
                        ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-purple-300 hover:bg-purple-50'
                    }`}
                  >
                    {isSaved ? <FaBookmark className="text-lg" /> : <FaRegBookmark className="text-lg" />}
                    <span>{isSaved ? 'Saved' : 'Save Job'}</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleShare}
                    className="px-6 py-3 bg-white rounded-xl font-medium flex items-center space-x-2 border-2 border-gray-300 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                  >
                    <FaShare />
                    <span>Share</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Job Details Content */}
            <div className="p-8">
              {/* Job Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mb-8"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg">
                    <FaLightbulb className="text-2xl text-indigo-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Job Description</h2>
                </div>
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl">
                  {job.description}
                </div>
              </motion.div>

              {/* Requirements */}
              {job.requirements && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="mb-8"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                      <FaGraduationCap className="text-2xl text-purple-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Requirements</h2>
                  </div>
                  <div className="text-gray-700 whitespace-pre-wrap leading-relaxed bg-gradient-to-r from-gray-50 to-purple-50 p-6 rounded-xl">
                    {job.requirements}
                  </div>
                </motion.div>
              )}

              {/* Required Skills */}
              {job.required_skills && job.required_skills.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="mb-8"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg">
                      <FaChartLine className="text-2xl text-blue-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Required Skills</h2>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {job.required_skills.map((skill, index) => (
                      <motion.span
                        key={skill.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 + index * 0.05 }}
                        className={`px-5 py-3 rounded-full font-semibold shadow-md transition-transform hover:scale-105 ${
                          skill.is_mandatory 
                            ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white' 
                            : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700'
                        }`}
                      >
                        {skill.name} {skill.is_mandatory && '★'}
                      </motion.span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-3 flex items-center">
                    <span className="mr-2">★</span> Must-have skills
                  </p>
                </motion.div>
              )}

              {/* Company Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-8 mb-8 border border-purple-100 shadow-lg"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white">
                    <FaBuilding className="text-3xl" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">About the Company</h2>
                </div>
                <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-xl p-6">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
                    {job.company_name}
                  </h3>
                  {job.company_description ? (
                    <p className="text-gray-700 leading-relaxed text-lg">{job.company_description}</p>
                  ) : (
                    <p className="text-gray-500 italic">Company information not available</p>
                  )}
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-xl text-center">
                      <FaUsers className="text-3xl text-indigo-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Growing Team</p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl text-center">
                      <FaChartLine className="text-3xl text-purple-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Career Growth</p>
                    </div>
                    <div className="bg-gradient-to-r from-pink-50 to-red-50 p-4 rounded-xl text-center">
                      <FaClock className="text-3xl text-pink-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Work-Life Balance</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Bottom Apply CTA */}
          {!hasApplied && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-10 text-center text-white relative overflow-hidden"
            >
              {/* Decorative Background */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full"></div>
                <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-white rounded-full"></div>
              </div>

              <div className="relative z-10">
                <h3 className="text-4xl md:text-5xl font-bold mb-4">Ready to Apply?</h3>
                <p className="text-indigo-100 mb-8 text-xl max-w-2xl mx-auto">
                  Join <span className="font-semibold text-white">{job.company_name}</span> and take the next step in your career journey
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleApply}
                  className="px-12 py-5 bg-white text-purple-700 rounded-xl hover:bg-gray-50 font-bold text-xl shadow-2xl transform transition-all flex items-center space-x-3 mx-auto"
                >
                  <FaCheckCircle className="text-2xl" />
                  <span>Submit Your Application</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default JobDetails;
