import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaSearch, FaMapMarkerAlt, FaBriefcase, FaDollarSign, FaFilter, FaBookmark, FaRegBookmark, FaStar } from 'react-icons/fa';
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header with Search */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-2">Find Your Dream Job</h1>
            <p className="text-primary-100 mb-8">Discover opportunities that match your skills and aspirations</p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-xl p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="search"
                      value={filters.search}
                      onChange={handleFilterChange}
                      placeholder="Job title, keywords, or company"
                      className="w-full pl-12 pr-4 py-3 text-gray-900 border-0 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="location"
                      value={filters.location}
                      onChange={handleFilterChange}
                      placeholder="Location"
                      className="w-full pl-12 pr-4 py-3 text-gray-900 border-0 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-3 rounded-lg hover:from-primary-700 hover:to-primary-800 font-semibold flex items-center justify-center"
                >
                  <FaSearch className="mr-2" /> Search
                </button>
              </div>
            </form>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="mt-4 text-white flex items-center hover:text-primary-100 transition-colors"
            >
              <FaFilter className="mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Advanced Filters'}
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-white border-b shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                  <select
                    name="job_type"
                    value={filters.job_type}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Types</option>
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Salary</label>
                  <input
                    type="number"
                    name="min_salary"
                    value={filters.min_salary}
                    onChange={handleFilterChange}
                    placeholder="$0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Salary</label>
                  <input
                    type="number"
                    name="max_salary"
                    value={filters.max_salary}
                    onChange={handleFilterChange}
                    placeholder="$200,000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {jobs.length} {jobs.length === 1 ? 'Job' : 'Jobs'} Found
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div>
            </div>
          ) : jobs.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden border border-gray-100 group"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3
                            onClick={() => navigate(`/job-seeker/jobs/${job.id}`)}
                            className="text-2xl font-bold text-gray-900 group-hover:text-primary-600 cursor-pointer transition-colors"
                          >
                            {job.title}
                          </h3>
                          {job.status === 'active' && (
                            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-lg text-gray-600 mb-4">{job.company_name}</p>
                        
                        <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <FaMapMarkerAlt className="mr-2 text-primary-600" />
                            {job.location}
                          </div>
                          <div className="flex items-center">
                            <FaBriefcase className="mr-2 text-primary-600" />
                            {job.job_type?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </div>
                          {(job.salary_min || job.salary_max) && (
                            <div className="flex items-center">
                              <FaDollarSign className="mr-2 text-primary-600" />
                              ${job.salary_min?.toLocaleString()} - ${job.salary_max?.toLocaleString()}
                            </div>
                          )}
                        </div>

                        <p className="text-gray-700 line-clamp-2 mb-4">{job.description}</p>
                        
                        {job.required_skills && job.required_skills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {job.required_skills.slice(0, 5).map((skill) => (
                              <span
                                key={skill.id}
                                className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full"
                              >
                                {skill.name}
                              </span>
                            ))}
                            {job.required_skills.length > 5 && (
                              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                                +{job.required_skills.length - 5} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end space-y-3 ml-4">
                        <button
                          onClick={() => toggleSaveJob(job.id)}
                          className="p-3 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          {savedJobIds.includes(job.id) ? (
                            <FaBookmark className="text-primary-600 text-xl" />
                          ) : (
                            <FaRegBookmark className="text-gray-400 text-xl" />
                          )}
                        </button>
                        <button
                          onClick={() => navigate(`/job-seeker/jobs/${job.id}`)}
                          className="px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 font-medium"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl shadow">
              <div className="text-gray-300 text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Jobs Found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search criteria</p>
              <button
                onClick={() => {
                  setFilters({ search: '', location: '', job_type: '', min_salary: '', max_salary: '' });
                  fetchJobs();
                }}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default JobSearch;
