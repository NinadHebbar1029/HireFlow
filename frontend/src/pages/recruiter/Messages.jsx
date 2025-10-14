import { useState, useEffect } from 'react';
import { FaEnvelope, FaPaperPlane, FaSearch, FaPlus, FaTimes, FaEnvelopeOpen, FaInbox, FaUser, FaClock, FaCheckCircle, FaReply, FaTrash, FaStar, FaCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import Layout from '../../components/Layout';

const Messages = () => {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [newMessage, setNewMessage] = useState({ recipient: '', subject: '', content: '' });

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await api.get('/messages');
      setMessages(response.data);
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.recipient || !newMessage.subject || !newMessage.content) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      await api.post('/messages', newMessage);
      toast.success('Message sent successfully!');
      setShowCompose(false);
      setNewMessage({ recipient: '', subject: '', content: '' });
      fetchMessages();
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await api.put(`/messages/${messageId}/read`);
      fetchMessages();
    } catch (error) {
      console.error('Failed to mark as read');
    }
  };

  const handleSelectMessage = (message) => {
    setSelectedMessage(message);
    if (!message.is_read) {
      markAsRead(message.message_id);
    }
  };

  const filteredMessages = messages.filter(msg =>
    msg.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.sender_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = messages.filter(m => !m.is_read).length;

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="relative inline-block">
              <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-600"></div>
              <FaEnvelope className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-600 text-2xl animate-pulse" />
            </div>
            <p className="mt-6 text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Loading your messages...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-10 mb-12 overflow-hidden"
          >
            {/* Animated background effects */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-yellow-300 opacity-10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between flex-wrap gap-6">
                <div className="flex items-center gap-6">
                  <div className="p-5 bg-white/20 backdrop-blur-sm rounded-2xl">
                    <FaEnvelope className="text-6xl text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-2 flex items-center gap-3">
                      Messages
                      {unreadCount > 0 && (
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-full text-xl font-black animate-pulse">
                          <FaCircle className="text-sm" /> {unreadCount} New
                        </span>
                      )}
                    </h1>
                    <p className="text-blue-100 text-lg">
                      Connect with candidates and manage your conversations
                    </p>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCompose(true)}
                  className="flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-xl hover:shadow-2xl transition-all font-black"
                >
                  <FaPlus className="text-xl" /> Compose Message
                </motion.button>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Messages List */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Inbox Header */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                      <FaInbox className="text-white text-2xl" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white">Inbox</h2>
                      <p className="text-blue-100 text-sm">{messages.length} total messages</p>
                    </div>
                  </div>
                  
                  {/* Search Bar */}
                  <div className="relative">
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-200" />
                    <input
                      type="text"
                      placeholder="Search messages..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl text-white placeholder-blue-100 focus:ring-4 focus:ring-white/30 focus:border-white/50 transition-all"
                    />
                  </div>
                </div>

                {/* Messages List */}
                <div className="p-4 space-y-2 max-h-[700px] overflow-y-auto">
                  {filteredMessages.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl inline-block mb-4">
                        <FaEnvelope className="text-6xl text-gray-400" />
                      </div>
                      <p className="text-gray-600 font-medium text-lg">No messages found</p>
                      <p className="text-gray-400 text-sm mt-2">Try adjusting your search</p>
                    </motion.div>
                  ) : (
                    <AnimatePresence>
                      {filteredMessages.map((message, index) => (
                        <motion.div
                          key={message.message_id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleSelectMessage(message)}
                          className={`p-4 rounded-xl cursor-pointer transition-all transform hover:scale-[1.02] ${
                            selectedMessage?.message_id === message.message_id
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                              : message.is_read
                              ? 'bg-gray-50 hover:bg-gray-100'
                              : 'bg-gradient-to-r from-blue-50 to-indigo-50 hover:shadow-md border-2 border-blue-200'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${
                                selectedMessage?.message_id === message.message_id
                                  ? 'bg-white/20 backdrop-blur-sm'
                                  : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                              }`}>
                                <FaUser className={`${
                                  selectedMessage?.message_id === message.message_id
                                    ? 'text-white'
                                    : 'text-white'
                                } text-sm`} />
                              </div>
                              <h3 className={`font-bold ${
                                selectedMessage?.message_id === message.message_id
                                  ? 'text-white'
                                  : !message.is_read
                                  ? 'text-gray-900'
                                  : 'text-gray-700'
                              }`}>
                                {message.sender_name}
                              </h3>
                            </div>
                            {!message.is_read && selectedMessage?.message_id !== message.message_id && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded-full text-xs font-bold">
                                <FaCircle className="text-[6px]" /> New
                              </div>
                            )}
                          </div>
                          <p className={`text-sm font-semibold mb-2 line-clamp-1 ${
                            selectedMessage?.message_id === message.message_id
                              ? 'text-white'
                              : 'text-gray-900'
                          }`}>
                            {message.subject}
                          </p>
                          <div className="flex items-center gap-2">
                            <FaClock className={`text-xs ${
                              selectedMessage?.message_id === message.message_id
                                ? 'text-blue-100'
                                : 'text-gray-400'
                            }`} />
                            <p className={`text-xs ${
                              selectedMessage?.message_id === message.message_id
                                ? 'text-blue-100'
                                : 'text-gray-500'
                            }`}>
                              {new Date(message.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Message Detail */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {selectedMessage ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {/* Message Header */}
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
                            <FaEnvelopeOpen className="text-3xl text-white" />
                          </div>
                          <div>
                            <h2 className="text-3xl font-black text-white mb-3">
                              {selectedMessage.subject}
                            </h2>
                            <div className="flex items-center gap-4 text-white/90">
                              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg">
                                <FaUser className="text-sm" />
                                <span className="font-semibold">{selectedMessage.sender_name}</span>
                              </div>
                              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg">
                                <FaClock className="text-sm" />
                                <span className="text-sm">{new Date(selectedMessage.created_at).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {selectedMessage.is_read && (
                          <div className="px-3 py-1.5 bg-green-500 text-white rounded-lg flex items-center gap-2 font-bold">
                            <FaCheckCircle /> Read
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Message Content */}
                    <div className="p-8">
                      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 mb-6">
                        <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap font-medium">
                          {selectedMessage.content}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                        >
                          <FaReply /> Reply
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                        >
                          <FaStar /> Star
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                        >
                          <FaTrash /> Delete
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center h-[700px] text-center p-8"
                  >
                    <div className="relative mb-8">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-3xl opacity-20"></div>
                      <div className="relative p-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl">
                        <FaEnvelopeOpen className="text-8xl text-blue-600" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 mb-4">
                      Select a message to read
                    </h3>
                    <p className="text-gray-600 text-lg max-w-md">
                      Choose a message from your inbox to view its contents and take action
                    </p>
                    <div className="mt-8 flex gap-4">
                      <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                        <p className="text-sm font-bold text-gray-700">💡 Tip: Unread messages appear with a "New" badge</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Compose Modal */}
          <AnimatePresence>
            {showCompose && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={() => setShowCompose(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
                >
                  {/* Modal Header */}
                  <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
                          <FaPaperPlane className="text-3xl text-white" />
                        </div>
                        <div>
                          <h3 className="text-3xl font-black text-white">Compose Message</h3>
                          <p className="text-blue-100">Send a message to a candidate</p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowCompose(false)}
                        className="p-3 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-all"
                      >
                        <FaTimes className="text-2xl" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Modal Body - Scrollable */}
                  <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 300px)' }}>
                    <div className="p-8 space-y-6">
                      {/* Recipient */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                          <span className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                            <FaUser className="text-white text-xs" />
                          </span>
                          Recipient Email *
                        </label>
                        <input
                          type="email"
                          value={newMessage.recipient}
                          onChange={(e) => setNewMessage({ ...newMessage, recipient: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-gray-900 font-medium"
                          placeholder="recipient@example.com"
                        />
                      </div>

                      {/* Subject */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                          <span className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                            <FaEnvelope className="text-white text-xs" />
                          </span>
                          Subject *
                        </label>
                        <input
                          type="text"
                          value={newMessage.subject}
                          onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all text-gray-900 font-medium"
                          placeholder="Enter subject line"
                        />
                      </div>

                      {/* Message Content */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                          <span className="p-1.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                            <FaPaperPlane className="text-white text-xs" />
                          </span>
                          Message *
                        </label>
                        <textarea
                          value={newMessage.content}
                          onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                          rows="8"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all text-gray-900 font-medium resize-none"
                          placeholder="Type your message here..."
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer - Fixed at bottom */}
                  <div className="p-6 bg-gray-50 border-t border-gray-200">
                    <div className="flex gap-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSendMessage}
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl hover:shadow-xl transition-all font-black text-lg"
                      >
                        <FaPaperPlane className="text-xl" /> Send Message
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowCompose(false)}
                        className="flex-1 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 px-6 py-4 rounded-xl hover:shadow-xl transition-all font-black text-lg"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Layout>
    </div>
  );
};

export default Messages;
