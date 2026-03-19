from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import redis.asyncio as redis
from app.core.config import settings
from app.db.session import init_db
from app.api.v1 import intake, cases

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# ... (middleware remains the same)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket connection manager (simplified)
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/queue")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

async def redis_listener():
    """
    Background task to listen to Redis and broadcast via WebSockets.
    """
    r = await redis.from_url(settings.REDIS_URL, decode_responses=True)
    pubsub = r.pubsub()
    await pubsub.subscribe("triage_updates")
    
    print("📢 WebSocket broadcaster listening to Redis...")
    async for message in pubsub.listen():
        if message["type"] == "message":
            await manager.broadcast(message["data"])

@app.on_event("startup")
async def on_startup():
    print("🚀 Initializing Database...")
    await init_db()
    print("✅ Database initialized")
    
    # Start Redis Listener
    asyncio.create_task(redis_listener())

# Include Routers
app.include_router(intake.router, prefix=settings.API_V1_STR, tags=["intake"])
app.include_router(cases.router, prefix=settings.API_V1_STR, tags=["cases"])

@app.get("/")
def root():
    return {"message": "Welcome to MedTriage AI API", "status": "running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
