# scheduler_service/main.py

from fastapi                     import FastAPI
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from services.scheduler_service.jobs import overdue_task_check, project_due_soon_check

app = FastAPI(title="Scheduler Service")

@app.on_event("startup")
async def _init():
    sched = AsyncIOScheduler()
    sched.add_job(overdue_task_check,     "interval", minutes=30)
    sched.add_job(project_due_soon_check, "interval", seconds=30)
    sched.start()

@app.get("/healthz")
def health():
    return {"status": "ok"}
