import { useState, useEffect } from 'react';
import { FaUser, FaSearch, FaBan, FaCheck, FaUserShield, FaUserTie, FaBuilding, FaFilter } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const UserManagement = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      await api.put(`/admin/users/${userId}/status`, { status: newStatus });
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'suspended'} successfully!`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success('User role updated successfully!');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const filteredUsers = users
    .filter(user => roleFilter === 'all' || user.role === roleFilter)
    .filter(user => statusFilter === 'all' || user.status === statusFilter)
    .filter(user =>
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const stats = {
    total: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    jobseeker: users.filter(u => u.role === 'jobseeker').length,
    recruiter: users.filter(u => u.role === 'recruiter').length,
    active: users.filter(u => u.status === 'active').length,
    suspended: users.filter(u => u.status === 'suspended').length
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <FaUserShield className="text-red-600" />;
      case 'jobseeker': return <FaUserTie className="text-blue-600" />;
      case 'recruiter': return <FaBuilding className="text-green-600" />;
      default: return <FaUser className="text-gray-600" />;
    }
  };

  const getRoleBadge = (role) => {
    const roleStyles = {
      admin: 'bg-red-100 text-red-800',
      jobseeker: 'bg-blue-100 text-blue-800',
      recruiter: 'bg-green-100 text-green-800'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${roleStyles[role] || 'bg-gray-100 text-gray-800'}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">User Management</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-4 text-white">
          <p className="text-sm opacity-90">Total Users</p>
          <p className="text-2xl font-bold mt-1">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl shadow-lg p-4 text-white">
          <p className="text-sm opacity-90">Admins</p>
          <p className="text-2xl font-bold mt-1">{stats.admin}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 text-white">
          <p className="text-sm opacity-90">Job Seekers</p>
          <p className="text-2xl font-bold mt-1">{stats.jobseeker}</p>
        </div>
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl shadow-lg p-4 text-white">
          <p className="text-sm opacity-90">Recruiters</p>
          <p className="text-2xl font-bold mt-1">{stats.recruiter}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-4 text-white">
          <p className="text-sm opacity-90">Active</p>
          <p className="text-2xl font-bold mt-1">{stats.active}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl shadow-lg p-4 text-white">
          <p className="text-sm opacity-90">Suspended</p>
          <p className="text-2xl font-bold mt-1">{stats.suspended}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="jobseeker">Job Seeker</option>
              <option value="recruiter">Recruiter</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
              <tr>
                <th className="px-6 py-4 text-left">User</th>
                <th className="px-6 py-4 text-left">Email</th>
                <th className="px-6 py-4 text-left">Role</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Joined</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <FaUser className="mx-auto text-5xl text-gray-300 mb-3" />
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.user_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center text-white font-bold">
                          {user.full_name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-900">{user.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{user.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        {getRoleBadge(user.role)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(user.user_id, user.status)}
                          className={`flex items-center gap-1 px-3 py-1 rounded-lg text-white text-sm transition-all ${
                            user.status === 'active'
                              ? 'bg-red-600 hover:bg-red-700'
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          {user.status === 'active' ? (
                            <><FaBan /> Suspend</>
                          ) : (
                            <><FaCheck /> Activate</>
                          )}
                        </button>
                        {user.role !== 'admin' && (
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.user_id, e.target.value)}
                            className="px-2 py-1 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="jobseeker">Job Seeker</option>
                            <option value="recruiter">Recruiter</option>
                            <option value="admin">Admin</option>
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
