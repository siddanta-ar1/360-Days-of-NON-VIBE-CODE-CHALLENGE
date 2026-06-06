// src/lib/model_cache.ts
import { openDB } from 'idb';

const DB_NAME = 'NOTEacher-AI-Cache';
const STORE_NAME = 'models';
const MODEL_URL = '/lightweight_model.onnx';
const MODEL_KEY = 'vqa_model_v1'; // Versioning is critical! If you train a new model, change this to v2.

export async function getOrFetchModel(): Promise<ArrayBuffer> {
  // 1. Initialize the local IndexedDB vault
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME);
    },
  });

  // 2. CHECK CACHE: Look for the model on the user's hard drive
  const cachedModel = await db.get(STORE_NAME, MODEL_KEY);
  if (cachedModel) {
    console.log('✅ CACHE HIT: Model loaded instantly from local IndexedDB.');
    return cachedModel;
  }

  // 3. CACHE MISS: Download from the network
  console.log('☁️ CACHE MISS: Downloading model from Edge Network...');
  const response = await fetch(MODEL_URL);

  if (!response.ok) {
    throw new Error(`Failed to download model: ${response.statusText}`);
  }

  // Convert the response into raw binary bytes
  const modelBuffer = await response.arrayBuffer();

  // 4. WRITE TO DISK: Save it for all future visits
  await db.put(STORE_NAME, modelBuffer, MODEL_KEY);
  console.log('💾 Model saved to IndexedDB for permanent offline access.');

  return modelBuffer;
}
