import React from 'react';
import { motion } from 'framer-motion';
import { FaFileContract, FaBalanceScale, FaUserCheck, FaExclamationTriangle, FaGavel, FaHandshake } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
  const navigate = useNavigate();

  const sections = [
    {
      icon: <FaUserCheck className="text-3xl" />,
      title: 'Account Responsibilities',
      gradient: 'from-blue-500 to-cyan-500',
      content: [
        'You must be at least 16 years old to use our services',
        'Provide accurate and complete registration information',
        'Maintain the security of your account credentials',
        'Notify us immediately of any unauthorized use',
        'One person or entity per account',
        'You are responsible for all activities under your account'
      ]
    },
    {
      icon: <FaHandshake className="text-3xl" />,
      title: 'Acceptable Use',
      gradient: 'from-purple-500 to-pink-500',
      content: [
        'Use the platform for lawful purposes only',
        'Provide truthful information in profiles and applications',
        'Respect intellectual property rights',
        'No harassment, discrimination, or abusive behavior',
        'No spam or unsolicited communications',
        'Comply with all applicable laws and regulations'
      ]
    },
    {
      icon: <FaExclamationTriangle className="text-3xl" />,
      title: 'Prohibited Activities',
      gradient: 'from-orange-500 to-red-500',
      content: [
        'Posting false or misleading job listings',
        'Scraping or automated data collection',
        'Attempting to hack or compromise security',
        'Sharing accounts or selling access',
        'Posting malicious content or malware',
        'Impersonating others or providing fake credentials'
      ]
    },
    {
      icon: <FaBalanceScale className="text-3xl" />,
      title: 'Intellectual Property',
      gradient: 'from-green-500 to-teal-500',
      content: [
        'HireFlow retains all rights to platform content',
        'You retain rights to content you submit',
        'You grant us license to use your content on the platform',
        'Respect trademarks, copyrights, and other IP rights',
        'Report any copyright infringement to us',
        'We may remove infringing content without notice'
      ]
    },
    {
      icon: <FaGavel className="text-3xl" />,
      title: 'Termination & Suspension',
      gradient: 'from-indigo-500 to-purple-500',
      content: [
        'We may suspend or terminate accounts for violations',
        'You can delete your account at any time',
        'Termination doesn\'t eliminate existing obligations',
        'We reserve the right to refuse service',
        'No refunds for terminated accounts',
        'Certain provisions survive termination'
      ]
    },
    {
      icon: <FaFileContract className="text-3xl" />,
      title: 'Disclaimers & Limitations',
      gradient: 'from-pink-500 to-rose-500',
      content: [
        'Platform provided "as is" without warranties',
        'We don\'t guarantee job placements or hires',
        'Not responsible for user-generated content',
        'Limited liability for damages',
        'You indemnify us against claims arising from your use',
        'Dispute resolution through arbitration'
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
            <FaFileContract className="text-6xl" />
          </motion.div>
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-6xl font-black mb-6"
          >
            Terms of Service
          </motion.h1>
          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl max-w-3xl mx-auto font-light mb-4"
          >
            Please read these terms carefully before using HireFlow
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
            Agreement to Terms
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            These Terms of Service ("Terms") constitute a legally binding agreement between you and HireFlow 
            ("Company," "we," "us," or "our") concerning your access to and use of the HireFlow platform and services.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            By accessing or using our services, you agree to be bound by these Terms. If you disagree with any part 
            of these Terms, you may not access the service.
          </p>
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 p-6 rounded-lg mt-6">
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className="text-yellow-600 text-2xl mt-1 flex-shrink-0" />
              <div>
                <p className="font-bold text-gray-900 mb-2">Important Notice</p>
                <p className="text-gray-700">
                  These terms include important information about your legal rights, remedies, and obligations. 
                  Please read them carefully.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Terms Sections */}
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
                    <div className="p-1 bg-purple-100 rounded-full mt-1 flex-shrink-0">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    </div>
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Additional Legal Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-2xl p-10 border-2 border-purple-100 mt-12"
        >
          <h2 className="text-3xl font-black mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Service Modifications
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            We reserve the right to modify, suspend, or discontinue any part of our services at any time. We may also 
            impose limits on certain features or restrict access to parts or all of the service without notice or liability.
          </p>

          <h2 className="text-3xl font-black mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Payment Terms
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Certain features of our platform may require payment. You agree to provide current, complete, and accurate 
            purchase and account information. Prices are subject to change with notice. All payments are non-refundable 
            unless otherwise stated.
          </p>

          <h2 className="text-3xl font-black mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Privacy & Data Protection
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Your use of our services is also governed by our Privacy Policy. Please review our Privacy Policy to 
            understand our practices regarding the collection and use of your information.
          </p>

          <h2 className="text-3xl font-black mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Governing Law
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            These Terms shall be governed by and construed in accordance with the laws of the State of California, 
            without regard to its conflict of law provisions. Any disputes arising from these Terms will be resolved 
            through binding arbitration.
          </p>

          <h2 className="text-3xl font-black mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Changes to Terms
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            We may revise these Terms at any time. The most current version will always be posted on our website. 
            By continuing to use our services after changes become effective, you agree to be bound by the revised Terms.
          </p>

          <h2 className="text-3xl font-black mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Contact Information
          </h2>
          <p className="text-gray-700 leading-relaxed">
            If you have any questions about these Terms, please contact us at{' '}
            <span className="font-bold text-purple-600">legal@hireflow.com</span>
          </p>
        </motion.div>

        {/* Acceptance Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl shadow-2xl p-10 text-white mt-12 text-center"
        >
          <h2 className="text-3xl font-black mb-4">By Using HireFlow, You Accept These Terms</h2>
          <p className="text-xl mb-6 text-purple-100">
            Your continued use of our platform constitutes acceptance of these Terms of Service.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              className="px-8 py-3 bg-white text-purple-600 rounded-full font-bold shadow-xl hover:shadow-2xl transition-all"
            >
              Create Account
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/contact')}
              className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-full font-bold hover:bg-white hover:text-purple-600 transition-all"
            >
              Contact Support
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfService;
