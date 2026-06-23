# master_agent.py
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from socket_manager import manager

app = FastAPI()

@app.websocket("/ws/study-room")
async def websocket_endpoint(websocket: WebSocket):
    # 1. Handshake and hold connection
    await manager.connect(websocket)
    try:
        # 2. The Infinite Listening Loop
        while True:
            # Wait for incoming data from THIS specific client
            data = await websocket.receive_text()
            
            # Broadcast that data to EVERYONE in the room
            await manager.broadcast(f"Student says: {data}")
            
    except WebSocketDisconnect:
        # 3. Graceful Cleanup if the user closes their browser tab
        manager.disconnect(websocket)
        await manager.broadcast("A student left the room.")