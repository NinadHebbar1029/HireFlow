import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaBookmark, FaMapMarkerAlt, FaBriefcase, FaDollarSign, FaTrash, FaEye } from 'react-icons/fa';
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
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
              <FaBookmark className="mr-4 text-primary-600" />
              Saved Jobs
            </h1>
            <p className="text-gray-600 text-lg">Jobs you've bookmarked for later</p>
          </div>

          {savedJobs.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {savedJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden border border-gray-100 group"
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
                          <span className="px-3 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded-full">
                            Saved {new Date(job.saved_at).toLocaleDateString()}
                          </span>
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
                          <div className="flex flex-wrap gap-2">
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

                      <div className="flex flex-col space-y-3 ml-4">
                        <button
                          onClick={() => navigate(`/job-seeker/jobs/${job.id}`)}
                          className="px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 font-medium flex items-center"
                        >
                          <FaEye className="mr-2" /> View
                        </button>
                        <button
                          onClick={() => unsaveJob(job.id)}
                          className="px-6 py-2 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-50 font-medium flex items-center"
                        >
                          <FaTrash className="mr-2" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl shadow-lg">
              <div className="text-gray-300 text-8xl mb-6">🔖</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">No Saved Jobs Yet</h2>
              <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                Start exploring jobs and save the ones you're interested in for easy access later
              </p>
              <button
                onClick={() => navigate('/job-seeker/jobs')}
                className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 font-bold text-lg shadow-lg"
              >
                Browse Jobs
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SavedJobs;
