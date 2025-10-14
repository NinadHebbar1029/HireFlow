import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaBrain,
  FaShieldAlt, 
  FaRocket,
  FaHandshake,
  FaGlobe,
  FaStar,
  FaCheckCircle,
  FaArrowRight,
  FaBuilding,
  FaUserTie,
  FaChartBar,
  FaBolt,
  FaHeart,
  FaQuoteLeft,
  FaChartLine
} from 'react-icons/fa';
import Layout from '../../components/Layout';

const LandingPage = () => {
  const [activeTab, setActiveTab] = useState('seekers');
  const [statsCounter, setStatsCounter] = useState({ jobs: 0, users: 0, companies: 0, success: 0 });

  useEffect(() => {
    const targets = { jobs: 10000, users: 50000, companies: 5000, success: 95 };
    const duration = 2000;
    const steps = 60;
    const increment = {
      jobs: targets.jobs / steps,
      users: targets.users / steps,
      companies: targets.companies / steps,
      success: targets.success / steps,
    };

    let step = 0;
    const timer = setInterval(() => {
      if (step < steps) {
        setStatsCounter({
          jobs: Math.min(Math.floor(increment.jobs * step), targets.jobs),
          users: Math.min(Math.floor(increment.users * step), targets.users),
          companies: Math.min(Math.floor(increment.companies * step), targets.companies),
          success: Math.min(Math.floor(increment.success * step), targets.success),
        });
        step++;
      } else {
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  const features = [
    {
      icon: <FaBrain />,
      title: "AI-Powered Matching",
      description: "Smart algorithms match the right talent with the right opportunities",
      color: "from-purple-500 to-indigo-600"
    },
    {
      icon: <FaShieldAlt />,
      title: "Secure & Private",
      description: "Enterprise-grade security with optional biometric authentication",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: <FaBolt />,
      title: "Lightning Fast",
      description: "Apply to jobs in seconds, get responses in minutes",
      color: "from-yellow-500 to-orange-600"
    },
    {
      icon: <FaChartLine />,
      title: "Real-Time Analytics",
      description: "Track your success with powerful insights and data visualization",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: <FaHandshake />,
      title: "Direct Communication",
      description: "Connect instantly with hiring managers and candidates",
      color: "from-pink-500 to-rose-600"
    },
    {
      icon: <FaGlobe />,
      title: "Global Opportunities",
      description: "Access jobs from companies worldwide, work from anywhere",
      color: "from-teal-500 to-cyan-600"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Software Engineer",
      company: "Tech Corp",
      image: "https://i.pravatar.cc/150?img=1",
      quote: "Found my dream job in just 2 weeks! The AI matching is incredibly accurate."
    },
    {
      name: "Michael Chen",
      role: "HR Manager",
      company: "Global Industries",
      image: "https://i.pravatar.cc/150?img=2",
      quote: "HireFlow transformed our hiring process. We filled 15 positions in a month!"
    },
    {
      name: "Emily Rodriguez",
      role: "Marketing Director",
      company: "Creative Agency",
      image: "https://i.pravatar.cc/150?img=3",
      quote: "The best recruitment platform I've ever used. Simple, fast, and effective."
    }
  ];

  const seekerSteps = [
    {
      icon: <FaUserTie />,
      title: "Create Your Profile",
      description: "Build your professional profile in minutes. Upload your resume, add skills, and showcase your experience."
    },
    {
      icon: <FaBrain />,
      title: "Get AI Recommendations",
      description: "Our smart algorithm analyzes your profile and suggests perfect job matches based on your skills and preferences."
    },
    {
      icon: <FaRocket />,
      title: "Apply & Get Hired",
      description: "Apply with one click, track applications in real-time, and connect directly with hiring managers."
    }
  ];

  const recruiterSteps = [
    {
      icon: <FaBuilding />,
      title: "Post Your Job",
      description: "Create detailed job listings with requirements, benefits, and company culture. Get noticed by top talent."
    },
    {
      icon: <FaChartBar />,
      title: "Smart Candidate Matching",
      description: "AI-powered system filters and ranks candidates based on skills, experience, and job fit scores."
    },
    {
      icon: <FaHandshake />,
      title: "Hire Top Talent",
      description: "Review applications, schedule interviews, and make offers—all within our intuitive platform."
    }
  ];

  const steps = activeTab === 'seekers' ? seekerSteps : recruiterSteps;

  return (
    <Layout>
      {/* Hero Section with Animated Background */}
      <div className="relative min-h-[90vh] overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full px-6 py-2 mb-8"
            >
              <FaRocket className="text-yellow-400" />
              <span className="text-white font-medium">Welcome to the Future of Hiring</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight"
            >
              Your Career Journey
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400">
                Starts Here
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Connect with top talent or discover your dream job through our AI-powered platform. 
              Smart matching, instant connections, limitless possibilities.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row justify-center gap-4 mb-16"
            >
              <Link 
                to="/register" 
                className="group relative px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold rounded-full text-lg shadow-2xl hover:shadow-yellow-500/50 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Get Started Free
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/login" 
                className="px-8 py-4 bg-white/10 backdrop-blur-lg border-2 border-white/30 text-white font-bold rounded-full text-lg hover:bg-white/20 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Sign In
                <FaArrowRight />
              </Link>
            </motion.div>

            {/* Stats Counter */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            >
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2">
                  {statsCounter.jobs.toLocaleString()}+
                </div>
                <div className="text-gray-300 text-sm md:text-base">Active Jobs</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-pink-400 mb-2">
                  {statsCounter.users.toLocaleString()}+
                </div>
                <div className="text-gray-300 text-sm md:text-base">Happy Users</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-purple-400 mb-2">
                  {statsCounter.companies.toLocaleString()}+
                </div>
                <div className="text-gray-300 text-sm md:text-base">Companies</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-green-400 mb-2">
                  {statsCounter.success}%
                </div>
                <div className="text-gray-300 text-sm md:text-base">Success Rate</div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-auto">
            <path 
              fill="#ffffff" 
              d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
            />
          </svg>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full font-semibold text-sm mb-4">
              <FaStar />
              Why Choose HireFlow
            </motion.div>
            <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </motion.h2>
            <motion.p variants={itemVariants} className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to make hiring and job hunting effortless
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500`}></div>
                
                <div className={`relative inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} text-white text-2xl mb-6 shadow-lg`}>
                  {feature.icon}
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                
                <div className="mt-6 flex items-center text-indigo-600 font-semibold group-hover:gap-2 transition-all">
                  Learn more 
                  <FaArrowRight className="ml-2 opacity-0 group-hover:opacity-100 transition-all" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-24 bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full font-semibold text-sm mb-4">
              <FaBolt />
              Simple Process
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to transform your career or find the perfect candidate
            </p>
          </motion.div>

          {/* Tab Selector */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-white rounded-full p-2 shadow-lg border border-gray-200">
              <button
                onClick={() => setActiveTab('seekers')}
                className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                  activeTab === 'seekers'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FaUserTie className="inline mr-2" />
                For Job Seekers
              </button>
              <button
                onClick={() => setActiveTab('recruiters')}
                className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                  activeTab === 'recruiters'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FaBuilding className="inline mr-2" />
                For Recruiters
              </button>
            </div>
          </div>

          {/* Steps */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
          >
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-1/4 left-1/4 right-1/4 h-1 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 transform -translate-y-1/2"></div>

            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="relative bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-indigo-100"
              >
                {/* Step Number */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className="flex justify-center mb-6 mt-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl flex items-center justify-center text-4xl text-indigo-600">
                    {step.icon}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">{step.title}</h3>
                <p className="text-gray-600 text-center leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <Link
              to="/register"
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-full text-lg shadow-2xl hover:shadow-indigo-500/50 transform hover:scale-105 transition-all duration-300"
            >
              {activeTab === 'seekers' ? 'Start Your Job Hunt' : 'Start Hiring Today'}
              <FaArrowRight />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 px-4 py-2 rounded-full font-semibold text-sm mb-4">
              <FaHeart />
              Loved by Thousands
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of happy job seekers and recruiters who found success with HireFlow
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className="bg-gradient-to-br from-gray-50 to-indigo-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-indigo-100"
              >
                {/* Quote Icon */}
                <div className="text-indigo-300 text-4xl mb-4">
                  <FaQuoteLeft />
                </div>

                {/* Quote */}
                <p className="text-gray-700 text-lg mb-6 leading-relaxed italic">
                  "{testimonial.quote}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
                  />
                  <div>
                    <div className="font-bold text-gray-900 text-lg">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.role}</div>
                    <div className="text-indigo-600 text-sm font-semibold">{testimonial.company}</div>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex gap-1 mt-4 text-yellow-400 text-xl">
                  {[...Array(5)].map((_, i) => <FaStar key={i} />)}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-24 overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
              Ready to Transform Your Future?
            </h2>
            <p className="text-xl md:text-2xl text-indigo-100 mb-12 max-w-3xl mx-auto">
              Join thousands of professionals who are already experiencing the power of AI-driven recruitment
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link
                to="/register"
                className="group px-10 py-5 bg-white text-indigo-600 font-bold rounded-full text-lg shadow-2xl hover:shadow-white/30 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
              >
                Get Started Now
                <FaRocket className="group-hover:translate-y-[-4px] transition-transform" />
              </Link>
              <Link
                to="/login"
                className="px-10 py-5 bg-transparent border-3 border-white text-white font-bold rounded-full text-lg hover:bg-white hover:text-indigo-600 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
              >
                Sign In
                <FaArrowRight />
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-white/80">
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-green-400 text-xl" />
                <span className="font-semibold">Free to Join</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-green-400 text-xl" />
                <span className="font-semibold">No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-green-400 text-xl" />
                <span className="font-semibold">Cancel Anytime</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default LandingPage;
