'use client'

import { useState } from 'react'
import { telemetry } from './telemetry';

// Inside your model caching logic:
if (cachedModel) {
  telemetry.log('INFO', 'ONNX_ENGINE', 'Cache hit: Model loaded from local database.', { cacheType: 'IndexedDB' });
  return cachedModel;
} else {
  telemetry.log('WARN', 'ONNX_ENGINE', 'Cache miss: Initiating remote weight transmission.', { url: '/model.onnx' });
  // fetch logic...
}

export default function Home() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {role: 'system', content: "Welcome to NOTEacher. Upload an equation or ask a question."}
  ]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');

    setMessages((prev) => [...prev, { role: 'system', content: 'Thinking...' }]);

    try {
      const response = await fetch('http://127.0.0.1:8000/ask', {
        method: 'POST',
        headeres: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ question: input }),
      });
      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'system', content: data.answer }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [...prev, { role: 'system', content: 'Error occurred while fetching response.' }]);
    }
  }