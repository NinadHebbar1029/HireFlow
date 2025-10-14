import React from 'react';
import { motion } from 'framer-motion';
import { FaRocket, FaUsers, FaLightbulb, FaHeart, FaLinkedin, FaTwitter, FaGithub } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AboutUs = () => {
  const navigate = useNavigate();

  const values = [
    {
      icon: <FaRocket className="text-4xl" />,
      title: 'Innovation',
      description: 'We continuously evolve our platform with cutting-edge technology to provide the best experience.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <FaUsers className="text-4xl" />,
      title: 'Community',
      description: 'Building meaningful connections between talented professionals and forward-thinking companies.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: <FaLightbulb className="text-4xl" />,
      title: 'Excellence',
      description: 'Committed to delivering exceptional quality in everything we do, from features to support.',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: <FaHeart className="text-4xl" />,
      title: 'Passion',
      description: 'We are passionate about helping people find their dream jobs and companies find top talent.',
      gradient: 'from-green-500 to-teal-500'
    }
  ];

  const team = [
    { name: 'Sarah Johnson', role: 'CEO & Founder', image: '👩‍💼' },
    { name: 'Michael Chen', role: 'CTO', image: '👨‍💻' },
    { name: 'Emily Rodriguez', role: 'Head of Product', image: '👩‍🎨' },
    { name: 'David Kim', role: 'Lead Developer', image: '👨‍🔧' }
  ];

  const stats = [
    { number: '50K+', label: 'Active Users' },
    { number: '10K+', label: 'Companies' },
    { number: '100K+', label: 'Jobs Posted' },
    { number: '95%', label: 'Success Rate' }
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
            About HireFlow
          </motion.h1>
          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl max-w-3xl mx-auto font-light"
          >
            Revolutionizing the way talent meets opportunity
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

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="bg-white rounded-2xl shadow-xl p-6 text-center border-2 border-purple-100"
            >
              <p className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {stat.number}
              </p>
              <p className="text-gray-600 font-semibold mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-2xl p-12 border-2 border-purple-100"
        >
          <h2 className="text-4xl font-black text-center mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Our Mission
          </h2>
          <p className="text-lg text-gray-700 text-center max-w-4xl mx-auto leading-relaxed">
            At HireFlow, we believe that finding the right job or the perfect candidate shouldn't be complicated. 
            Our mission is to create a seamless, intelligent platform that connects exceptional talent with 
            outstanding opportunities. We leverage cutting-edge technology, including AI-powered matching and 
            real-time communication tools, to make the hiring process efficient, transparent, and rewarding for everyone.
          </p>
        </motion.div>
      </div>

      {/* Values Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-black text-center mb-16 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
        >
          Our Core Values
        </motion.h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-100 hover:border-purple-300 transition-all"
            >
              <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${value.gradient} text-white mb-6`}>
                {value.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{value.title}</h3>
              <p className="text-gray-600 leading-relaxed">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Team Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-black text-center mb-16 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
        >
          Meet Our Team
        </motion.h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-white rounded-2xl shadow-xl p-8 text-center border-2 border-gray-100 hover:border-purple-300 transition-all"
            >
              <div className="text-7xl mb-4">{member.image}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
              <p className="text-purple-600 font-semibold mb-4">{member.role}</p>
              <div className="flex justify-center gap-3">
                <FaLinkedin className="text-2xl text-gray-400 hover:text-blue-600 cursor-pointer transition-colors" />
                <FaTwitter className="text-2xl text-gray-400 hover:text-blue-400 cursor-pointer transition-colors" />
                <FaGithub className="text-2xl text-gray-400 hover:text-gray-900 cursor-pointer transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl shadow-2xl p-12 text-center text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-300 opacity-10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl font-black mb-4">Join Our Journey</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Be part of the future of recruitment. Whether you're looking for your dream job or seeking top talent.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/register')}
                className="px-8 py-3 bg-white text-purple-600 rounded-full font-bold shadow-xl hover:shadow-2xl transition-all"
              >
                Get Started
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/contact')}
                className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-full font-bold hover:bg-white hover:text-purple-600 transition-all"
              >
                Contact Us
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutUs;
