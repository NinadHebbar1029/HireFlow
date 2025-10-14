import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaPlus, FaTimes, FaSave, FaBriefcase, FaMapMarkerAlt, FaDollarSign, FaFileAlt, FaCheckCircle, FaClock, FaStar, FaLightbulb, FaRocket } from 'react-icons/fa';
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
        <div className="flex justify-center items-center h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-semibold">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 via-primary-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl transform hover:rotate-6 transition-transform">
                <FaRocket className="text-4xl text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-3">
              <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {editJobId ? 'Edit Job Posting' : 'Post Your Dream Job'}
              </span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {editJobId 
                ? 'Update your job posting to attract the perfect candidates' 
                : 'Create an amazing job posting and find talented professionals to join your team'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Progress Indicator */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Completion Status</span>
                <span className="text-sm font-bold text-primary-600">
                  {Math.round(
                    ((jobData.title ? 1 : 0) +
                    (jobData.description ? 1 : 0) +
                    (jobData.requirements ? 1 : 0) +
                    (jobData.location ? 1 : 0) +
                    (selectedSkills.length > 0 ? 1 : 0)) / 5 * 100
                  )}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 shadow-lg"
                  style={{
                    width: `${Math.round(
                      ((jobData.title ? 1 : 0) +
                      (jobData.description ? 1 : 0) +
                      (jobData.requirements ? 1 : 0) +
                      (jobData.location ? 1 : 0) +
                      (selectedSkills.length > 0 ? 1 : 0)) / 5 * 100
                    )}%`
                  }}
                />
              </div>
            </div>

            {/* Basic Information */}
            <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:shadow-2xl transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FaBriefcase className="text-white text-xl" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Job Details</h2>
              </div>

              <div className="space-y-6">
                {/* Job Title */}
                <div className="group">
                  <label className="flex text-sm font-bold text-gray-700 mb-2 items-center gap-2">
                    <FaStar className="text-yellow-500" />
                    Job Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={jobData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Senior Software Engineer"
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-lg group-hover:border-gray-300"
                  />
                </div>

                {/* Location and Job Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="flex text-sm font-bold text-gray-700 mb-2 items-center gap-2">
                      <FaMapMarkerAlt className="text-red-500" />
                      Location *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={jobData.location}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., New York, NY or Remote"
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all group-hover:border-gray-300"
                    />
                  </div>
                  <div className="group">
                    <label className="flex text-sm font-bold text-gray-700 mb-2 items-center gap-2">
                      <FaClock className="text-blue-500" />
                      Job Type *
                    </label>
                    <select
                      name="job_type"
                      value={jobData.job_type}
                      onChange={handleInputChange}
                      required
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all group-hover:border-gray-300 bg-white"
                    >
                      <option value="full-time">⏰ Full Time</option>
                      <option value="part-time">⌚ Part Time</option>
                      <option value="contract">📝 Contract</option>
                      <option value="internship">🎓 Internship</option>
                    </select>
                  </div>
                </div>

                {/* Salary Range */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-100">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-4">
                    <FaDollarSign className="text-green-600" />
                    Salary Range (Optional)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2">Minimum ($)</label>
                      <input
                        type="number"
                        name="salary_min"
                        value={jobData.salary_min}
                        onChange={handleInputChange}
                        placeholder="50,000"
                        className="w-full px-5 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2">Maximum ($)</label>
                      <input
                        type="number"
                        name="salary_max"
                        value={jobData.salary_max}
                        onChange={handleInputChange}
                        placeholder="100,000"
                        className="w-full px-5 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Job Description */}
                <div className="group">
                  <label className="flex text-sm font-bold text-gray-700 mb-2 items-center gap-2">
                    <FaFileAlt className="text-purple-500" />
                    Job Description *
                  </label>
                  <textarea
                    name="description"
                    value={jobData.description}
                    onChange={handleInputChange}
                    required
                    rows="8"
                    placeholder="✍️ Describe the role, responsibilities, and what makes this opportunity exciting...

Example:
- What will the candidate be working on?
- What impact will they make?
- What makes your company unique?"
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all group-hover:border-gray-300 resize-none"
                  />
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                    <FaLightbulb className="text-yellow-500" />
                    <span>Tip: Be specific about day-to-day responsibilities and growth opportunities</span>
                  </div>
                </div>

                {/* Requirements */}
                <div className="group">
                  <label className="flex text-sm font-bold text-gray-700 mb-2 items-center gap-2">
                    <FaCheckCircle className="text-green-500" />
                    Requirements *
                  </label>
                  <textarea
                    name="requirements"
                    value={jobData.requirements}
                    onChange={handleInputChange}
                    required
                    rows="8"
                    placeholder="📋 List the qualifications, experience, and requirements...

Example:
- 5+ years of experience in software development
- Strong knowledge of React and Node.js
- Bachelor's degree in Computer Science or related field
- Excellent communication skills"
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all group-hover:border-gray-300 resize-none"
                  />
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                    <FaLightbulb className="text-yellow-500" />
                    <span>Tip: Include both required and nice-to-have qualifications</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:shadow-2xl transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <FaStar className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Required Skills</h2>
                  <p className="text-sm text-gray-600">Add skills and mark them as required or optional</p>
                </div>
              </div>
              
              {/* Selected Skills */}
              {selectedSkills.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      Selected Skills
                      <span className="bg-gradient-to-r from-primary-500 to-purple-500 text-white text-xs px-3 py-1 rounded-full">
                        {selectedSkills.length}
                      </span>
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"></div>
                        <span>Required</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        <span>Optional</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {selectedSkills.map((skill) => (
                      <div 
                        key={skill.id} 
                        className="group relative transform hover:scale-105 transition-all"
                      >
                        <div className={`px-5 py-3 ${
                          skill.is_mandatory 
                            ? 'bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg shadow-primary-200' 
                            : 'bg-gradient-to-r from-gray-400 to-gray-500 shadow-lg shadow-gray-200'
                        } text-white rounded-xl flex items-center gap-3`}>
                          <span className="font-bold">{skill.name}</span>
                          <button
                            type="button"
                            onClick={() => toggleMandatory(skill.id)}
                            className="text-xs bg-white bg-opacity-30 px-3 py-1.5 rounded-full hover:bg-opacity-50 transition-all font-semibold"
                          >
                            {skill.is_mandatory ? '✓ Required' : '○ Optional'}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeSkill(skill.id)}
                            className="hover:bg-red-500 rounded-full p-1.5 transition-colors"
                          >
                            <FaTimes className="text-sm" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-100 rounded-xl">
                    <p className="text-sm text-blue-700 flex items-center gap-2">
                      <FaLightbulb className="text-blue-500" />
                      <span className="font-semibold">Tip:</span> Click the badge on each skill to toggle between Required and Optional
                    </p>
                  </div>
                </div>
              )}

              {/* Add Skills */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-100">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                  <FaPlus className="text-purple-600" />
                  Add Skills to This Job
                </label>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      addSkill(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="w-full px-5 py-4 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white text-lg font-semibold"
                >
                  <option value="">+ Select a skill to add...</option>
                  {skills.filter(s => !selectedSkills.find(ss => ss.id === s.id)).map(skill => (
                    <option key={skill.id} value={skill.id}>{skill.name}</option>
                  ))}
                </select>
                {selectedSkills.length === 0 && (
                  <p className="mt-3 text-sm text-red-600 font-semibold flex items-center gap-2">
                    ⚠ Please add at least one skill to proceed
                  </p>
                )}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex flex-col sm:flex-row justify-end gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/recruiter/jobs')}
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-bold transition-all transform hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-10 py-4 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 text-white rounded-xl hover:shadow-2xl font-bold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-xl"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      {editJobId ? 'Updating Job...' : 'Publishing Job...'}
                    </>
                  ) : (
                    <>
                      {editJobId ? (
                        <>
                          <FaSave className="mr-3 text-xl" />
                          Update Job Posting
                        </>
                      ) : (
                        <>
                          <FaRocket className="mr-3 text-xl" />
                          Publish Job Posting
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default PostJob;
