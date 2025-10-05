import React from 'react';
import { Link } from 'react-router-dom';
import { FaBriefcase, FaUsers, FaChartLine, FaShieldAlt } from 'react-icons/fa';
import Layout from '../../components/Layout';

const LandingPage = () => {
  return (
    <Layout>
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">Welcome to HireFlow</h1>
          <p className="text-xl mb-8">AI-Powered Job Portal with Face Recognition Authentication</p>
          <div className="flex justify-center space-x-4">
            <Link to="/register" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
              Get Started
            </Link>
            <Link to="/login" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose HireFlow?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaBriefcase className="text-primary-600 text-3xl" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Job Matching</h3>
            <p className="text-gray-600">Get personalized job recommendations based on your skills</p>
          </div>

          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaShieldAlt className="text-primary-600 text-3xl" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Face Recognition</h3>
            <p className="text-gray-600">Secure authentication with optional face recognition</p>
          </div>

          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaUsers className="text-primary-600 text-3xl" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Skill-Based Matching</h3>
            <p className="text-gray-600">Apply only to jobs that match your skills</p>
          </div>

          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaChartLine className="text-primary-600 text-3xl" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Analytics Dashboard</h3>
            <p className="text-gray-600">Track your applications and recruitment progress</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-4">For Job Seekers</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">✓</span>
                  <span>Create your profile and upload resume</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">✓</span>
                  <span>Get AI-powered job recommendations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">✓</span>
                  <span>Apply to jobs matching your skills</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">✓</span>
                  <span>Track application status in real-time</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">✓</span>
                  <span>Message directly with recruiters</span>
                </li>
              </ul>
              <Link to="/register" className="inline-block mt-6 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700">
                Join as Job Seeker
              </Link>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-4">For Recruiters</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">✓</span>
                  <span>Post unlimited job listings</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">✓</span>
                  <span>Find candidates with matching skills</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">✓</span>
                  <span>Manage applications efficiently</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">✓</span>
                  <span>Access analytics and insights</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">✓</span>
                  <span>Communicate with candidates</span>
                </li>
              </ul>
              <Link to="/register" className="inline-block mt-6 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700">
                Join as Recruiter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LandingPage;
