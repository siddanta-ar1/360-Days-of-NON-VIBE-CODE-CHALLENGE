// src/components/DocumentUploader.tsx
'use client';

import React, { useState, useEffect } from 'react';

export function DocumentUploader() {
  const [taskId, setTaskId] = useState<string | null>(null);
  const [taskState, setTaskState] = useState<string>('IDLE');
  const [statusMessage, setStatusMessage] = useState<string>('');
  
  // Simulated file upload handler
  const handleUpload = async () => {
    setTaskState('INITIALIZING');
    setStatusMessage('Uploading to server...');
    
    // 1. Trigger the background upload (returns instantly)
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/documents/upload`, {
      method: 'POST',
      body: new FormData() // Mocked for brevity
    });
    const data = await res.json();
    
    // 2. Capture the Celery Task ID and start the polling phase
    setTaskId(data.task_id);
    setTaskState('POLLING');
  };

  // 3. The React Polling Loop
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (taskState === 'POLLING' && taskId) {
      intervalId = setInterval(async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/documents/status/${taskId}`);
          const data = await res.json();
          
          setStatusMessage(data.status);
          
          // Terminal state checks
          if (data.state === 'SUCCESS') {
            setTaskState('SUCCESS');
            setStatusMessage(`Done! Processed ${data.result.chunks_processed} chunks.`);
            clearInterval(intervalId);
          } else if (data.state === 'FAILURE') {
            setTaskState('FAILURE');
            clearInterval(intervalId);
          }
        } catch (error) {
          console.error("Polling error:", error);
        }
      }, 2000); // Check Redis every 2 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [taskState, taskId]);

  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Upload Course Material</h2>
      
      {taskState === 'IDLE' && (
        <button 
          onClick={handleUpload}
          className="bg-blue-600 px-4 py-2 rounded font-medium hover:bg-blue-500 transition"
        >
          Upload Calculus PDF (50MB)
        </button>
      )}

      {taskState !== 'IDLE' && (
        <div className="mt-4 p-4 bg-gray-800 rounded border border-gray-700">
          <div className="flex justify-between text-sm text-gray-300 mb-2">
            <span>State: {taskState}</span>
            {taskState === 'POLLING' && <span className="animate-pulse text-blue-400">Polling...</span>}
          </div>
          <p className="font-mono text-green-400">{statusMessage}</p>
        </div>
      )}
    </div>
  );
}