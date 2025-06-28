#realtime_gateway/main.py
import os
import json
import asyncio
from typing import Dict, Set, Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from jose import jwt

# Auth0 and internal secret settings
AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN", "dev-example.us.auth0.com")
AUTH0_AUDIENCE = os.getenv("AUTH0_AUDIENCE", "https://api.example.com")
INTERNAL_SECRET = os.getenv("GATEWAY_INTERNAL_SECRET", "dev-secret")

app = FastAPI(title="Real-Time Gateway")

origins = [
    "http://localhost:5173",   # Vite dev
    "http://localhost:3000",  # Vite dev

    "http://localhost:4174",   # Vite preview build
    "http://64.225.111.50",    # Public IP
    "https://powerboard.up.railway.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Map from Auth0 subject → set of WebSockets
connections: Dict[str, Set[WebSocket]] = {}

def extract_token(ws: WebSocket) -> Optional[str]:
    """
    Look for a JWT in:
      1) Authorization: Bearer <token> header, or
      2) token=... query param.
    """
    auth = ws.headers.get("authorization")
    if auth and auth.lower().startswith("bearer "):
        return auth.split(" ", 1)[1]
    return ws.query_params.get("token")

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    # 1) Get token
    token = extract_token(ws)
    if not token:
        await ws.close(code=4401, reason="Missing token")
        return

    # 2) Verify and extract "sub"
    try:
        claims = jwt.get_unverified_claims(token)
        user_id = claims["sub"]  # e.g. "auth0|abc123"
    except Exception:
        await ws.close(code=4401, reason="Invalid token")
        return

    # 3) Accept and register
    await ws.accept()
    connections.setdefault(user_id, set()).add(ws)
    print(f"WebSocket connected for {user_id} (now {len(connections[user_id])} open sockets)")

    # 4) Wait for any incoming text so that close() triggers a disconnect
    try:
        while True:
            # we don't actually use client messages, but receive_text()
            # will raise WebSocketDisconnect when the socket is closed
            _ = await ws.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        connections[user_id].discard(ws)
        if not connections[user_id]:
            del connections[user_id]
        print(f"WebSocket disconnected for {user_id}")

async def _broadcast(user_id: str, payload: dict):
    """
    Send JSON payload to every open socket for this user.
    """
    sockets = connections.get(user_id, set())
    if not sockets:
        return

    text = json.dumps(payload)
    # return_exceptions=True ensures one bad socket doesn’t cancel the rest
    await asyncio.gather(
        *(ws.send_text(text) for ws in sockets),
        return_exceptions=True
    )

@app.post("/publish")
async def publish(
    uid: str,
    msg: dict,
    secret: str = Depends(lambda: os.getenv("GATEWAY_INTERNAL_SECRET", "dev-secret"))
):
    """
    Internal endpoint: push a message to user `uid`.
    Returns immediately with {"detail":"queued"}.
    """
    if secret != INTERNAL_SECRET:
        raise HTTPException(status_code=403, detail="Bad secret")

    # Fire-and-forget
    asyncio.create_task(_broadcast(uid, msg))
    return {"detail": "queued"}
