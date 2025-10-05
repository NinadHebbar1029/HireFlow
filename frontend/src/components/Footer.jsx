import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <img src="/hireflow-icon.svg" alt="HireFlow" className="h-10 w-10" />
              <span className="ml-2 text-2xl font-bold">HireFlow</span>
            </div>
            <p className="text-gray-400">
              Connecting talent with opportunity through AI-powered job matching and face recognition authentication.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">For Job Seekers</h3>
            <ul className="space-y-2">
              <li><Link to="/register" className="text-gray-400 hover:text-white">Create Account</Link></li>
              <li><Link to="/login" className="text-gray-400 hover:text-white">Job Search</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">For Recruiters</h3>
            <ul className="space-y-2">
              <li><Link to="/register" className="text-gray-400 hover:text-white">Post a Job</Link></li>
              <li><Link to="/login" className="text-gray-400 hover:text-white">Find Candidates</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} HireFlow. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
