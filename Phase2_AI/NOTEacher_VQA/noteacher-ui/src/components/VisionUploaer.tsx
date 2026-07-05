// src/components/VisionUploader.tsx
'use client';

import React, { useState } from 'react';

export function VisionUploader({ onAnalysisComplete }: { onAnalysisComplete: (text: string) => void }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    // 1. PACK THE BINARY DATA
    // We use FormData to stream the raw image file securely without string conversion bloat on the client
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vision/analyze`, {
        method: 'POST',
        body: formData, // Browser automatically sets Content-Type to multipart/form-data
      });

      if (!response.ok) throw new Error('Vision analysis failed');
      
      const data = await response.json();
      onAnalysisComplete(data.analysis);
    } catch (error) {
      console.error('Extraction error:', error);
      alert('Failed to analyze the handwritten image.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-800 rounded-xl bg-gray-900/50">
      <label className="cursor-pointer flex flex-col items-center space-y-2">
        <span className="text-gray-400 text-sm">
          {uploading ? 'Parsing Image Math...' : '📸 Upload or drop a photo of an equation'}
        </span>
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileChange} 
          disabled={uploading}
        />
      </label>
    </div>
  );
}