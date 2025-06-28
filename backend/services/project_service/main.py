# services/project_service/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from common.auth0_docs import wire_auth0_docs

from services.project_service.routers import (
    projects,
    project_members,
    big_tasks,
    big_task_members,
    tasks,
    task_comments,
    admin,             # ← NEW
)

app = FastAPI(title="Project Service")
wire_auth0_docs(app, port=8002)

# ─────────────── CORS ───────────────
origins = [
    "http://localhost:5173",
    "http://localhost:3000",  # Vite dev

    "http://localhost:4174",
    "http://64.225.111.50",
    "https://powerboard.up.railway.app",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────── Routers ─────────────
app.include_router(projects.router,          prefix="/api/projects",           tags=["projects"])
app.include_router(project_members.router,   prefix="/api/projects/members",   tags=["project_members"])
app.include_router(big_tasks.router,         prefix="/api/projects/big_tasks", tags=["big_tasks"])
app.include_router(big_task_members.router,  prefix="/api/projects/big_task_members", tags=["big_task_members"])
app.include_router(tasks.router,             prefix="/api/projects/tasks",     tags=["tasks"])
app.include_router(task_comments.router,     prefix="/api/projects/task_comments", tags=["task_comments"])
app.include_router(admin.router,             prefix="/api",                    tags=["admin"])

@app.get("/healthz")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("services.project_service.main:app", host="0.0.0.0", port=8002, reload=True)
