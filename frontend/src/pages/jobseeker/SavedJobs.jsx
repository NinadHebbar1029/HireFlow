import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaBookmark, FaMapMarkerAlt, FaBriefcase, FaDollarSign, FaTrash, FaEye, FaHeart, FaHeartBroken, FaClock, FaBuilding, FaRocket, FaStar, FaFire, FaCheckCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import Layout from '../../components/Layout';

const SavedJobs = () => {
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/applications/saved/my-saved-jobs');
      setSavedJobs(response.data);
    } catch (error) {
      toast.error('Failed to load saved jobs');
    } finally {
      setLoading(false);
    }
  };

  const unsaveJob = async (jobId) => {
    try {
      await api.delete(`/applications/save-job/${jobId}`);
      setSavedJobs(savedJobs.filter(job => job.id !== jobId));
      toast.success('Job removed from saved list');
    } catch (error) {
      toast.error('Failed to unsave job');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="relative inline-block">
              <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-pink-600"></div>
              <FaHeart className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-pink-600 text-2xl animate-pulse" />
            </div>
            <p className="mt-6 text-xl font-semibold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Loading your saved jobs...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-600 rounded-3xl shadow-2xl p-10 mb-12 overflow-hidden"
          >
            {/* Animated background orbs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-yellow-300 opacity-10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                    <FaHeart className="text-5xl text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-2 flex items-center gap-3">
                      Your Saved Jobs
                      <FaStar className="text-yellow-300 animate-pulse" />
                    </h1>
                    <p className="text-pink-100 text-lg">Jobs you've bookmarked for later review</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                    <div className="text-center">
                      <div className="text-3xl font-black text-white">{savedJobs.length}</div>
                      <div className="text-sm text-pink-100 font-medium">Saved</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {savedJobs.length > 0 ? (
            <div className="grid grid-cols-1 gap-8">
              {savedJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-pink-300"
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Saved badge ribbon */}
                  <div className="absolute top-4 right-4 z-10">
                    <div className="px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl shadow-lg flex items-center gap-2">
                      <FaHeart className="text-white animate-pulse" />
                      <span className="text-white font-bold text-sm">
                        Saved {new Date(job.saved_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="relative p-8">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1 pr-64">
                        {/* Company Info */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                            <FaBuilding className="text-purple-600 text-xl" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide">
                              {job.company_name}
                            </h4>
                            <div className="flex items-center gap-1 mt-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-xs text-green-600 font-bold">Now Accepting Applications</span>
                            </div>
                          </div>
                        </div>

                        {/* Job Title */}
                        <h3
                          onClick={() => navigate(`/job-seeker/jobs/${job.id}`)}
                          className="text-2xl md:text-3xl font-black text-gray-900 group-hover:text-purple-600 cursor-pointer transition-colors mb-6 leading-tight"
                        >
                          {job.title}
                        </h3>
                        
                        {/* Job Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                              <FaMapMarkerAlt className="text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Location</p>
                              <p className="text-sm font-bold text-gray-900">{job.location}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                              <FaBriefcase className="text-purple-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Type</p>
                              <p className="text-sm font-bold text-gray-900">
                                {job.job_type?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </p>
                            </div>
                          </div>

                          {(job.salary_min || job.salary_max) && (
                            <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                              <div className="p-2 bg-white rounded-lg shadow-sm">
                                <FaDollarSign className="text-green-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 font-medium">Salary Range</p>
                                <p className="text-sm font-bold text-gray-900">
                                  ${job.salary_min?.toLocaleString()} - ${job.salary_max?.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-gray-700 leading-relaxed mb-6 line-clamp-2">{job.description}</p>
                        
                        {/* Skills */}
                        {job.required_skills && job.required_skills.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {job.required_skills.slice(0, 6).map((skill) => (
                              <span
                                key={skill.id}
                                className="px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 text-sm font-bold rounded-xl border border-purple-200 hover:border-purple-400 transition-colors"
                              >
                                {skill.name}
                              </span>
                            ))}
                            {job.required_skills.length > 6 && (
                              <span className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-bold rounded-xl border border-gray-200">
                                +{job.required_skills.length - 6} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons - Vertical Stack */}
                      <div className="absolute top-24 right-8 flex flex-col gap-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => navigate(`/job-seeker/jobs/${job.id}`)}
                          className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-black shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 whitespace-nowrap"
                        >
                          <FaRocket className="text-lg" />
                          View Details
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => unsaveJob(job.id)}
                          className="px-8 py-4 border-2 border-red-400 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-500 font-bold transition-all duration-300 flex items-center gap-2 whitespace-nowrap"
                        >
                          <FaHeartBroken className="text-lg" />
                          Remove
                        </motion.button>

                        {/* Time saved indicator */}
                        <div className="mt-2 flex items-center gap-2 text-gray-500 text-sm justify-center">
                          <FaClock />
                          <span className="font-medium">Saved</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Animated shine effect */}
                  <div className="absolute top-0 -left-full h-full w-1/2 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 group-hover:left-full transition-all duration-1000 ease-in-out"></div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 bg-white rounded-3xl shadow-2xl"
            >
              <div className="inline-block p-8 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full mb-6">
                <FaHeartBroken className="text-gray-400 text-7xl" />
              </div>
              <h2 className="text-4xl font-black text-gray-900 mb-4">No Saved Jobs Yet</h2>
              <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                Start exploring amazing opportunities and save the ones you love for easy access later!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/job-seeker/jobs')}
                className="px-10 py-5 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-2xl hover:from-pink-700 hover:to-purple-700 font-black text-lg shadow-2xl flex items-center gap-3 mx-auto"
              >
                <FaFire className="text-2xl" />
                Browse Jobs Now
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SavedJobs;
