import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaSearch, FaMapMarkerAlt, FaBriefcase, FaDollarSign, FaFilter, FaBookmark, FaRegBookmark, FaStar, FaBuilding, FaClock, FaFire, FaRocket, FaHeart, FaRegHeart, FaCheckCircle, FaBolt, FaTrophy } from 'react-icons/fa';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import Layout from '../../components/Layout';

const JobSearch = () => {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    job_type: '',
    min_salary: '',
    max_salary: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
    fetchSavedJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.job_type) queryParams.append('job_type', filters.job_type);
      if (filters.min_salary) queryParams.append('min_salary', filters.min_salary);
      if (filters.max_salary) queryParams.append('max_salary', filters.max_salary);
      
      const response = await api.get(`/jobs?${queryParams.toString()}`);
      setJobs(response.data || []);
    } catch (error) {
      console.error('Failed to load jobs:', error);
      setJobs([]);
      // Don't show error toast - just show empty state
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    try {
      const response = await api.get('/applications/saved/my-saved-jobs');
      setSavedJobIds(response.data.map(job => job.id));
    } catch (error) {
      console.log('Saved jobs not available');
      setSavedJobIds([]);
      console.error('Failed to load saved jobs');
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const toggleSaveJob = async (jobId) => {
    try {
      if (savedJobIds.includes(jobId)) {
        await api.delete(`/applications/save-job/${jobId}`);
        setSavedJobIds(savedJobIds.filter(id => id !== jobId));
        toast.success('Job unsaved');
      } else {
        await api.post('/applications/save-job', { job_id: jobId });
        setSavedJobIds([...savedJobIds, jobId]);
        toast.success('Job saved!');
      }
    } catch (error) {
      toast.error('Failed to save job');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Enhanced Header with Search */}
        <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white py-16 overflow-hidden">
          {/* Animated Background Effects */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-yellow-300 opacity-10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-pink-400 opacity-5 rounded-full blur-3xl"></div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <FaRocket className="text-5xl animate-pulse" />
                <h1 className="text-5xl md:text-6xl font-black">Find Your Dream Job</h1>
                <FaBolt className="text-5xl text-yellow-300 animate-pulse" />
              </div>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Discover amazing opportunities that match your skills and aspirations
              </p>
            </motion.div>
            
            {/* Enhanced Search Bar */}
            <motion.form
              onSubmit={handleSearch}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-2xl shadow-2xl p-6 backdrop-blur-sm"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative group">
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type="text"
                      name="search"
                      value={filters.search}
                      onChange={handleFilterChange}
                      placeholder="Job title, keywords, or company..."
                      className="w-full pl-12 pr-4 py-4 text-gray-900 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 font-medium"
                    />
                  </div>
                </div>
                <div>
                  <div className="relative group">
                    <FaMapMarkerAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type="text"
                      name="location"
                      value={filters.location}
                      onChange={handleFilterChange}
                      placeholder="Location"
                      className="w-full pl-12 pr-4 py-4 text-gray-900 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 font-medium"
                    />
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <FaSearch className="text-lg" /> Search Jobs
                </motion.button>
              </div>
            </motion.form>

            {/* Filter Toggle */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              onClick={() => setShowFilters(!showFilters)}
              className="mt-6 text-white flex items-center gap-2 hover:text-yellow-300 transition-colors font-semibold mx-auto"
            >
              <FaFilter className="text-lg" />
              {showFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
            </motion.button>
          </div>
        </div>

        {/* Enhanced Advanced Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border-b-2 border-blue-100 shadow-lg"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <FaFilter className="text-blue-600" />
                Advanced Filters
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Job Type</label>
                  <select
                    name="job_type"
                    value={filters.job_type}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 font-medium"
                  >
                    <option value="">All Types</option>
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Min Salary</label>
                  <div className="relative">
                    <FaDollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      name="min_salary"
                      value={filters.min_salary}
                      onChange={handleFilterChange}
                      placeholder="0"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Max Salary</label>
                  <div className="relative">
                    <FaDollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      name="max_salary"
                      value={filters.max_salary}
                      onChange={handleFilterChange}
                      placeholder="200000"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Enhanced Results Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-center justify-between flex-wrap gap-4"
          >
            <div>
              <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                <FaFire className="text-orange-500" />
                {jobs.length} {jobs.length === 1 ? 'Job' : 'Jobs'} Found
              </h2>
              <p className="text-gray-600 mt-1">Discover your next career opportunity</p>
            </div>
            {jobs.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl">
                <FaCheckCircle className="text-green-600" />
                <span className="text-green-800 font-bold text-sm">All positions are actively hiring</span>
              </div>
            )}
          </motion.div>

          {loading ? (
            <div className="flex flex-col justify-center items-center h-96">
              <div className="relative">
                <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-600"></div>
                <FaBriefcase className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-600 text-2xl" />
              </div>
              <p className="mt-6 text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Loading amazing opportunities...
              </p>
            </div>
          ) : jobs.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {jobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-blue-300"
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative p-8">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1">
                        {/* Company Badge */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                            <FaBuilding className="text-blue-600 text-xl" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide">{job.company_name}</h4>
                            {job.status === 'active' && (
                              <div className="flex items-center gap-1 mt-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs text-green-600 font-bold">Actively Hiring</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Job Title */}
                        <h3
                          onClick={() => navigate(`/job-seeker/jobs/${job.id}`)}
                          className="text-2xl md:text-3xl font-black text-gray-900 group-hover:text-blue-600 cursor-pointer transition-colors mb-4 leading-tight"
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
                                className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-sm font-bold rounded-xl border border-blue-200 hover:border-blue-400 transition-colors"
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

                      {/* Action Buttons */}
                      <div className="flex flex-col items-end gap-4">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleSaveJob(job.id)}
                          className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-pink-50 hover:to-pink-100 transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                          {savedJobIds.includes(job.id) ? (
                            <FaHeart className="text-pink-600 text-2xl" />
                          ) : (
                            <FaRegHeart className="text-gray-400 hover:text-pink-600 text-2xl transition-colors" />
                          )}
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => navigate(`/job-seeker/jobs/${job.id}`)}
                          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-black shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 whitespace-nowrap"
                        >
                          View Details
                          <FaRocket className="text-lg" />
                        </motion.button>

                        {/* Posted date */}
                        <div className="flex items-center gap-2 text-gray-500 text-sm mt-2">
                          <FaClock />
                          <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
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
              className="text-center py-20 bg-white rounded-2xl shadow-xl"
            >
              <div className="inline-block p-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-6">
                <FaSearch className="text-gray-400 text-6xl" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-3">No Jobs Found</h3>
              <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                We couldn't find any jobs matching your criteria. Try adjusting your filters.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setFilters({ search: '', location: '', job_type: '', min_salary: '', max_salary: '' });
                  fetchJobs();
                }}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Clear All Filters
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default JobSearch;
