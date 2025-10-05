import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaBell, FaEnvelope, FaUser, FaSignOutAlt, FaBars, FaTimes, FaChevronDown } from 'react-icons/fa';
import { logout } from '../redux/slices/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      onClick={() => setMobileMenuOpen(false)}
      className={`relative px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
        isActiveLink(to)
          ? 'text-primary-600 bg-primary-50'
          : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
      }`}
    >
      {children}
      {isActiveLink(to) && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full"></span>
      )}
    </Link>
  );

  const getNavLinks = () => {
    if (!isAuthenticated) return null;

    switch (user?.role) {
      case 'job_seeker':
        return (
          <>
            <NavLink to="/job-seeker/dashboard">Dashboard</NavLink>
            <NavLink to="/job-seeker/jobs">Find Jobs</NavLink>
            <NavLink to="/job-seeker/applications">Applications</NavLink>
            <NavLink to="/job-seeker/saved-jobs">Saved Jobs</NavLink>
          </>
        );
      case 'recruiter':
        return (
          <>
            <NavLink to="/recruiter/dashboard">Dashboard</NavLink>
            <NavLink to="/recruiter/post-job">Post Job</NavLink>
            <NavLink to="/recruiter/jobs">Manage Jobs</NavLink>
          </>
        );
      case 'admin':
        return (
          <>
            <NavLink to="/admin/dashboard">Dashboard</NavLink>
            <NavLink to="/admin/users">Users</NavLink>
            <NavLink to="/admin/jobs">Jobs</NavLink>
            <NavLink to="/admin/analytics">Analytics</NavLink>
          </>
        );
      default:
        return null;
    }
  };

  const getMessagesLink = () => {
    switch (user?.role) {
      case 'job_seeker':
        return '/job-seeker/messages';
      case 'recruiter':
        return '/recruiter/messages';
      case 'admin':
        return '/admin/messages';
      default:
        return '/';
    }
  };

  const getProfileLink = () => {
    switch (user?.role) {
      case 'job_seeker':
        return '/job-seeker/profile';
      case 'recruiter':
        return '/recruiter/profile';
      case 'admin':
        return '/admin/profile';
      default:
        return '/';
    }
  };

  const getSettingsLink = () => {
    switch (user?.role) {
      case 'job_seeker':
        return '/job-seeker/settings';
      case 'recruiter':
        return '/recruiter/settings';
      case 'admin':
        return '/admin/settings';
      default:
        return '/';
    }
  };

  const getRoleName = () => {
    switch (user?.role) {
      case 'job_seeker':
        return 'Job Seeker';
      case 'recruiter':
        return 'Recruiter';
      case 'admin':
        return 'Admin';
      default:
        return 'User';
    }
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Main Nav */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <img src="/hireflow-icon.svg" alt="HireFlow" className="h-10 w-10 transition-transform group-hover:scale-110" />
                <div className="absolute inset-0 bg-primary-600 rounded-full blur-lg opacity-0 group-hover:opacity-20 transition-opacity"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                HireFlow
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            {isAuthenticated && (
              <div className="hidden lg:flex ml-10 space-x-2">
                {getNavLinks()}
              </div>
            )}
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-1">
            {isAuthenticated ? (
              <>
                {/* Desktop Icons */}
                <div className="hidden md:flex items-center space-x-1">
                  {/* Messages */}
                  <Link
                    to={getMessagesLink()}
                    className="relative p-2.5 rounded-lg text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-all duration-200"
                  >
                    <FaEnvelope className="h-5 w-5" />
                  </Link>

                  {/* Notifications */}
                  <Link
                    to={`/${user?.role}/dashboard`}
                    className="relative p-2.5 rounded-lg text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-all duration-200"
                  >
                    <FaBell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold shadow-lg animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>

                  {/* Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-all duration-200 ml-2"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold shadow-md">
                          {user?.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="hidden xl:block text-left">
                          <p className="text-sm font-semibold text-gray-900">{user?.email?.split('@')[0]}</p>
                          <p className="text-xs text-gray-500">{getRoleName()}</p>
                        </div>
                      </div>
                      <FaChevronDown className={`h-3 w-3 text-gray-500 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {profileDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setProfileDropdownOpen(false)}
                        ></div>
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl py-2 z-20 border border-gray-100">
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-sm font-semibold text-gray-900">{user?.email}</p>
                            <p className="text-xs text-gray-500 mt-1">{getRoleName()}</p>
                          </div>
                          <Link
                            to={getProfileLink()}
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                          >
                            <FaUser className="h-4 w-4" />
                            <span className="text-sm font-medium">My Profile</span>
                          </Link>
                          <Link
                            to={getSettingsLink()}
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-sm font-medium">Settings</span>
                          </Link>
                          <hr className="my-2 border-gray-100" />
                          <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors w-full"
                          >
                            <FaSignOutAlt className="h-4 w-4" />
                            <span className="text-sm font-medium">Sign Out</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                >
                  {mobileMenuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 hover:text-primary-600 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 font-medium shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isAuthenticated && mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white shadow-lg">
          <div className="px-4 py-4 space-y-1">
            {getNavLinks()}
            <hr className="my-3 border-gray-200" />
            <Link
              to={getMessagesLink()}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
            >
              <FaEnvelope className="h-5 w-5" />
              <span className="font-medium">Messages</span>
            </Link>
            <Link
              to={getProfileLink()}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
            >
              <FaUser className="h-5 w-5" />
              <span className="font-medium">Profile</span>
            </Link>
            <Link
              to={getSettingsLink()}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-medium">Settings</span>
            </Link>
            <hr className="my-3 border-gray-200" />
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full"
            >
              <FaSignOutAlt className="h-5 w-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
