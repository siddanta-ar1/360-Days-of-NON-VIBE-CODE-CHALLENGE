// src/hooks/useStudyRoom.ts
import { useEffect, useState, useRef } from 'react';

export function useStudyRoom() {
  const [messages, setMessages] = useState<string[]>([]);
  // We use a ref to hold the socket instance across React re-renders
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // 1. Establish the connection (Note the ws:// protocol instead of http://)
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/study-room';
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    // 2. Event Listener: On Connection Open
    socket.onopen = () => {
      console.log(' WebSocket Connected');
    };

    // 3. Event Listener: On Message Received
    socket.onmessage = (event) => {
      // Instantly update the UI the millisecond the server pushes data
      setMessages((prev) => [...prev, event.data]);
    };

    // 4. Cleanup: Close socket when the user navigates away from the page
    return () => {
      if (socket.readyState === 1) {
        socket.close();
      }
    };
  }, []);

  // Function to push data back up the tunnel
  const sendMessage = (message: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(message);
    }
  };

  return { messages, sendMessage };
}