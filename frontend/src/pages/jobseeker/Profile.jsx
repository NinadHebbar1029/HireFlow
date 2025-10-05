import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUser, FaCamera, FaUpload, FaPlus, FaTimes, FaSave } from 'react-icons/fa';
import api from '../../utils/api';
import Layout from '../../components/Layout';

const JobSeekerProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    resume_url: '',
    profile_image_url: ''
  });
  const [skills, setSkills] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [newSkill, setNewSkill] = useState({ skill_id: '', proficiency_level: 'intermediate' });
  const [resumeFile, setResumeFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [profileRes, skillsRes] = await Promise.all([
        api.get('/job-seekers/profile'),
        api.get('/skills')
      ]);
      
      setProfile({
        full_name: profileRes.data.full_name || '',
        email: profileRes.data.email || '',
        phone: profileRes.data.phone || '',
        location: profileRes.data.location || '',
        bio: profileRes.data.bio || '',
        resume_url: profileRes.data.resume_url || '',
        profile_image_url: profileRes.data.profile_image_url || ''
      });
      setSkills(profileRes.data.skills || []);
      setAvailableSkills(skillsRes.data);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setImageFile(file);
    }
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Resume size should be less than 5MB');
        return;
      }
      setResumeFile(file);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return;
    const formData = new FormData();
    formData.append('profile_image', imageFile);
    const res = await api.post('/job-seekers/profile-image', formData);
    return res.data.profile_image_url;
  };

  const uploadResume = async () => {
    if (!resumeFile) return;
    const formData = new FormData();
    formData.append('resume', resumeFile);
    const res = await api.post('/job-seekers/resume', formData);
    return res.data.resume_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      let updatedProfile = { ...profile };
      
      if (imageFile) {
        const imageUrl = await uploadImage();
        updatedProfile.profile_image_url = imageUrl;
      }
      
      if (resumeFile) {
        const resumeUrl = await uploadResume();
        updatedProfile.resume_url = resumeUrl;
      }
      
      await api.put('/job-seekers/profile', updatedProfile);
      setProfile(updatedProfile);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = async () => {
    if (!newSkill.skill_id) {
      toast.error('Please select a skill');
      return;
    }
    
    try {
      await api.post('/job-seekers/skills', newSkill);
      const res = await api.get('/job-seekers/profile');
      setSkills(res.data.skills || []);
      setNewSkill({ skill_id: '', proficiency_level: 'intermediate' });
      toast.success('Skill added successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add skill');
    }
  };

  const removeSkill = async (skillId) => {
    try {
      await api.delete(`/job-seekers/skills/${skillId}`);
      setSkills(skills.filter(s => s.skill_id !== skillId));
      toast.success('Skill removed successfully!');
    } catch (error) {
      toast.error('Failed to remove skill');
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
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
            <p className="text-gray-600">Manage your personal information and professional details</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Image Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <FaCamera className="mr-2 text-primary-600" />
                Profile Picture
              </h2>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  {profile.profile_image_url || imageFile ? (
                    <img 
                      src={imageFile ? URL.createObjectURL(imageFile) : profile.profile_image_url} 
                      alt="Profile" 
                      className="w-32 h-32 rounded-full object-cover border-4 border-primary-200"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                      <FaUser className="text-white text-5xl" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                    <FaUpload className="mr-2" />
                    Upload Photo
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                  <p className="text-sm text-gray-500 mt-2">JPG, PNG or GIF. Max 5MB.</p>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input 
                    type="text" 
                    name="full_name" 
                    value={profile.full_name} 
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={profile.email} 
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={profile.phone} 
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input 
                    type="text" 
                    name="location" 
                    value={profile.location} 
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea 
                    name="bio" 
                    value={profile.bio} 
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
            </div>

            {/* Resume Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <FaUpload className="mr-2 text-primary-600" />
                Resume
              </h2>
              <div className="space-y-4">
                {profile.resume_url && (
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <span className="text-green-800 font-medium">✓ Resume uploaded</span>
                    <a href={profile.resume_url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 font-medium">
                      View Resume →
                    </a>
                  </div>
                )}
                <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <FaUpload className="mr-2" />
                  {resumeFile ? resumeFile.name : 'Upload New Resume'}
                  <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeChange} className="hidden" />
                </label>
                <p className="text-sm text-gray-500">PDF, DOC, or DOCX. Max 5MB.</p>
              </div>
            </div>

            {/* Skills Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Skills</h2>
              
              {/* Current Skills */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-3">
                  {skills.map((skill) => (
                    <div key={skill.skill_id} className="group relative">
                      <div className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full flex items-center space-x-2">
                        <span className="font-medium">{skill.skill_name}</span>
                        <span className="text-xs bg-white bg-opacity-30 px-2 py-1 rounded-full">
                          {skill.proficiency_level}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeSkill(skill.skill_id)}
                          className="ml-1 hover:bg-red-500 rounded-full p-1 transition-colors"
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Skill */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Add New Skill</h3>
                <div className="flex flex-wrap gap-4">
                  <select 
                    value={newSkill.skill_id}
                    onChange={(e) => setNewSkill({ ...newSkill, skill_id: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select a skill...</option>
                    {availableSkills.filter(s => !skills.some(us => us.skill_id === s.skill_id)).map(skill => (
                      <option key={skill.skill_id} value={skill.skill_id}>{skill.skill_name}</option>
                    ))}
                  </select>
                  <select 
                    value={newSkill.proficiency_level}
                    onChange={(e) => setNewSkill({ ...newSkill, proficiency_level: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center"
                  >
                    <FaPlus className="mr-2" /> Add
                  </button>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/jobseeker/dashboard')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 font-medium flex items-center disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    Save Changes
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

export default JobSeekerProfile;
