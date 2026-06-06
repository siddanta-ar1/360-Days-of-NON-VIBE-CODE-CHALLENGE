import * as ort from 'onnxruntime-web';
import { getOrFetchModel } from '../src/lib/model_cache';

let session: ort.InferenceSession | null = null;

async function initModel() {
  try {
    ort.env.wasm.numThreads = 1;

    postMessage({ type: 'STATUS', message: 'Checking local cache...' });

    // Grab the binary bytes from our IDB script
    const modelBuffer = await getOrFetchModel();

    // Pass the raw bytes directly into the ONNX session
    session = await ort.InferenceSession.create(modelBuffer, {
      executionProviders: ['webgl', 'wasm']
    });

    postMessage({ type: 'STATUS', message: 'Worker Booted. Model Loaded from Cache.' });
  } catch (error) {
    postMessage({ type: 'ERROR', message: `Failed to boot model: ${error}` });
  }
}

initModel();
