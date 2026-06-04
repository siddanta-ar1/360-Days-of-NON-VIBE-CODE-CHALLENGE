'use client';

import { useState, useEffect } from 'react';
import * as ort from 'onnxruntime-web';

export default function LocalEngine() {
  const [session, setSession] = useState<ort.InferenceSession | null>(null);
  const [status, setStatus] = useState<string>('Initializing WebGL Backend...');
  const [result, setResult] = useState<string | null>(null);

  // 1. BOOT THE LOCAL AI ENGINE
  useEffect(() => {
    const loadModel = async () => {
      try {
        // We tell ONNX to use the user's local GPU via the WebGL execution provider
        ort.env.wasm.numThreads = 1; 
        
        setStatus('Downloading Neural Weights to Browser...');
        // This assumes you have a small model named 'lightweight_model.onnx' in your /public folder
        const localSession = await ort.InferenceSession.create('/lightweight_model.onnx', {
          executionProviders: ['webgl', 'wasm'] 
        });
        
        setSession(localSession);
        setStatus('Edge Engine Ready. Zero-latency compute online.');
      } catch (err) {
        setStatus('Failed to load local model. Check console.');
        console.error(err);
      }
    };

    loadModel();
  }, []);

  // 2. EXECUTE LOCAL INFERENCE
  const runLocalInference = async () => {
    if (!session) return;
    
    setStatus('Computing locally via WebGL...');
    const startTime = performance.now();

    try {
      // Create a dummy input tensor (representing a user's mathematical query)
      // In a real scenario, this is where your text tokenizer goes!
      const inputTensor = new ort.Tensor('float32', new Float32Array([1.0, 2.0, 3.0, 4.0]), [1, 4]);
      
      const feeds: Record<string, ort.Tensor> = {};
      feeds[session.inputNames[0]] = inputTensor;

      // Physically execute the neural network on the user's hardware
      const outputData = await session.run(feeds);
      const outputTensor = outputData[session.outputNames[0]];

      const endTime = performance.now();
      
      setResult(`Output Vector: [${outputTensor.data.slice(0, 4).join(', ')}...]`);
      setStatus(`Inference complete in ${(endTime - startTime).toFixed(2)}ms. Server cost: $0.00.`);
    } catch (err) {
      console.error(err);
      setStatus('Inference failed.');
    }
  };

  // 3. BRIGHT & CLEAR UI AESTHETIC
  return (
    <div className="w-full max-w-2xl mx-auto mt-8 p-8 bg-white border border-slate-200 rounded-xl shadow-sm font-sans text-slate-800">
      <div className="border-b border-slate-100 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-[#0055FF] tracking-tight">Edge Compute Module</h2>
        <p className="text-sm text-slate-500 mt-1">Executing ONNX graphs via client-side WebGL</p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600">Engine Status:</span>
          <span className={`text-sm font-bold ${session ? 'text-emerald-600' : 'text-amber-500'}`}>
            {status}
          </span>
        </div>

        <button 
          onClick={runLocalInference}
          disabled={!session}
          className="w-full py-4 bg-[#0055FF] hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors shadow-sm"
        >
          Execute Local Pass
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