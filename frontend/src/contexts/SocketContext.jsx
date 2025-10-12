import { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user?.id) {
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);
        newSocket.emit('join-room', user.id);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user?.id]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
