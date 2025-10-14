import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaLinkedin, FaTwitter, FaFacebook, FaInstagram, FaPaperPlane } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate sending message
    setTimeout(() => {
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: <FaEnvelope className="text-3xl" />,
      title: 'Email',
      content: 'support@hireflow.com',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <FaPhone className="text-3xl" />,
      title: 'Phone',
      content: '+1 (555) 123-4567',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: <FaMapMarkerAlt className="text-3xl" />,
      title: 'Office',
      content: '123 Innovation Street, Tech Valley, CA 94025',
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  const socialLinks = [
    { icon: <FaLinkedin />, name: 'LinkedIn', color: 'hover:text-blue-600' },
    { icon: <FaTwitter />, name: 'Twitter', color: 'hover:text-blue-400' },
    { icon: <FaFacebook />, name: 'Facebook', color: 'hover:text-blue-700' },
    { icon: <FaInstagram />, name: 'Instagram', color: 'hover:text-pink-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-24 overflow-hidden"
      >
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-300 opacity-10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-6xl font-black mb-6"
          >
            Get In Touch
          </motion.h1>
          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl max-w-3xl mx-auto font-light"
          >
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </motion.p>
          <motion.button
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="mt-8 px-8 py-3 bg-white text-purple-600 rounded-full font-bold shadow-xl hover:shadow-2xl transition-all"
          >
            Back to Home
          </motion.button>
        </div>
      </motion.div>

      {/* Contact Info Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="grid md:grid-cols-3 gap-6">
          {contactInfo.map((info, index) => (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl shadow-xl p-8 text-center border-2 border-purple-100"
            >
              <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${info.gradient} text-white mb-4`}>
                {info.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{info.title}</h3>
              <p className="text-gray-600">{info.content}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-2xl p-10 border-2 border-purple-100"
          >
            <h2 className="text-3xl font-black mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Send us a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors resize-none"
                  placeholder="Tell us more about your inquiry..."
                ></textarea>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    Send Message
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="bg-white rounded-3xl shadow-2xl p-10 border-2 border-purple-100">
              <h2 className="text-3xl font-black mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Why Contact Us?
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg mt-1">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Technical Support</h3>
                    <p className="text-gray-600">Get help with any technical issues or questions</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-2 bg-pink-100 rounded-lg mt-1">
                    <div className="w-2 h-2 bg-pink-600 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Partnership Opportunities</h3>
                    <p className="text-gray-600">Explore collaboration possibilities with HireFlow</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg mt-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">General Inquiries</h3>
                    <p className="text-gray-600">Any questions about our services or features</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg mt-1">
                    <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Feedback & Suggestions</h3>
                    <p className="text-gray-600">We value your input to improve our platform</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Social Media */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl shadow-2xl p-10 text-white">
              <h2 className="text-3xl font-black mb-6">Follow Us</h2>
              <p className="mb-6 text-purple-100">Stay connected on social media for updates and news</p>
              <div className="flex gap-4">
                {socialLinks.map((social, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-4 bg-white bg-opacity-20 rounded-xl cursor-pointer hover:bg-opacity-30 transition-all"
                  >
                    <div className="text-2xl">{social.icon}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-3xl shadow-2xl p-10 border-2 border-purple-100">
              <h2 className="text-2xl font-black mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Business Hours
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Monday - Friday</span>
                  <span className="text-purple-600 font-bold">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Saturday</span>
                  <span className="text-purple-600 font-bold">10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Sunday</span>
                  <span className="text-gray-400 font-bold">Closed</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
