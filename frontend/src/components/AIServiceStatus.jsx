import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle, FaSync, FaRobot, FaServer, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import api from '../utils/api';
import { toast } from 'react-toastify';

const AIServiceStatus = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState(null);

  useEffect(() => {
    checkAIStatus();
  }, []);

  const checkAIStatus = async () => {
    setLoading(true);
    try {
      const response = await api.get('/job-seekers/ai-status');
      setStatus(response.data);
      setLastChecked(new Date());
    } catch (error) {
      setStatus({ 
        status: 'error', 
        error: 'Failed to connect to backend' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    toast.info('Refreshing AI service status...');
    checkAIStatus();
  };

  if (loading && !status) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-600"></div>
        </div>
      </div>
    );
  }

  const isAvailable = status?.status === 'available';
  const isUnavailable = status?.status === 'unavailable';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${
            isAvailable ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <FaRobot className={`text-3xl ${
              isAvailable ? 'text-green-600' : 'text-red-600'
            }`} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-900">AI Recommendation Service</h3>
            <p className="text-sm text-gray-500">
              {lastChecked && `Last checked: ${lastChecked.toLocaleTimeString()}`}
            </p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05, rotate: loading ? 0 : 180 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          disabled={loading}
          className="p-3 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 transition-colors disabled:opacity-50"
        >
          <FaSync className={loading ? 'animate-spin' : ''} />
        </motion.button>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        {isAvailable ? (
          <div className="flex items-center gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
            <FaCheckCircle className="text-3xl text-green-600" />
            <div>
              <p className="font-bold text-green-900 text-lg">Service Online</p>
              <p className="text-sm text-green-700">
                AI-powered recommendations are working perfectly!
              </p>
            </div>
          </div>
        ) : isUnavailable ? (
          <div className="flex items-center gap-3 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
            <FaExclamationTriangle className="text-3xl text-yellow-600" />
            <div>
              <p className="font-bold text-yellow-900 text-lg">Using Fallback Mode</p>
              <p className="text-sm text-yellow-700">
                {status.note || 'AI service unavailable, using skill-based matching'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <FaTimesCircle className="text-3xl text-red-600" />
            <div>
              <p className="font-bold text-red-900 text-lg">Service Offline</p>
              <p className="text-sm text-red-700">
                {status?.error || 'Unable to connect to AI service'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Service Details */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <FaServer className="text-purple-600" />
            <p className="text-sm font-bold text-gray-700">Service URL</p>
          </div>
          <p className="text-sm text-gray-600 font-mono bg-white px-3 py-2 rounded-lg">
            {status?.url || 'Not configured'}
          </p>
        </div>

        <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <FaClock className="text-blue-600" />
            <p className="text-sm font-bold text-gray-700">Status</p>
          </div>
          <p className={`text-sm font-bold px-3 py-2 rounded-lg ${
            isAvailable ? 'bg-green-100 text-green-700' : 
            isUnavailable ? 'bg-yellow-100 text-yellow-700' : 
            'bg-red-100 text-red-700'
          }`}>
            {status?.status?.toUpperCase() || 'UNKNOWN'}
          </p>
        </div>
      </div>

      {/* Service Info */}
      {isAvailable && status.service && (
        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-sm font-bold text-gray-700 mb-2">Service Information</p>
          <pre className="text-xs text-gray-600 font-mono">
            {JSON.stringify(status.service, null, 2)}
          </pre>
        </div>
      )}

      {/* Instructions */}
      {!isAvailable && (
        <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
          <p className="font-bold text-blue-900 mb-3">How to Start AI Service:</p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>Navigate to project root directory</li>
            <li>Run: <code className="bg-blue-100 px-2 py-1 rounded">.\start-ai-service.ps1</code></li>
            <li>Or manually: <code className="bg-blue-100 px-2 py-1 rounded">cd ai-service && python app.py</code></li>
            <li>Service should start on http://localhost:8080</li>
            <li>Click the refresh button above to check status</li>
          </ol>
        </div>
      )}

      {/* Features */}
      <div className="mt-6">
        <p className="font-bold text-gray-700 mb-3">AI Features:</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Skill-based Matching</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
            <span>Text Similarity (TF-IDF)</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Intelligent Ranking</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Automatic Fallback</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AIServiceStatus;
