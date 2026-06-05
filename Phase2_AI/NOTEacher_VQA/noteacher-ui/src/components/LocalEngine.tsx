'use client';

import { useState, useEffect, useRef } from 'react';

export default function LocalEngine() {
  const [status, setStatus] = useState<string>('Booting Background Thread...');
  const [result, setResult] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);

  // 1. SPAWN THE BACKGROUND THREAD
  useEffect(() => {
    // Create the worker pointing to our script
    workerRef.current = new Worker(new URL('../../public/inference.worker.ts', import.meta.url));

    // 2. LISTEN FOR REPLIES FROM THE WORKER
    workerRef.current.onmessage = (event) => {
      const { type, message, data } = event.data;

      if (type === 'STATUS') setStatus(message);
      if (type === 'RESULT') setResult(`Output Vector: [${data.slice(0, 4).join(', ')}...]`);
      if (type === 'ERROR') setStatus(`Worker Error: ${message}`);
    };

    return () => {
      workerRef.current?.terminate(); // Clean up memory when component unmounts
    };
  }, []);

  // 3. SEND DATA TO THE BACKGROUND
  const runLocalInference = () => {
    if (!workerRef.current) return;

    setStatus('Sending payload to background thread...');

    // Notice we do NOT await anything here.
    // We fire the message and instantly free up the React thread!
    workerRef.current.postMessage({ inputData: [1.0, 2.0, 3.0, 4.0] });
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 p-8 bg-white border border-slate-200 rounded-xl shadow-sm font-sans text-slate-800">
      <div className="border-b border-slate-100 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-[#0055FF] tracking-tight">Non-Blocking Edge Compute</h2>
        <p className="text-sm text-slate-500 mt-1">Executing ONNX graphs via Web Workers</p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600">Worker Status:</span>
          <span className="text-sm font-bold text-[#0055FF] animate-pulse">
            {status}
          </span>
        </div>

        {/* This button will never freeze while computing! */}
        <button
          onClick={runLocalInference}
          className="w-full py-4 bg-[#0055FF] hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-sm"
        >
          Execute Background Pass
        </button>

        {result && (
          <div className="p-4 border-l-4 border-[#0055FF] bg-blue-50/50 rounded-r-lg">
            <h3 className="text-xs font-bold text-[#0055FF] uppercase tracking-wider mb-2">Local Result</h3>
            <code className="text-sm font-mono text-slate-700">{result}</code>
          </div>
        )}
      </div>
    </div>
  );
}
