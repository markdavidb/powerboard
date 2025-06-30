# services/ai_service/main.py

from fastapi import FastAPI, Security
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# 🔑  Auth
from common.security.auth0_bearer import Auth0Bearer
from common.auth0_docs import wire_auth0_docs        # Swagger PKCE helper

# 🔧  Routers
from services.ai_service.routers.suggestions import router as ai_router

load_dotenv()

app = FastAPI(title="AI Service (OpenAI)")
origins = [
    "http://localhost:5173",   # Vite dev
    "http://localhost:3000",   # Vite dev
    "http://localhost:4174",   # Vite preview build
    "http://64.225.111.50",    # Public IP
    "https://powerboard.up.railway.app",
]
# CORS – tighten to your real frontend origin in prod
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Add both dev and prod
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────────────────────────────────────────────────────────────────
# Require Auth0 on every endpoint in this service
# ──────────────────────────────────────────────────────────────────────────────
auth0_scheme = Auth0Bearer()
app.include_router(
    ai_router,
    prefix="/api/ai",
    tags=["ai"],
    dependencies=[Security(auth0_scheme)],   # 👈  JWT required!
)

# Add PKCE “Authorize” button to /docs
wire_auth0_docs(app, port=8006)

@app.get("/healthz")
def health():
    return {"status": "ok"}
