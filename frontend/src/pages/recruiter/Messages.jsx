import { useState, useEffect } from 'react';
import { FaEnvelope, FaPaperPlane, FaSearch, FaPlus, FaTimes, FaEnvelopeOpen } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../utils/api';

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
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-1">{unreadCount} unread messages</p>
        </div>
        <button
          onClick={() => setShowCompose(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
        >
          <FaPlus /> Compose
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-4">
          <div className="mb-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-8">
                <FaEnvelope className="text-5xl text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No messages found</p>
              </div>
            ) : (
              filteredMessages.map((message) => (
                <div
                  key={message.message_id}
                  onClick={() => handleSelectMessage(message)}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    selectedMessage?.message_id === message.message_id
                      ? 'bg-primary-100 border-l-4 border-primary-600'
                      : message.is_read
                      ? 'bg-gray-50 hover:bg-gray-100'
                      : 'bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <h3 className={`font-semibold text-gray-900 ${
                      !message.is_read ? 'font-bold' : ''
                    }`}>
                      {message.sender_name}
                    </h3>
                    {!message.is_read && (
                      <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    {message.subject}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(message.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          {selectedMessage ? (
            <div>
              <div className="border-b pb-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedMessage.subject}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>From: <strong>{selectedMessage.sender_name}</strong></span>
                  <span>•</span>
                  <span>{new Date(selectedMessage.created_at).toLocaleString()}</span>
                </div>
              </div>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedMessage.content}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <FaEnvelopeOpen className="text-7xl text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Select a message to read
              </h3>
              <p className="text-gray-500">
                Choose a message from the list to view its contents
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Compose Message</h3>
              <button
                onClick={() => setShowCompose(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={newMessage.recipient}
                  onChange={(e) => setNewMessage({ ...newMessage, recipient: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="recipient@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter subject"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={newMessage.content}
                  onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                  rows="8"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Type your message here..."
                ></textarea>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSendMessage}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
              >
                <FaPaperPlane /> Send Message
              </button>
              <button
                onClick={() => setShowCompose(false)}
                className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-400 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
