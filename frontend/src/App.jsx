import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SocketProvider } from './contexts/SocketContext';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import AboutUs from './pages/public/AboutUs';
import Contact from './pages/public/Contact';
import PrivacyPolicy from './pages/public/PrivacyPolicy';
import TermsOfService from './pages/public/TermsOfService';

// Job Seeker Pages
import JobSeekerDashboard from './pages/jobseeker/Dashboard';
import JobSeekerProfile from './pages/jobseeker/Profile';
import JobSearch from './pages/jobseeker/JobSearch';
import JobDetails from './pages/jobseeker/JobDetails';
import ApplyJob from './pages/jobseeker/ApplyJob';
import SavedJobs from './pages/jobseeker/SavedJobs';
import ApplicationStatus from './pages/jobseeker/ApplicationStatus';
import JobSeekerMessages from './pages/jobseeker/Messages';
import JobSeekerSettings from './pages/jobseeker/Settings';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/Dashboard';
import RecruiterProfile from './pages/recruiter/Profile';
import PostJob from './pages/recruiter/PostJob';
import ManageJobs from './pages/recruiter/ManageJobs';
import ApplicantsList from './pages/recruiter/ApplicantsList';
import ApplicantProfile from './pages/recruiter/ApplicantProfile';
import RecruiterMessages from './pages/recruiter/Messages';
import RecruiterSettings from './pages/recruiter/Settings';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import JobManagement from './pages/admin/JobManagement';
import ApplicationManagement from './pages/admin/ApplicationManagement';
import Analytics from './pages/admin/Analytics';
import AdminSettings from './pages/admin/Settings';

// Shared Pages
import Notifications from './pages/Notifications';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const getDefaultRoute = () => {
    if (!isAuthenticated) return '/';
    
    switch (user?.role) {
      case 'job_seeker':
        return '/job-seeker/dashboard';
      case 'recruiter':
        return '/recruiter/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  return (
    <SocketProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={isAuthenticated ? <Navigate to={getDefaultRoute()} /> : <LandingPage />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to={getDefaultRoute()} /> : <LoginPage />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to={getDefaultRoute()} /> : <RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />

        {/* Shared Routes - Available to all authenticated users */}
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

        {/* Job Seeker Routes */}
        <Route path="/job-seeker/dashboard" element={<ProtectedRoute allowedRoles={['job_seeker']}><JobSeekerDashboard /></ProtectedRoute>} />
        <Route path="/job-seeker/profile" element={<ProtectedRoute allowedRoles={['job_seeker']}><JobSeekerProfile /></ProtectedRoute>} />
        <Route path="/job-seeker/jobs" element={<ProtectedRoute allowedRoles={['job_seeker']}><JobSearch /></ProtectedRoute>} />
        <Route path="/job-seeker/jobs/:id" element={<ProtectedRoute allowedRoles={['job_seeker']}><JobDetails /></ProtectedRoute>} />
        <Route path="/job-seeker/apply/:id" element={<ProtectedRoute allowedRoles={['job_seeker']}><ApplyJob /></ProtectedRoute>} />
        <Route path="/job-seeker/saved-jobs" element={<ProtectedRoute allowedRoles={['job_seeker']}><SavedJobs /></ProtectedRoute>} />
        <Route path="/job-seeker/applications" element={<ProtectedRoute allowedRoles={['job_seeker']}><ApplicationStatus /></ProtectedRoute>} />
        <Route path="/job-seeker/messages" element={<ProtectedRoute allowedRoles={['job_seeker']}><JobSeekerMessages /></ProtectedRoute>} />
        <Route path="/job-seeker/settings" element={<ProtectedRoute allowedRoles={['job_seeker']}><JobSeekerSettings /></ProtectedRoute>} />

        {/* Recruiter Routes */}
        <Route path="/recruiter/dashboard" element={<ProtectedRoute allowedRoles={['recruiter']}><RecruiterDashboard /></ProtectedRoute>} />
        <Route path="/recruiter/profile" element={<ProtectedRoute allowedRoles={['recruiter']}><RecruiterProfile /></ProtectedRoute>} />
        <Route path="/recruiter/post-job" element={<ProtectedRoute allowedRoles={['recruiter']}><PostJob /></ProtectedRoute>} />
        <Route path="/recruiter/jobs" element={<ProtectedRoute allowedRoles={['recruiter']}><ManageJobs /></ProtectedRoute>} />
        <Route path="/recruiter/applicants" element={<ProtectedRoute allowedRoles={['recruiter']}><ApplicantsList /></ProtectedRoute>} />
        <Route path="/recruiter/applicants/:jobId" element={<ProtectedRoute allowedRoles={['recruiter']}><ApplicantsList /></ProtectedRoute>} />
        <Route path="/recruiter/applicant/:applicantId" element={<ProtectedRoute allowedRoles={['recruiter']}><ApplicantProfile /></ProtectedRoute>} />
        <Route path="/recruiter/messages" element={<ProtectedRoute allowedRoles={['recruiter']}><RecruiterMessages /></ProtectedRoute>} />
        <Route path="/recruiter/settings" element={<ProtectedRoute allowedRoles={['recruiter']}><RecruiterSettings /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><UserManagement /></ProtectedRoute>} />
        <Route path="/admin/jobs" element={<ProtectedRoute allowedRoles={['admin']}><JobManagement /></ProtectedRoute>} />
        <Route path="/admin/applications" element={<ProtectedRoute allowedRoles={['admin']}><ApplicationManagement /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><Analytics /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </SocketProvider>
  );
}

export default App;
