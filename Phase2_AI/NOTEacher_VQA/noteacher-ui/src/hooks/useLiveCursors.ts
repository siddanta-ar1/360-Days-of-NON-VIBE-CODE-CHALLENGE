// src/hooks/useLiveCursors.ts
import { useState, useEffect, useCallback } from 'react';
import { throttle } from '@/lib/throttle';

// Define the shape of our ephemeral state
type Cursor = { x: number; y: number };
type CursorMap = Record<string, Cursor>;

export function useLiveCursors(socket: WebSocket | null, currentUserId: string) {
  const [cursors, setCursors] = useState<CursorMap>({});

  // 1. THE THROTTLED NETWORK BROADCAST
  // We restrict outgoing messages to exactly 1 every 50ms (20fps).
  const broadcastCursor = useCallback(
    throttle((x: number, y: number) => {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'cursor',
          userId: currentUserId,
          x,
          y
        }));
      }
    }, 50),
    [socket, currentUserId]
  );

  // 2. CAPTURE LOCAL MOUSE MOVEMENT
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate position relative to the viewport percentages to support different screen sizes
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      broadcastCursor(x, y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [broadcastCursor]);

  // 3. PROCESS INCOMING CURSORS
  useEffect(() => {
    if (!socket) return;
    
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'cursor' && data.userId !== currentUserId) {
          // Update the localized React state for rendering
          setCursors(prev => ({
            ...prev,
            [data.userId]: { x: data.x, y: data.y }
          }));
        }
      } catch (err) {
        // Handle non-JSON messages (like legacy chat) gracefully
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => socket.removeEventListener('message', handleMessage);
  }, [socket, currentUserId]);

  return cursors;
}