# audio_agent.py
import io
import tempfile
import edge_tts
from fastapi import WebSocket
from faster_whisper import WhisperModel

# 1. LOAD THE MODEL
# We load the "base.en" model into memory. It is tiny (140MB), lightning fast, 
# and highly accurate for English mathematical terms.
print("Loading Whisper Engine into RAM...")
model = WhisperModel("base.en", device="cpu", compute_type="int8")

async def handle_audio_stream(websocket: WebSocket):
    await websocket.accept()
    print(" Audio Tunnel Established.")
    
    try:
        while True:
            # 2. RECEIVE BINARY DATA
            # Notice we are receiving BYTES, not text!
            audio_bytes = await websocket.receive_bytes()
            
            # 3. PROCESS THE AUDIO
            # Write the raw bytes to a temporary file for Whisper to read
            with tempfile.NamedTemporaryFile(delete=True, suffix=".webm") as temp_audio:
                temp_audio.write(audio_bytes)
                temp_audio.flush()
                
                # Run the neural network transcription
                segments, info = model.transcribe(temp_audio.name, beam_size=5)
                
                transcription = "".join([segment.text for segment in segments])
                
                # 4. RETURN THE TEXT
                await websocket.send_text(transcription.strip())
                
    except Exception as e:
        print(f"Audio Tunnel Closed: {e}")


async def synthesize_and_stream(text: str, websocket: WebSocket):
    """
    Converts text to speech and streams the binary bytes directly down the socket.
    We use the 'en-US-ChristopherNeural' voice for a clear, instructional tone.
    """
    print(f"🔊 Synthesizing audio for: {text[:30]}...")
    
    communicate = edge_tts.Communicate(text, "en-US-ChristopherNeural")
    
    # We yield the audio data as it is generated, streaming it chunk by chunk
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            # Push raw binary audio down the TCP tunnel
            await websocket.send_bytes(chunk["data"])
    
    # Send a small JSON signal so the frontend knows the audio stream is finished
    await websocket.send_text('{"type": "system", "event": "audio_complete"}')