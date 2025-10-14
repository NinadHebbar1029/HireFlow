import { useState, useEffect } from 'react';
import { FaBuilding, FaEnvelope, FaPhone, FaGlobe, FaMapMarkerAlt, FaUsers, FaEdit, FaSave, FaTimes, FaLinkedin, FaTwitter, FaCalendar, FaAward, FaRocket, FaStar, FaTrophy, FaHeart, FaShieldAlt, FaLightbulb, FaCheckCircle, FaCamera, FaUpload } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import Layout from '../../components/Layout';

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    company_name: '',
    company_description: '',
    website: '',
    location: '',
    industry: '',
    company_size: '',
    founded_year: '',
    contact_email: '',
    contact_phone: '',
    linkedin_url: '',
    twitter_url: '',
    headquarters: '',
    employee_benefits: '',
    company_culture: ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/recruiters/profile');
      setProfile(response.data);
      setFormData({
        company_name: response.data.company_name || '',
        company_description: response.data.company_description || '',
        website: response.data.company_website || '',
        location: response.data.location || '',
        industry: response.data.industry || '',
        company_size: response.data.company_size || '',
        founded_year: response.data.founded_year || '',
        contact_email: response.data.contact_email || '',
        contact_phone: response.data.contact_phone || '',
        linkedin_url: response.data.linkedin_url || '',
        twitter_url: response.data.twitter_url || '',
        headquarters: response.data.headquarters || '',
        employee_benefits: response.data.employee_benefits || '',
        company_culture: response.data.company_culture || ''
      });
      setLogoPreview(response.data.company_logo_url);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Logo must be less than 5MB');
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const uploadLogo = async () => {
    if (!logoFile) return profile?.company_logo;

    const formData = new FormData();
    formData.append('file', logoFile);
    formData.append('upload_preset', 'hireflow');

    try {
      const response = await fetch(
        'https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload',
        { method: 'POST', body: formData }
      );
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      toast.error('Failed to upload logo');
      return profile?.company_logo;
    }
  };

  const handleSave = async () => {
    try {
      const logoUrl = await uploadLogo();
      const updateData = { ...formData, company_logo: logoUrl };
      
      await api.put('/recruiters/profile', updateData);
      toast.success('Profile updated successfully!');
      setEditing(false);
      fetchProfile();
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({
      company_name: profile.company_name || '',
      company_description: profile.company_description || '',
      website: profile.company_website || '',
      location: profile.location || '',
      industry: profile.industry || '',
      company_size: profile.company_size || '',
      founded_year: profile.founded_year || '',
      contact_email: profile.contact_email || '',
      contact_phone: profile.contact_phone || '',
      linkedin_url: profile.linkedin_url || '',
      twitter_url: profile.twitter_url || '',
      headquarters: profile.headquarters || '',
      employee_benefits: profile.employee_benefits || '',
      company_culture: profile.company_culture || ''
    });
    setLogoPreview(profile?.company_logo_url);
    setLogoFile(null);
  };

  // Calculate profile completion percentage
  const calculateProfileStrength = () => {
    if (!profile) return 0;
    
    const fields = [
      profile.company_name,
      profile.company_description,
      profile.company_website,
      profile.location,
      profile.industry,
      profile.company_size,
      profile.founded_year,
      profile.contact_email,
      profile.contact_phone,
      profile.headquarters,
      profile.company_logo_url
    ];
    
    const filledFields = fields.filter(field => field && field.toString().trim() !== '').length;
    const totalFields = fields.length;
    
    return Math.round((filledFields / totalFields) * 100);
  };

  const profileStrength = calculateProfileStrength();

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="relative inline-block">
              <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-600"></div>
              <FaBuilding className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-600 text-2xl animate-pulse" />
            </div>
            <p className="mt-6 text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Loading your company profile...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-10 mb-12 overflow-hidden"
          >
            {/* Animated background effects */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-yellow-300 opacity-10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-pink-400 opacity-5 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between flex-wrap gap-6">
                <div className="flex items-center gap-6">
                  <div className="p-5 bg-white/20 backdrop-blur-sm rounded-2xl">
                    <FaBuilding className="text-6xl text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-2 flex items-center gap-3">
                      Company Profile
                      <FaTrophy className="text-yellow-300 animate-pulse" />
                    </h1>
                    <p className="text-blue-100 text-lg">Showcase your company to top talent worldwide</p>
                  </div>
                </div>
                
                {!editing ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-xl hover:shadow-2xl transition-all font-black"
                  >
                    <FaEdit className="text-xl" /> Edit Profile
                  </motion.button>
                ) : (
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSave}
                      className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl hover:shadow-2xl transition-all font-black"
                    >
                      <FaSave className="text-xl" /> Save Changes
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCancel}
                      className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl hover:bg-white/30 transition-all font-black border-2 border-white/30"
                    >
                      <FaTimes className="text-xl" /> Cancel
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Company Logo & Stats Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1 space-y-6"
            >
              {/* Logo Card */}
              <div className="relative bg-white rounded-2xl shadow-xl p-8 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-50"></div>
                
                <div className="relative z-10">
                  <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                      <FaCamera className="text-white" />
                    </div>
                    Company Logo
                  </h2>
                  
                  <div className="flex flex-col items-center">
                    <div className="relative w-56 h-56 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6 overflow-hidden group">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Company Logo" className="w-full h-full object-cover" />
                      ) : (
                        <FaBuilding className="text-gray-300 text-7xl" />
                      )}
                      {editing && (
                        <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <FaUpload className="text-white text-3xl" />
                        </div>
                      )}
                    </div>
                    
                    {editing && (
                      <div className="w-full">
                        <label className="block w-full cursor-pointer">
                          <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-center hover:shadow-lg transition-all">
                            <FaUpload className="inline mr-2" /> Upload New Logo
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoChange}
                            className="hidden"
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-3 text-center">
                          <FaShieldAlt className="inline mr-1" /> Max size: 5MB • JPG, PNG, GIF
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Strength Card */}
              <div className="relative bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 rounded-2xl shadow-xl p-8 text-white overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                      <FaTrophy className="text-3xl" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black">Profile Strength</h3>
                      <p className="text-emerald-100 text-sm">Attract top talent!</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-lg font-bold mb-2">
                        <span>Completion</span>
                        <span className="text-2xl">{profileStrength}%</span>
                      </div>
                      <div className="w-full bg-white bg-opacity-20 rounded-full h-4">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${profileStrength}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="bg-white rounded-full h-4 shadow-lg"
                        ></motion.div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-white/20">
                      {profileStrength === 100 ? (
                        <div className="flex items-center gap-2 text-yellow-300">
                          <FaStar className="animate-pulse" />
                          <span className="font-bold">🎉 Your profile is complete!</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-sm text-emerald-100 font-medium">
                            <FaLightbulb className="inline mr-2" />
                            {100 - profileStrength}% to perfection
                          </p>
                          <p className="text-xs text-white/80">
                            Complete all fields to maximize visibility
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Info Card */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                    <FaAward className="text-white" />
                  </div>
                  Quick Info
                </h3>
                
                <div className="space-y-4">
                  {profile?.company_name && (
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                      <FaBuilding className="text-blue-600 text-xl" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Company</p>
                        <p className="font-bold text-gray-900">{profile.company_name}</p>
                      </div>
                    </div>
                  )}
                  
                  {profile?.industry && (
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                      <FaRocket className="text-purple-600 text-xl" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Industry</p>
                        <p className="font-bold text-gray-900">{profile.industry}</p>
                      </div>
                    </div>
                  )}
                  
                  {profile?.company_size && (
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                      <FaUsers className="text-green-600 text-xl" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Company Size</p>
                        <p className="font-bold text-gray-900">{profile.company_size}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Company Information Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                    <FaBuilding className="text-white text-2xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Company Information</h2>
                    <p className="text-gray-600">Tell the world about your amazing company</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Company Name */}
                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                      <span className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                        <FaBuilding className="text-white text-xs" />
                      </span>
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      disabled={!editing}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-300 text-gray-900 font-medium"
                      placeholder="Enter your company name"
                    />
                  </div>

                  {/* Location */}
                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                      <span className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                        <FaMapMarkerAlt className="text-white text-xs" />
                      </span>
                      Location *
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      disabled={!editing}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-300 text-gray-900 font-medium"
                      placeholder="City, State"
                    />
                  </div>

                  {/* Website */}
                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                      <span className="p-1.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                        <FaGlobe className="text-white text-xs" />
                      </span>
                      Website
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      disabled={!editing}
                      placeholder="https://example.com"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-300 text-gray-900 font-medium"
                    />
                  </div>

                  {/* Industry */}
                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                      <span className="p-1.5 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
                        <FaBuilding className="text-white text-xs" />
                      </span>
                      Industry *
                    </label>
                    <input
                      type="text"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      disabled={!editing}
                      placeholder="e.g., Technology, Healthcare, Finance"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-300 text-gray-900 font-medium"
                    />
                  </div>

                  {/* Company Size */}
                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                      <span className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                        <FaUsers className="text-white text-xs" />
                      </span>
                      Company Size *
                    </label>
                    <select
                      value={formData.company_size}
                      onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
                      disabled={!editing}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-300 text-gray-900 font-medium"
                    >
                      <option value="">Select company size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="501-1000">501-1000 employees</option>
                      <option value="1001-5000">1001-5000 employees</option>
                      <option value="5001+">5000+ employees</option>
                    </select>
                  </div>

                  {/* Founded Year */}
                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                      <span className="p-1.5 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg">
                        <FaCalendar className="text-white text-xs" />
                      </span>
                      Founded Year
                    </label>
                    <input
                      type="number"
                      value={formData.founded_year}
                      onChange={(e) => setFormData({ ...formData, founded_year: e.target.value })}
                      disabled={!editing}
                      placeholder="e.g., 2020"
                      min="1800"
                      max={new Date().getFullYear()}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-yellow-100 focus:border-yellow-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-300 text-gray-900 font-medium"
                    />
                  </div>

                  {/* Headquarters */}
                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                      <span className="p-1.5 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg">
                        <FaMapMarkerAlt className="text-white text-xs" />
                      </span>
                      Headquarters
                    </label>
                    <input
                      type="text"
                      value={formData.headquarters}
                      onChange={(e) => setFormData({ ...formData, headquarters: e.target.value })}
                      disabled={!editing}
                      placeholder="City, Country"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-pink-100 focus:border-pink-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-300 text-gray-900 font-medium"
                    />
                  </div>

                  {/* Contact Email */}
                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                      <span className="p-1.5 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                        <FaEnvelope className="text-white text-xs" />
                      </span>
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      disabled={!editing}
                      placeholder="contact@company.com"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-300 text-gray-900 font-medium"
                    />
                  </div>

                  {/* Contact Phone */}
                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                      <span className="p-1.5 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg">
                        <FaPhone className="text-white text-xs" />
                      </span>
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                      disabled={!editing}
                      placeholder="+1 (555) 123-4567"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-300 text-gray-900 font-medium"
                    />
                  </div>

                  {/* LinkedIn URL */}
                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                      <span className="p-1.5 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg">
                        <FaLinkedin className="text-white text-xs" />
                      </span>
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      value={formData.linkedin_url}
                      onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                      disabled={!editing}
                      placeholder="https://linkedin.com/company/yourcompany"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-300 text-gray-900 font-medium"
                    />
                  </div>

                  {/* Twitter URL */}
                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                      <span className="p-1.5 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg">
                        <FaTwitter className="text-white text-xs" />
                      </span>
                      Twitter URL
                    </label>
                    <input
                      type="url"
                      value={formData.twitter_url}
                      onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                      disabled={!editing}
                      placeholder="https://twitter.com/yourcompany"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-sky-100 focus:border-sky-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-300 text-gray-900 font-medium"
                    />
                  </div>

                  {/* Company Description */}
                  <div className="md:col-span-2 group">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                      <span className="p-1.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                        <FaLightbulb className="text-white text-xs" />
                      </span>
                      Company Description *
                    </label>
                    <textarea
                      value={formData.company_description}
                      onChange={(e) => setFormData({ ...formData, company_description: e.target.value })}
                      disabled={!editing}
                      rows="5"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-300 text-gray-900 font-medium resize-none"
                      placeholder="Tell job seekers about your company..."
                    ></textarea>
                  </div>

                  {/* Employee Benefits */}
                  <div className="md:col-span-2 group">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                      <span className="p-1.5 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg">
                        <FaHeart className="text-white text-xs" />
                      </span>
                      Employee Benefits
                    </label>
                    <textarea
                      value={formData.employee_benefits}
                      onChange={(e) => setFormData({ ...formData, employee_benefits: e.target.value })}
                      disabled={!editing}
                      rows="4"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-300 text-gray-900 font-medium resize-none"
                      placeholder="Health insurance, 401k, paid time off, remote work options, etc."
                    ></textarea>
                  </div>

                  {/* Company Culture */}
                  <div className="md:col-span-2 group">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                      <span className="p-1.5 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg">
                        <FaRocket className="text-white text-xs" />
                      </span>
                      Company Culture
                    </label>
                    <textarea
                      value={formData.company_culture}
                      onChange={(e) => setFormData({ ...formData, company_culture: e.target.value })}
                      disabled={!editing}
                      rows="4"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-300 text-gray-900 font-medium resize-none"
                      placeholder="Describe your workplace culture, values, and work environment..."
                    ></textarea>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Layout>
    </div>
  );
};

export default Profile;
