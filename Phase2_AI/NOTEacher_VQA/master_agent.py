# master_agent.py (Update your websocket_endpoint)
@app.websocket("/ws/study-room")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # We receive the raw JSON string from the frontend
            data = await websocket.receive_text()
            
            # We instantly publish the raw string to Redis. 
            # Zero parsing overhead = maximum performance.
            await manager.broadcast_to_cluster(data)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        # We can construct a JSON payload for the disconnect event
        disconnect_msg = '{"type": "system", "message": "A user disconnected."}'
        await manager.broadcast_to_cluster(disconnect_msg)