from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from common.auth0_docs import wire_auth0_docs
from services.notification_service.routers.notifications import router as note_router

app = FastAPI(title="Notification Service")
wire_auth0_docs(app, port=8004)

origins = [
    "http://localhost:5173",   # Vite dev
    "http://localhost:3000",  # Vite dev

    "http://localhost:4174",   # Vite preview build
    "http://64.225.111.50",    # Public IP
    "https://powerboard.up.railway.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Add both dev and prod
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

app.include_router(note_router)

@app.get("/healthz")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("notification_service.main:app", port=8004, reload=True)
