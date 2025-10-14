import React from 'react';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaLock, FaUserSecret, FaCookie, FaDatabase, FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  const sections = [
    {
      icon: <FaDatabase className="text-3xl" />,
      title: 'Information We Collect',
      gradient: 'from-blue-500 to-cyan-500',
      content: [
        'Personal information (name, email, phone number)',
        'Profile information (resume, skills, experience)',
        'Usage data and analytics',
        'Device and browser information',
        'Location data (with permission)',
        'Communication preferences'
      ]
    },
    {
      icon: <FaLock className="text-3xl" />,
      title: 'How We Use Your Information',
      gradient: 'from-purple-500 to-pink-500',
      content: [
        'Facilitate job matching and applications',
        'Improve our services and user experience',
        'Send relevant notifications and updates',
        'Provide customer support',
        'Prevent fraud and ensure security',
        'Comply with legal obligations'
      ]
    },
    {
      icon: <FaUserSecret className="text-3xl" />,
      title: 'Information Sharing',
      gradient: 'from-orange-500 to-red-500',
      content: [
        'With recruiters when you apply for jobs',
        'With service providers who assist our operations',
        'When required by law or legal process',
        'With your explicit consent',
        'In aggregate, anonymized form for analytics',
        'Never sold to third parties for marketing'
      ]
    },
    {
      icon: <FaShieldAlt className="text-3xl" />,
      title: 'Your Rights & Choices',
      gradient: 'from-green-500 to-teal-500',
      content: [
        'Access and download your data',
        'Update or correct your information',
        'Delete your account and data',
        'Opt-out of marketing communications',
        'Control privacy settings',
        'Request data portability'
      ]
    },
    {
      icon: <FaCookie className="text-3xl" />,
      title: 'Cookies & Tracking',
      gradient: 'from-indigo-500 to-purple-500',
      content: [
        'Essential cookies for site functionality',
        'Analytics cookies to improve our service',
        'Preference cookies to remember your settings',
        'You can control cookies via browser settings',
        'Some features may not work without cookies',
        'Third-party cookies for integrated services'
      ]
    },
    {
      icon: <FaCheckCircle className="text-3xl" />,
      title: 'Data Security',
      gradient: 'from-pink-500 to-rose-500',
      content: [
        'Industry-standard encryption (SSL/TLS)',
        'Regular security audits and updates',
        'Secure data storage and backups',
        'Access controls and authentication',
        'Employee training on data protection',
        'Incident response procedures in place'
      ]
    }
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
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex p-4 bg-white bg-opacity-20 rounded-3xl mb-6"
          >
            <FaShieldAlt className="text-6xl" />
          </motion.div>
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-6xl font-black mb-6"
          >
            Privacy Policy
          </motion.h1>
          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl max-w-3xl mx-auto font-light mb-4"
          >
            Your privacy is our priority
          </motion.p>
          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm max-w-2xl mx-auto text-purple-100"
          >
            Last updated: October 15, 2025
          </motion.p>
          <motion.button
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="mt-8 px-8 py-3 bg-white text-purple-600 rounded-full font-bold shadow-xl hover:shadow-2xl transition-all"
          >
            Back to Home
          </motion.button>
        </div>
      </motion.div>

      {/* Introduction */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-2xl p-10 border-2 border-purple-100 mb-12"
        >
          <h2 className="text-3xl font-black mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Introduction
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Welcome to HireFlow's Privacy Policy. We respect your privacy and are committed to protecting your personal data. 
            This privacy policy will inform you about how we look after your personal data when you visit our website and 
            tell you about your privacy rights and how the law protects you.
          </p>
          <p className="text-gray-700 leading-relaxed">
            By using HireFlow, you agree to the collection and use of information in accordance with this policy. 
            If you do not agree with our policies and practices, please do not use our services.
          </p>
        </motion.div>

        {/* Policy Sections */}
        <div className="grid md:grid-cols-2 gap-8">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-100 hover:border-purple-300 transition-all"
            >
              <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${section.gradient} text-white mb-6`}>
                {section.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.content.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Additional Important Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-2xl p-10 border-2 border-purple-100 mt-12"
        >
          <h2 className="text-3xl font-black mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Data Retention
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            We will retain your personal data only for as long as necessary for the purposes set out in this privacy policy. 
            We will retain and use your personal data to the extent necessary to comply with our legal obligations, resolve 
            disputes, and enforce our policies.
          </p>

          <h2 className="text-3xl font-black mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            International Data Transfers
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Your information may be transferred to and maintained on computers located outside of your state, province, 
            country, or other governmental jurisdiction where data protection laws may differ. We ensure appropriate 
            safeguards are in place for such transfers.
          </p>

          <h2 className="text-3xl font-black mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Children's Privacy
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Our services are not intended for individuals under the age of 16. We do not knowingly collect personal data 
            from children. If you are a parent or guardian and believe your child has provided us with personal data, 
            please contact us.
          </p>

          <h2 className="text-3xl font-black mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Changes to This Policy
          </h2>
          <p className="text-gray-700 leading-relaxed">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
            Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy 
            Policy periodically for any changes.
          </p>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl shadow-2xl p-10 text-white mt-12 text-center"
        >
          <h2 className="text-3xl font-black mb-4">Questions About Our Privacy Policy?</h2>
          <p className="text-xl mb-6 text-purple-100">
            If you have any questions about this Privacy Policy, please don't hesitate to contact us.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/contact')}
            className="px-8 py-3 bg-white text-purple-600 rounded-full font-bold shadow-xl hover:shadow-2xl transition-all"
          >
            Contact Us
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
