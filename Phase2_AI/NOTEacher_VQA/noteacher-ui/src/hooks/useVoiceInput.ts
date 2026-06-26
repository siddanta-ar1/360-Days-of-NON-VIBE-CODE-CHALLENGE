// src/hooks/useVoiceInput.ts
import { useState, useRef, useCallback } from 'react';

export function useVoiceInput(onTranscription: (text: string) => void) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      // 1. HARDWARE PERMISSION
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // 2. OPEN THE BINARY TUNNEL
      const wsUrl = process.env.NEXT_PUBLIC_WS_AUDIO_URL || 'ws://localhost:8000/ws/audio';
      socketRef.current = new WebSocket(wsUrl);
      
      socketRef.current.onmessage = (event) => {
        // When the AI returns the text, pass it to the UI
        onTranscription(event.data);
      };

      // 3. START RECORDING
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      
    } catch (error) {
      console.error("Microphone access denied:", error);
      alert("Please allow microphone access to use voice typing.");
    }
  }, [onTranscription]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = () => {
        // 4. BUNDLE AND TRANSMIT
        // When the user lets go of the button, package the audio chunks into a Blob
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Blast the binary data directly up the WebSocket
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(audioBlob);
        }
        
        // Cleanup hardware tracks
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  return { isRecording, startRecording, stopRecording };
}