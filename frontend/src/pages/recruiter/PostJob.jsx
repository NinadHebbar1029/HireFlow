import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaPlus, FaTimes, FaSave, FaBriefcase } from 'react-icons/fa';
import api from '../../utils/api';
import Layout from '../../components/Layout';

const PostJob = () => {
  const [searchParams] = useSearchParams();
  const editJobId = searchParams.get('edit');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [skills, setSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    job_type: 'full-time',
    salary_min: '',
    salary_max: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchSkills();
    if (editJobId) {
      fetchJobData();
    }
  }, [editJobId]);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const response = await api.get('/skills');
      setSkills(response.data);
    } catch (error) {
      toast.error('Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/jobs/${editJobId}`);
      const job = response.data;
      
      setJobData({
        title: job.title || '',
        description: job.description || '',
        requirements: job.requirements || '',
        location: job.location || '',
        job_type: job.job_type || 'full-time',
        salary_min: job.salary_min || '',
        salary_max: job.salary_max || ''
      });
      
      // Set selected skills with mandatory flags
      if (job.required_skills && job.required_skills.length > 0) {
        setSelectedSkills(job.required_skills.map(s => ({
          id: s.id,
          name: s.name,
          is_mandatory: s.is_mandatory !== undefined ? s.is_mandatory : true
        })));
      }
    } catch (error) {
      toast.error('Failed to load job data');
      navigate('/recruiter/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setJobData({ ...jobData, [e.target.name]: e.target.value });
  };

  const addSkill = (skillId) => {
    if (!selectedSkills.find(s => s.id === skillId)) {
      const skill = skills.find(s => s.id === parseInt(skillId));
      setSelectedSkills([...selectedSkills, { ...skill, is_mandatory: true }]);
    }
  };

  const removeSkill = (skillId) => {
    setSelectedSkills(selectedSkills.filter(s => s.id !== skillId));
  };

  const toggleMandatory = (skillId) => {
    setSelectedSkills(selectedSkills.map(s => 
      s.id === skillId ? { ...s, is_mandatory: !s.is_mandatory } : s
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedSkills.length === 0) {
      toast.error('Please select at least one skill');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...jobData,
        required_skills: selectedSkills.map(s => ({
          skill_id: s.id,
          is_mandatory: s.is_mandatory
        }))
      };

      if (editJobId) {
        await api.put(`/jobs/${editJobId}`, payload);
        toast.success('Job updated successfully!');
      } else {
        await api.post('/jobs', payload);
        toast.success('Job posted successfully!');
      }
      
      navigate('/recruiter/jobs');
    } catch (error) {
      toast.error(error.response?.data?.error || `Failed to ${editJobId ? 'update' : 'post'} job`);
    } finally {
      setSubmitting(false);
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
              <FaBriefcase className="mr-4 text-primary-600" />
              {editJobId ? 'Edit Job' : 'Post a New Job'}
            </h1>
            <p className="text-gray-600 text-lg">
              {editJobId ? 'Update your job posting details' : 'Find the perfect candidate for your open position'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Job Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={jobData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Senior Software Engineer"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                    <input
                      type="text"
                      name="location"
                      value={jobData.location}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., New York, NY"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Type *</label>
                    <select
                      name="job_type"
                      value={jobData.job_type}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="full-time">Full Time</option>
                      <option value="part-time">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Salary ($)</label>
                    <input
                      type="number"
                      name="salary_min"
                      value={jobData.salary_min}
                      onChange={handleInputChange}
                      placeholder="50000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Salary ($)</label>
                    <input
                      type="number"
                      name="salary_max"
                      value={jobData.salary_max}
                      onChange={handleInputChange}
                      placeholder="100000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Description *</label>
                  <textarea
                    name="description"
                    value={jobData.description}
                    onChange={handleInputChange}
                    required
                    rows="6"
                    placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Requirements *</label>
                  <textarea
                    name="requirements"
                    value={jobData.requirements}
                    onChange={handleInputChange}
                    required
                    rows="6"
                    placeholder="List the qualifications, experience, and requirements for this role..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Skills Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Required Skills</h2>
              
              {/* Selected Skills */}
              {selectedSkills.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Selected Skills</h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedSkills.map((skill) => (
                      <div key={skill.id} className="group relative">
                        <div className={`px-4 py-2 ${skill.is_mandatory ? 'bg-gradient-to-r from-primary-500 to-primary-600' : 'bg-gray-400'} text-white rounded-full flex items-center space-x-2`}>
                          <span className="font-medium">{skill.name}</span>
                          <button
                            type="button"
                            onClick={() => toggleMandatory(skill.id)}
                            className="text-xs bg-white bg-opacity-30 px-2 py-1 rounded-full hover:bg-opacity-40 transition-colors"
                          >
                            {skill.is_mandatory ? 'Required' : 'Optional'}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeSkill(skill.id)}
                            className="hover:bg-red-500 rounded-full p-1 transition-colors"
                          >
                            <FaTimes className="text-xs" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Click on a skill badge to toggle between required and optional
                  </p>
                </div>
              )}

              {/* Add Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Add Skills</label>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      addSkill(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select a skill to add...</option>
                  {skills.filter(s => !selectedSkills.find(ss => ss.id === s.id)).map(skill => (
                    <option key={skill.id} value={skill.id}>{skill.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/recruiter/jobs')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 font-bold flex items-center disabled:opacity-50 shadow-lg"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {editJobId ? 'Updating...' : 'Posting...'}
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    {editJobId ? 'Update Job' : 'Post Job'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default PostJob;
