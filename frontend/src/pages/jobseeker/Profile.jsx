import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUser, FaCamera, FaUpload, FaPlus, FaTimes, FaSave, FaFileAlt, FaMapMarkerAlt, FaPhone, FaEnvelope, FaCheckCircle, FaTrash, FaBriefcase, FaGraduationCap } from 'react-icons/fa';
import { motion } from 'framer-motion';
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
      
      // Map skills API response (id, name) to expected format (skill_id, skill_name)
      const mappedSkills = skillsRes.data.map(skill => ({
        skill_id: skill.id,
        skill_name: skill.name
      }));
      setAvailableSkills(mappedSkills);
      
      console.log('Available skills loaded:', mappedSkills.length);
    } catch (error) {
      console.error('Failed to load profile:', error);
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
      if (!file.type.match(/pdf|msword|vnd.openxmlformats-officedocument.wordprocessingml.document/)) {
        toast.error('Please upload PDF, DOC, or DOCX file');
        return;
      }
      setResumeFile(file);
      toast.success(`Resume "${file.name}" selected`);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) {
      console.log('No image file selected');
      return null;
    }
    
    try {
      const formData = new FormData();
      formData.append('profileImage', imageFile); // Changed from 'profile_image' to 'profileImage'
      
      console.log('Uploading profile image:', imageFile.name);
      const res = await api.post('/job-seekers/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Image upload response:', res.data);
      toast.success('Profile image uploaded successfully!');
      return res.data.profile_image_url;
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error(error.response?.data?.error || 'Failed to upload image');
      throw error;
    }
  };

  const uploadResume = async () => {
    if (!resumeFile) {
      console.log('No resume file selected');
      return null;
    }
    
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      
      console.log('Uploading resume:', resumeFile.name);
      const res = await api.post('/job-seekers/resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Resume upload response:', res.data);
      toast.success('Resume uploaded successfully!');
      return res.data.resume_url;
    } catch (error) {
      console.error('Resume upload error:', error);
      toast.error(error.response?.data?.error || 'Failed to upload resume');
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      let updatedProfile = { ...profile };
      
      // Upload image if selected
      if (imageFile) {
        try {
          const imageUrl = await uploadImage();
          if (imageUrl) {
            updatedProfile.profile_image_url = imageUrl;
          }
        } catch (error) {
          console.error('Image upload failed:', error);
          // Continue with form submission even if image upload fails
        }
      }
      
      // Upload resume if selected
      if (resumeFile) {
        try {
          const resumeUrl = await uploadResume();
          if (resumeUrl) {
            updatedProfile.resume_url = resumeUrl;
            setResumeFile(null); // Clear the file after successful upload
          }
        } catch (error) {
          console.error('Resume upload failed:', error);
          setSaving(false);
          return; // Don't continue if resume upload fails
        }
      }
      
      // Update profile data
      await api.put('/job-seekers/profile', {
        full_name: updatedProfile.full_name,
        phone: updatedProfile.phone,
        location: updatedProfile.location,
        bio: updatedProfile.bio
      });
      
      setProfile(updatedProfile);
      setImageFile(null); // Clear image file after successful save
      toast.success('Profile updated successfully!');
      
      // Reload profile data to get latest from server
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Profile update error:', error);
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
      // Backend expects arrays
      await api.post('/job-seekers/skills', {
        skill_ids: [parseInt(newSkill.skill_id)],
        proficiency_levels: [newSkill.proficiency_level]
      });
      
      // Refresh profile to get updated skills
      const res = await api.get('/job-seekers/profile');
      setSkills(res.data.skills || []);
      setNewSkill({ skill_id: '', proficiency_level: 'intermediate' });
      toast.success('Skill added successfully!');
    } catch (error) {
      console.error('Add skill error:', error);
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
        <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading your profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const calculateProfileCompletion = () => {
    let completed = 0;
    const fields = [profile.full_name, profile.phone, profile.location, profile.bio, profile.resume_url, profile.profile_image_url];
    fields.forEach(field => { if (field) completed++; });
    if (skills.length > 0) completed++;
    return Math.round((completed / 7) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header with Profile Completion */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  My Professional Profile
                </h1>
                <p className="text-gray-600">Stand out to employers with a complete profile</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-600 mb-2">Profile Strength</div>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        profileCompletion < 50 ? 'bg-red-500' : 
                        profileCompletion < 80 ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`}
                      style={{ width: `${profileCompletion}%` }}
                    ></div>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{profileCompletion}%</span>
                </div>
              </div>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Profile Header Card with Image and Quick Info */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="h-32 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500"></div>
              <div className="px-8 pb-8">
                <div className="flex flex-col md:flex-row md:items-end md:space-x-6 -mt-16">
                  {/* Profile Picture */}
                  <div className="relative group mb-4 md:mb-0">
                    <div className="relative">
                      {profile.profile_image_url || imageFile ? (
                        <img 
                          src={imageFile ? URL.createObjectURL(imageFile) : profile.profile_image_url} 
                          alt="Profile" 
                          className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-400 to-purple-600 border-4 border-white shadow-xl flex items-center justify-center">
                          <FaUser className="text-white text-5xl" />
                        </div>
                      )}
                      <label className="absolute bottom-0 right-0 bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-full cursor-pointer shadow-lg transition-all transform hover:scale-110">
                        <FaCamera className="text-sm" />
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      </label>
                    </div>
                    {imageFile && (
                      <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        New
                      </span>
                    )}
                  </div>

                  {/* Quick Info */}
                  <div className="flex-1 mt-4 md:mt-0">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      {profile.full_name || 'Your Name'}
                    </h2>
                    <div className="flex flex-wrap gap-4 text-gray-600">
                      {profile.email && (
                        <div className="flex items-center gap-2">
                          <FaEnvelope className="text-primary-600" />
                          <span>{profile.email}</span>
                        </div>
                      )}
                      {profile.phone && (
                        <div className="flex items-center gap-2">
                          <FaPhone className="text-primary-600" />
                          <span>{profile.phone}</span>
                        </div>
                      )}
                      {profile.location && (
                        <div className="flex items-center gap-2">
                          <FaMapMarkerAlt className="text-primary-600" />
                          <span>{profile.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Personal Information */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <FaUser className="text-primary-600 text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                  <p className="text-sm text-gray-500">Tell us about yourself</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="full_name" 
                    value={profile.full_name} 
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input 
                    type="email" 
                    name="email" 
                    value={profile.email} 
                    disabled
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={profile.phone} 
                    onChange={handleInputChange}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location
                  </label>
                  <input 
                    type="text" 
                    name="location" 
                    value={profile.location} 
                    onChange={handleInputChange}
                    placeholder="City, State, Country"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Professional Bio
                  </label>
                  <textarea 
                    name="bio" 
                    value={profile.bio} 
                    onChange={handleInputChange}
                    rows="5"
                    placeholder="Write a compelling summary about your professional experience, skills, and career goals..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">{profile.bio?.length || 0} characters</p>
                </div>
              </div>
            </motion.div>

            {/* Resume Upload Section - IMPROVED */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FaFileAlt className="text-purple-600 text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Resume / CV</h2>
                  <p className="text-sm text-gray-500">Upload your latest resume</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Current Resume Display */}
                {profile.resume_url && !resumeFile && (
                  <motion.div 
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="flex items-center justify-between p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-500 rounded-lg">
                        <FaCheckCircle className="text-white text-2xl" />
                      </div>
                      <div>
                        <p className="font-semibold text-green-900">Resume uploaded successfully!</p>
                        <p className="text-sm text-green-700">Your resume is ready for employers to view</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a 
                        href={profile.resume_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="px-4 py-2 bg-white text-green-700 rounded-lg hover:bg-green-50 font-medium transition-all shadow-sm"
                      >
                        View Resume
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to remove your current resume?')) {
                            setProfile({ ...profile, resume_url: '' });
                            toast.info('Resume removed. Upload a new one and save.');
                          }
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* New Resume Selected */}
                {resumeFile && (
                  <motion.div 
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-500 rounded-lg">
                        <FaFileAlt className="text-white text-2xl" />
                      </div>
                      <div>
                        <p className="font-semibold text-blue-900">{resumeFile.name}</p>
                        <p className="text-sm text-blue-700">
                          {(resumeFile.size / 1024 / 1024).toFixed(2)} MB - Ready to upload
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setResumeFile(null)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <FaTimes className="text-xl" />
                    </button>
                  </motion.div>
                )}

                {/* Upload Button */}
                <div className="relative">
                  <input 
                    type="file" 
                    accept=".pdf,.doc,.docx" 
                    onChange={handleResumeChange} 
                    className="hidden" 
                    id="resume-upload"
                  />
                  <label 
                    htmlFor="resume-upload"
                    className="group cursor-pointer flex flex-col items-center justify-center p-8 border-3 border-dashed border-gray-300 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all"
                  >
                    <div className="p-4 bg-primary-100 rounded-full group-hover:bg-primary-200 transition-all mb-4">
                      <FaUpload className="text-primary-600 text-3xl group-hover:scale-110 transition-transform" />
                    </div>
                    <p className="text-lg font-semibold text-gray-700 group-hover:text-primary-700 mb-1">
                      {resumeFile || profile.resume_url ? 'Upload Different Resume' : 'Upload Your Resume'}
                    </p>
                    <p className="text-sm text-gray-500">
                      PDF, DOC, DOCX up to 5MB
                    </p>
                    <div className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg group-hover:bg-primary-700 transition-all">
                      Choose File
                    </div>
                  </label>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Pro Tip:</strong> Keep your resume updated and tailored to your target roles for better job matches!
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Skills Section - REDESIGNED */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <FaBriefcase className="text-indigo-600 text-xl" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">Skills & Expertise</h2>
                  <p className="text-sm text-gray-500">Showcase your professional skills</p>
                </div>
                {skills.length > 0 && (
                  <div className="text-right">
                    <span className="text-3xl font-bold text-indigo-600">{skills.length}</span>
                    <p className="text-xs text-gray-500">Skills Added</p>
                  </div>
                )}
              </div>

              {/* Skills Display */}
              {skills.length > 0 ? (
                <div className="mb-6">
                  <div className="flex flex-wrap gap-3">
                    {skills.map((skill) => (
                      <motion.div
                        key={skill.skill_id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className={`group relative px-5 py-3 rounded-xl font-medium text-sm shadow-md hover:shadow-lg transition-all ${
                          skill.proficiency_level === 'expert' || skill.proficiency_level === 'Expert' ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white' :
                          skill.proficiency_level === 'advanced' || skill.proficiency_level === 'Advanced' ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white' :
                          skill.proficiency_level === 'intermediate' || skill.proficiency_level === 'Intermediate' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' :
                          'bg-gradient-to-r from-gray-400 to-gray-600 text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <FaGraduationCap className="text-lg" />
                          <span>{skill.skill_name}</span>
                          <span className="px-2 py-0.5 bg-white bg-opacity-20 rounded-full text-xs capitalize">
                            {skill.proficiency_level}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeSkill(skill.skill_id)}
                            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-1"
                          >
                            <FaTimes className="text-xs" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 mb-6 bg-gray-50 rounded-xl">
                  <FaBriefcase className="text-6xl mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium text-gray-600">No skills added yet</p>
                  <p className="text-sm text-gray-500">Start building your professional profile by adding your skills below</p>
                </div>
              )}

              {/* Add New Skill Form */}
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border-2 border-dashed border-gray-300">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></div>
                  Add New Skill
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Skill Name
                    </label>
                    <select
                      value={newSkill.skill_id}
                      onChange={(e) => setNewSkill({ ...newSkill, skill_id: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white transition-all"
                    >
                      <option value="">Select a skill...</option>
                      {availableSkills
                        .filter(s => !skills.some(us => us.skill_id === s.skill_id))
                        .map(skill => (
                          <option key={skill.skill_id} value={skill.skill_id}>{skill.skill_name}</option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Proficiency
                    </label>
                    <select
                      value={newSkill.proficiency_level}
                      onChange={(e) => setNewSkill({ ...newSkill, proficiency_level: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white transition-all"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addSkill}
                  disabled={!newSkill.skill_id}
                  className="mt-4 w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
                >
                  <FaPlus className="text-lg" />
                  Add Skill
                </button>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-end sticky bottom-4 bg-white bg-opacity-95 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-gray-200"
            >
              <button
                type="button"
                onClick={() => navigate('/jobseeker/dashboard')}
                className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                <FaTimes className="text-lg" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <FaCheckCircle className="text-lg" />
                    Save Profile
                  </>
                )}
              </button>
            </motion.div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default JobSeekerProfile;
