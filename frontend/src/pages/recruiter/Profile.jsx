import { useState, useEffect } from 'react';
import { FaBuilding, FaEnvelope, FaPhone, FaGlobe, FaMapMarkerAlt, FaUsers, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../utils/api';

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
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-gray-900">Company Profile</h1>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
          >
            <FaEdit /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
            >
              <FaSave /> Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition-all"
            >
              <FaTimes /> Cancel
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Logo Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaBuilding className="text-primary-600" /> Company Logo
            </h2>
            <div className="flex flex-col items-center">
              <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center mb-4 overflow-hidden">
                {logoPreview ? (
                  <img src={logoPreview} alt="Company Logo" className="w-full h-full object-cover" />
                ) : (
                  <FaBuilding className="text-gray-400 text-6xl" />
                )}
              </div>
              {editing && (
                <div className="w-full">
                  <label className="block w-full">
                    <span className="sr-only">Choose logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">Max size: 5MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl shadow-lg p-6 mt-6 text-white">
            <h3 className="text-lg font-semibold mb-4">Profile Strength</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Completion</span>
                  <span>{profileStrength}%</span>
                </div>
                <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                  <div className="bg-white rounded-full h-2" style={{ width: `${profileStrength}%` }}></div>
                </div>
              </div>
              <p className="text-sm text-white text-opacity-90">
                {profileStrength === 100 
                  ? '🎉 Your profile is complete!' 
                  : 'Complete your profile to attract top talent!'}
              </p>
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Company Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaBuilding className="inline mr-2" /> Company Name *
                </label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  disabled={!editing}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaMapMarkerAlt className="inline mr-2" /> Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  disabled={!editing}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaGlobe className="inline mr-2" /> Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  disabled={!editing}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaBuilding className="inline mr-2" /> Industry *
                </label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  disabled={!editing}
                  placeholder="e.g., Technology, Healthcare, Finance"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaUsers className="inline mr-2" /> Company Size *
                </label>
                <select
                  value={formData.company_size}
                  onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
                  disabled={!editing}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaMapMarkerAlt className="inline mr-2" /> Headquarters
                </label>
                <input
                  type="text"
                  value={formData.headquarters}
                  onChange={(e) => setFormData({ ...formData, headquarters: e.target.value })}
                  disabled={!editing}
                  placeholder="City, Country"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaEnvelope className="inline mr-2" /> Contact Email *
                </label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  disabled={!editing}
                  placeholder="contact@company.com"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaPhone className="inline mr-2" /> Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  disabled={!editing}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  disabled={!editing}
                  placeholder="https://linkedin.com/company/yourcompany"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Twitter URL
                </label>
                <input
                  type="url"
                  value={formData.twitter_url}
                  onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                  disabled={!editing}
                  placeholder="https://twitter.com/yourcompany"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Description *
                </label>
                <textarea
                  value={formData.company_description}
                  onChange={(e) => setFormData({ ...formData, company_description: e.target.value })}
                  disabled={!editing}
                  rows="5"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                  placeholder="Tell job seekers about your company..."
                ></textarea>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee Benefits
                </label>
                <textarea
                  value={formData.employee_benefits}
                  onChange={(e) => setFormData({ ...formData, employee_benefits: e.target.value })}
                  disabled={!editing}
                  rows="4"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                  placeholder="Health insurance, 401k, paid time off, remote work options, etc."
                ></textarea>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Culture
                </label>
                <textarea
                  value={formData.company_culture}
                  onChange={(e) => setFormData({ ...formData, company_culture: e.target.value })}
                  disabled={!editing}
                  rows="4"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                  placeholder="Describe your workplace culture, values, and work environment..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
