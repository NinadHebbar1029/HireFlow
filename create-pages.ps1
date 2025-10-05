# PowerShell script to create all React page placeholders

$pages = @(
    # Job Seeker Pages
    @{Path="pages/jobseeker/Dashboard.jsx"; Component="JobSeekerDashboard"},
    @{Path="pages/jobseeker/Profile.jsx"; Component="JobSeekerProfile"},
    @{Path="pages/jobseeker/JobSearch.jsx"; Component="JobSearch"},
    @{Path="pages/jobseeker/JobDetails.jsx"; Component="JobDetails"},
    @{Path="pages/jobseeker/ApplyJob.jsx"; Component="ApplyJob"},
    @{Path="pages/jobseeker/SavedJobs.jsx"; Component="SavedJobs"},
    @{Path="pages/jobseeker/ApplicationStatus.jsx"; Component="ApplicationStatus"},
    @{Path="pages/jobseeker/Messages.jsx"; Component="JobSeekerMessages"},
    @{Path="pages/jobseeker/Settings.jsx"; Component="JobSeekerSettings"},
    
    # Recruiter Pages
    @{Path="pages/recruiter/Dashboard.jsx"; Component="RecruiterDashboard"},
    @{Path="pages/recruiter/Profile.jsx"; Component="RecruiterProfile"},
    @{Path="pages/recruiter/PostJob.jsx"; Component="PostJob"},
    @{Path="pages/recruiter/ManageJobs.jsx"; Component="ManageJobs"},
    @{Path="pages/recruiter/ApplicantsList.jsx"; Component="ApplicantsList"},
    @{Path="pages/recruiter/ApplicantProfile.jsx"; Component="ApplicantProfile"},
    @{Path="pages/recruiter/Messages.jsx"; Component="RecruiterMessages"},
    @{Path="pages/recruiter/Settings.jsx"; Component="RecruiterSettings"},
    
    # Admin Pages
    @{Path="pages/admin/Dashboard.jsx"; Component="AdminDashboard"},
    @{Path="pages/admin/UserManagement.jsx"; Component="UserManagement"},
    @{Path="pages/admin/JobManagement.jsx"; Component="JobManagement"},
    @{Path="pages/admin/ApplicationManagement.jsx"; Component="ApplicationManagement"},
    @{Path="pages/admin/Analytics.jsx"; Component="Analytics"},
    @{Path="pages/admin/Settings.jsx"; Component="AdminSettings"}
)

$baseDir = "c:\Users\nmheb\OneDrive\Desktop\RIT\SEM-V\HireFlow\frontend\src"

foreach ($page in $pages) {
    $fullPath = Join-Path $baseDir $page.Path
    $componentName = $page.Component
    
    $content = @"
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import Layout from '../../components/Layout';

const $componentName = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch data on component mount
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Add API calls here
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">$componentName</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">Content for $componentName will be displayed here.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default $componentName;
"@

    # Create directory if it doesn't exist
    $dir = Split-Path -Parent $fullPath
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    
    # Write content to file
    Set-Content -Path $fullPath -Value $content -Encoding UTF8
    Write-Host "Created: $fullPath"
}

Write-Host "`nAll page placeholders created successfully!"
