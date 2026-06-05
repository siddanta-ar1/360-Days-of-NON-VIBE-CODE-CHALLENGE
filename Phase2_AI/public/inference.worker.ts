// public/inference.worker.ts
import * as ort from 'onnxruntime-web';

// 1. We load the model exactly ONCE when the worker boots
let session: ort.InferenceSession | null = null;

async function initModel() {
  ort.env.wasm.numThreads = 1;
  session = await ort.InferenceSession.create('/lightweight_model.onnx', {
    executionProviders: ['webgl', 'wasm']
  });
  // Tell the main thread we are ready
  postMessage({ type: 'STATUS', message: 'Worker Booted. Model Loaded.' });
}

initModel();

// 2. LISTEN FOR MESSAGES FROM REACT
self.onmessage = async (event: MessageEvent) => {
  if (!session) {
    postMessage({ type: 'ERROR', message: 'Model not loaded yet.' });
    return;
  }

  try {
    postMessage({ type: 'STATUS', message: 'Worker computing...' });
    const { inputData } = event.data;

    // Run the heavy matrix math
    const inputTensor = new ort.Tensor('float32', new Float32Array(inputData), [1, 4]);
    const feeds: Record<string, ort.Tensor> = { [session.inputNames[0]]: inputTensor };

    const outputData = await session.run(feeds);
    const resultTensor = outputData[session.outputNames[0]];

    // Send the result back to React
    postMessage({
      type: 'RESULT',
      data: Array.from(resultTensor.data as Float32Array)
    });

  } catch (error) {
    postMessage({ type: 'ERROR', message: String(error) });
  }
};
