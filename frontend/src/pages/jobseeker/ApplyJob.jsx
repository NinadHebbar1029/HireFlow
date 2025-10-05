import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaPaperPlane, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import api from '../../utils/api';
import Layout from '../../components/Layout';

const ApplyJob = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [job, setJob] = useState(null);
  const [profile, setProfile] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [skillsMatch, setSkillsMatch] = useState({ matching: [], missing: [] });
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobRes, profileRes] = await Promise.all([
        api.get(`/jobs/${id}`),
        api.get('/job-seekers/profile')
      ]);
      
      setJob(jobRes.data);
      setProfile(profileRes.data);
      
      // Calculate skill match
      const jobSkills = jobRes.data.required_skills || [];
      const userSkills = (profileRes.data.skills || []).map(s => s.name || s.skill_name);
      const matching = jobSkills.filter(skill => userSkills.includes(skill.name));
      const missing = jobSkills.filter(skill => !userSkills.includes(skill.name));
      
      setSkillsMatch({ matching, missing });
    } catch (error) {
      toast.error('Failed to load job details');
      navigate('/job-seeker/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!profile.resume_url) {
      toast.error('Please upload your resume in your profile first');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/applications', {
        job_id: id,
        cover_letter: coverLetter
      });
      
      toast.success('Application submitted successfully!');
      navigate('/job-seeker/applications');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit application');
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
          {/* Back Button */}
          <button
            onClick={() => navigate(`/job-seeker/jobs/${id}`)}
            className="mb-6 flex items-center text-primary-600 hover:text-primary-700 font-medium"
          >
            <FaArrowLeft className="mr-2" /> Back to Job Details
          </button>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Apply for Position</h1>
            <p className="text-xl text-gray-600">{job.title} at {job.company_name}</p>
          </div>

          {/* Skills Match Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Skills Match Analysis</h2>
            
            {skillsMatch.matching.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center text-green-600 font-semibold mb-2">
                  <FaCheckCircle className="mr-2" />
                  Matching Skills ({skillsMatch.matching.length})
                </div>
                <div className="flex flex-wrap gap-2">
                  {skillsMatch.matching.map((skill) => (
                    <span key={skill.id} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {skillsMatch.missing.length > 0 && (
              <div>
                <div className="flex items-center text-orange-600 font-semibold mb-2">
                  <FaExclamationTriangle className="mr-2" />
                  Missing Skills ({skillsMatch.missing.length})
                </div>
                <div className="flex flex-wrap gap-2">
                  {skillsMatch.missing.map((skill) => (
                    <span key={skill.id} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                      {skill.name}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  💡 Consider adding these skills to your profile to increase your match rate
                </p>
              </div>
            )}
          </div>

          {/* Profile Check */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Application Checklist</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                {profile.resume_url ? (
                  <FaCheckCircle className="text-green-500 text-xl mr-3" />
                ) : (
                  <div className="w-6 h-6 border-2 border-gray-300 rounded-full mr-3"></div>
                )}
                <span className={profile.resume_url ? 'text-gray-900' : 'text-gray-500'}>
                  Resume Uploaded {!profile.resume_url && '(Required)'}
                </span>
                {!profile.resume_url && (
                  <button
                    onClick={() => navigate('/job-seeker/profile')}
                    className="ml-auto text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    Upload Resume
                  </button>
                )}
              </div>
              <div className="flex items-center">
                {profile.phone ? (
                  <FaCheckCircle className="text-green-500 text-xl mr-3" />
                ) : (
                  <div className="w-6 h-6 border-2 border-gray-300 rounded-full mr-3"></div>
                )}
                <span className={profile.phone ? 'text-gray-900' : 'text-gray-500'}>
                  Contact Information
                </span>
              </div>
              <div className="flex items-center">
                {profile.skills && profile.skills.length > 0 ? (
                  <FaCheckCircle className="text-green-500 text-xl mr-3" />
                ) : (
                  <div className="w-6 h-6 border-2 border-gray-300 rounded-full mr-3"></div>
                )}
                <span className={profile.skills?.length > 0 ? 'text-gray-900' : 'text-gray-500'}>
                  Skills Added
                </span>
              </div>
            </div>
          </div>

          {/* Application Form */}
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Cover Letter</h2>
              <p className="text-gray-600 mb-4">
                Tell the employer why you're a great fit for this position
              </p>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows="10"
                placeholder="Dear Hiring Manager,&#10;&#10;I am writing to express my strong interest in the position of [Job Title] at [Company Name]...&#10;&#10;Best regards"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                A well-written cover letter can increase your chances by up to 40%
              </p>
            </div>

            {/* Submit Button */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    By submitting this application, you agree to our terms and conditions
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={submitting || !profile.resume_url}
                  className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 font-bold flex items-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="mr-3" />
                      Submit Application
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

export default ApplyJob;
