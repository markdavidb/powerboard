# analytics_service/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from services.analytics_service.routers.dashboard       import router as dashboard_router
from services.analytics_service.routers.project_summary import router as proj_router
from services.analytics_service.routers import export    # (if you already have this)

from common.auth0_docs import wire_auth0_docs

app = FastAPI(title="Analytics Service")
wire_auth0_docs(app, port=8003)

# ─── CORS ───
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev
        "http://localhost:3000",  # Vite dev

        "http://localhost:4174",  # Vite preview build
        "http://64.225.111.50",  # Public IP
        "https://powerboard.up.railway.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── ROUTERS ───
# All analytics URLs live under /api/analytics/…
app.include_router(dashboard_router, prefix="/api/analytics", tags=["dashboard"])
app.include_router(proj_router,      prefix="/api/analytics", tags=["project_summary"])
app.include_router(export.router,    prefix="/api/analytics", tags=["export"])

@app.get("/healthz")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("analytics_service.main:app", host="0.0.0.0", port=8003, reload=True)
