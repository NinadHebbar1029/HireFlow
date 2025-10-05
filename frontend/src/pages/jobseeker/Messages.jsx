import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEnvelope, FaEnvelopeOpen, FaPaperPlane, FaPlus, FaTimes, FaSearch } from 'react-icons/fa';
import api from '../../utils/api';
import Layout from '../../components/Layout';

const JobSeekerMessages = () => {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [newMessage, setNewMessage] = useState({ receiver_id: '', subject: '', message: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await api.get('/messages');
      setMessages(response.data);
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await api.put(`/messages/${messageId}/read`);
      setMessages(messages.map(msg => 
        msg.message_id === messageId ? { ...msg, is_read: 1 } : msg
      ));
    } catch (error) {
      console.error('Failed to mark as read');
    }
  };

  const handleSelectMessage = async (message) => {
    setSelectedMessage(message);
    if (!message.is_read) {
      await markAsRead(message.message_id);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
      await api.post('/messages', newMessage);
      toast.success('Message sent successfully!');
      setShowCompose(false);
      setNewMessage({ receiver_id: '', subject: '', message: '' });
      fetchMessages();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send message');
    }
  };

  const filteredMessages = messages.filter(msg =>
    msg.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.sender_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadCount = messages.filter(msg => !msg.is_read).length;

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center">
                <FaEnvelope className="mr-4 text-primary-600" />
                Messages
                {unreadCount > 0 && (
                  <span className="ml-4 px-4 py-1 bg-red-500 text-white rounded-full text-sm font-semibold">
                    {unreadCount} New
                  </span>
                )}
              </h1>
              <p className="text-gray-600 text-lg mt-2">Communicate with recruiters and employers</p>
            </div>
            <button
              onClick={() => setShowCompose(true)}
              className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 font-semibold flex items-center shadow-lg"
            >
              <FaPlus className="mr-2" /> Compose Message
            </button>
          </div>

          {/* Compose Modal */}
          {showCompose && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-primary-600 to-primary-700">
                  <h2 className="text-2xl font-bold text-white">New Message</h2>
                  <button
                    onClick={() => setShowCompose(false)}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>
                <form onSubmit={handleSendMessage} className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">To (Recruiter ID)</label>
                      <input
                        type="number"
                        value={newMessage.receiver_id}
                        onChange={(e) => setNewMessage({ ...newMessage, receiver_id: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                        placeholder="Enter recruiter user ID"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                      <input
                        type="text"
                        value={newMessage.subject}
                        onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                        placeholder="Enter message subject"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                      <textarea
                        value={newMessage.message}
                        onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
                        rows="8"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                        placeholder="Type your message here..."
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowCompose(false)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 font-semibold flex items-center"
                    >
                      <FaPaperPlane className="mr-2" /> Send Message
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Messages Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Messages List */}
            <div className="lg:col-span-1 bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="overflow-y-auto max-h-[600px]">
                {filteredMessages.length > 0 ? (
                  filteredMessages.map((message) => (
                    <div
                      key={message.message_id}
                      onClick={() => handleSelectMessage(message)}
                      className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                        selectedMessage?.message_id === message.message_id
                          ? 'bg-primary-50 border-l-4 border-l-primary-600'
                          : 'hover:bg-gray-50'
                      } ${!message.is_read ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center flex-1">
                          {message.is_read ? (
                            <FaEnvelopeOpen className="text-gray-400 mr-3" />
                          ) : (
                            <FaEnvelope className="text-primary-600 mr-3" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold truncate ${!message.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                              {message.sender_name}
                            </p>
                            <p className="text-sm text-gray-600 truncate">{message.subject}</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(message.sent_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <FaEnvelope className="text-5xl mx-auto mb-3 text-gray-300" />
                    <p>No messages found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Message Detail */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden">
              {selectedMessage ? (
                <>
                  <div className="p-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white border-b">
                    <h2 className="text-2xl font-bold mb-2">{selectedMessage.subject}</h2>
                    <div className="flex items-center text-primary-100">
                      <span className="font-medium mr-4">From: {selectedMessage.sender_name}</span>
                      <span>•</span>
                      <span className="ml-4">{new Date(selectedMessage.sent_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-lg">
                        {selectedMessage.message}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[400px]">
                  <div className="text-center">
                    <FaEnvelope className="text-8xl text-gray-300 mx-auto mb-4" />
                    <p className="text-xl text-gray-500">Select a message to read</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default JobSeekerMessages;
