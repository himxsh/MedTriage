from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response as StarletteResponse
import asyncio
import redis.asyncio as redis

from app.core.config import settings
from app.core.auth import ws_user_from_cookie
from app.db.session import init_db
from app.api.v1 import intake, cases, auth, metrics

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """HSTS when ENABLE_HSTS (TLS at reverse proxy). No-op in local HTTP."""

    async def dispatch(self, request: Request, call_next) -> StarletteResponse:
        response = await call_next(request)
        if settings.ENABLE_HSTS:
            response.headers.setdefault(
                "Strict-Transport-Security",
                "max-age=31536000; includeSubDomains",
            )
        return response


app.add_middleware(SecurityHeadersMiddleware)


class ConnectionManager:
    def __init__(self):
        # (websocket, org_id_str)
        self.active_connections: list[tuple[WebSocket, str]] = []

    async def connect(self, websocket: WebSocket, org_id: str):
        await websocket.accept()
        self.active_connections.append((websocket, org_id))

    def disconnect(self, websocket: WebSocket):
        self.active_connections = [(ws, oid) for ws, oid in self.active_connections if ws != websocket]

    async def broadcast(self, message: str, org_id: str | None = None):
        dead: list[WebSocket] = []
        for connection, oid in self.active_connections:
            if org_id is not None and oid != org_id:
                continue
            try:
                await connection.send_text(message)
            except Exception:
                dead.append(connection)
        for ws in dead:
            self.disconnect(ws)


manager = ConnectionManager()


@app.websocket("/ws/queue")
async def websocket_endpoint(websocket: WebSocket):
    from app.db.session import engine
    from sqlalchemy.ext.asyncio import AsyncSession as AS
    from sqlalchemy.orm import sessionmaker

    async_session = sessionmaker(engine, class_=AS, expire_on_commit=False)
    async with async_session() as db:
        user = await ws_user_from_cookie(websocket, db)

    # Accept then close if unauthenticated (Starlette needs accept to close cleanly)
    await websocket.accept()
    if not user:
        await websocket.close(code=4401)
        return

    manager.active_connections.append((websocket, str(user.org_id)))
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


async def redis_listener():
    import json
    r = await redis.from_url(settings.REDIS_URL, decode_responses=True)
    pubsub = r.pubsub()
    await pubsub.subscribe("triage_updates")

    print("📢 WebSocket broadcaster listening to Redis...")
    async for message in pubsub.listen():
        if message["type"] == "message":
            data = message["data"]
            org_id = None
            try:
                parsed = json.loads(data)
                org_id = parsed.get("org_id")
            except Exception:
                pass
            await manager.broadcast(data, org_id=org_id)


@app.on_event("startup")
async def on_startup():
    print("🚀 Initializing Database...")
    await init_db()
    print("✅ Database initialized")
    asyncio.create_task(redis_listener())


app.include_router(auth.router, prefix=settings.API_V1_STR, tags=["auth"])
app.include_router(intake.router, prefix=settings.API_V1_STR, tags=["intake"])
app.include_router(cases.router, prefix=settings.API_V1_STR, tags=["cases"])
app.include_router(metrics.router, prefix=settings.API_V1_STR, tags=["metrics"])


@app.get("/")
def root():
    return {"message": "Welcome to MedTriage AI API", "status": "running"}


if __name__ == "__main__":
    import uvicorn
    # Local default: loopback only. Production: reverse proxy → 127.0.0.1 (see docs/ops-production.md).
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
