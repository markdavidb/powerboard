# user_service/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from common.auth0_docs import wire_auth0_docs      # ← add
from services.user_service.routers import profile, users

app = FastAPI(title="User Service")
wire_auth0_docs(app, port=8001)                   # ← add

# CORS (adjust for your frontend)
origins = [
    "http://localhost:5173",   # Vite dev
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

# mount routers
app.include_router(profile.router, prefix="/api/users", tags=["profile"])
app.include_router(users.router, prefix="/api/users", tags=["users"])

@app.get("/healthz")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("user_service.main:app", host="0.0.0.0", port=8001, reload=True)