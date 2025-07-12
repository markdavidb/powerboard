# services/ai_service/routers/suggestions.py
import os
import re
import json
import logging
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session, joinedload
from dotenv import load_dotenv
from openai import OpenAI, OpenAIError

# Import database and models - just like analytics service does
from common.database import get_db
from common.models.task import Task
from common.models.big_task import BigTask
from common.models.project import Project
from common.models.user import User
from common.security.dependencies import get_current_user
from common.enums import TaskStatus

# ──────────────────────────────────────────────────────────────────────────────
# Configuration & Logger
# ──────────────────────────────────────────────────────────────────────────────
load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

OPENAI_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_KEY:
    raise RuntimeError("Environment variable OPENAI_API_KEY is missing")

client = OpenAI(api_key=OPENAI_KEY)
router = APIRouter()

# ──────────────────────────────────────────────────────────────────────────────
# Request / Response Models
# ──────────────────────────────────────────────────────────────────────────────
class SuggestRequest(BaseModel):
    description: str = Field(..., min_length=5, max_length=1_000)
    n: int = Field(5, ge=1, le=10)

class SuggestResponse(BaseModel):
    suggestions: list[str]

# Risk Prediction Models
class TaskRiskData(BaseModel):
    task_id: int
    title: str
    status: str
    priority: str
    due_date: Optional[str]
    assignee_name: Optional[str]
    days_overdue: Optional[int]

class RiskAlert(BaseModel):
    risk_type: str
    severity: str  # "High", "Medium", "Low"
    description: str
    affected_items: List[str]
    recommendations: List[str]

class RiskAnalysisRequest(BaseModel):
    project_id: int

class RiskAnalysisResponse(BaseModel):
    project_title: str
    total_risks: int
    risk_alerts: List[RiskAlert]
    summary: str

# ──────────────────────────────────────────────────────────────────────────────
# Route: /ai/suggest_subtasks
# ──────────────────────────────────────────────────────────────────────────────
@router.post("/suggest_subtasks", response_model=SuggestResponse)
def suggest_subtasks(body: SuggestRequest):
    prompt = (
        "You are a senior project-management assistant.\n"
        f"Generate {body.n} subtasks for the epic below, "
        "each a short action sentence (max 12 words), and return **only** a JSON list.\n\n"
        f"Epic: \"{body.description.strip()}\""
    )

    # 1) Call OpenAI
    try:
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=200,
        )
        raw = completion.choices[0].message.content
        logger.info("OpenAI raw output:\n%s", raw)
    except OpenAIError as e:
        logger.error("OpenAIError in suggest_subtasks: %s", e, exc_info=True)
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, f"OpenAI error: {e}")

    # 2) Strip Markdown fences
    cleaned = re.sub(r"^```(?:json)?\s*", "", raw.strip(), flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned).strip()
    logger.info("Cleaned JSON payload:\n%s", cleaned)

    # 3) Parse JSON
    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError:
        logger.error("Failed to JSON-parse: %s", cleaned)
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "Invalid JSON from model")

    # 4) Normalize to list[str]
    if isinstance(parsed, list):
        suggestions = parsed
    elif isinstance(parsed, dict) and "subtasks" in parsed and isinstance(parsed["subtasks"], list):
        suggestions = parsed["subtasks"]
    else:
        logger.error("Unexpected JSON shape: %r", parsed)
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "Expected a JSON list or {subtasks: [...] }")

    # 5) Validate contents
    if not all(isinstance(x, str) for x in suggestions):
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "All subtasks must be strings")

    # 6) Trim to requested count
    suggestions = [s.strip() for s in suggestions][: body.n]
    return SuggestResponse(suggestions=suggestions)

# ──────────────────────────────────────────────────────────────────────────────
# Route: /ai/analyze_risks
# ──────────────────────────────────────────────────────────────────────────────


@router.post("/analyze_risks", response_model=RiskAnalysisResponse)
def analyze_project_risks(
    body: RiskAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1) Load project
    project = db.query(Project).filter(Project.id == body.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # 2) Load tasks
    tasks = (
        db.query(Task)
          .options(joinedload(Task.assignee), joinedload(Task.reporter))
          .filter(Task.project_id == body.project_id)
          .all()
    )

    current_date = datetime.now(timezone.utc)
    task_data: List[TaskRiskData] = []

    for task in tasks:
        # Normalize status to a simple string
        status_value = str(task.status).strip()
        logger.info("→ task %r status=%r", task.title, status_value)

        # Skip completed ones
        if status_value.lower() == "done":
            logger.info("✔ Skipping completed task %r", task.title)
            continue

        # Compute days overdue if applicable
        days_overdue = None
        if task.due_date:
            due_dt = task.due_date
            if due_dt.tzinfo is None or due_dt.tzinfo.utcoffset(due_dt) is None:
                due_dt = due_dt.replace(tzinfo=timezone.utc)
            days_overdue = (current_date - due_dt).days

        # Pick an assignee name
        if task.assignee_id and task.assignee:
            assignee = task.assignee.username
        elif task.reporter:
            assignee = f"{task.reporter.username} (creator)"
        else:
            assignee = None

        task_data.append(TaskRiskData(
            task_id=task.id,
            title=task.title,
            status=status_value,
            priority=str(task.priority),
            due_date=task.due_date.isoformat() if task.due_date else None,
            assignee_name=assignee,
            days_overdue=days_overdue if days_overdue and days_overdue > 0 else None
        ))

    logger.info("✔ Filtered tasks count: %d", len(task_data))

    if not task_data:
        return RiskAnalysisResponse(
            project_title=project.title,
            total_risks=0,
            risk_alerts=[],
            summary="All tasks are complete—no current risks detected."
        )


    # Create AI prompt for risk analysis with clear instructions about completed tasks
    prompt = f"""
You are a senior project management risk analyst. Analyze the following project data and identify potential risks.

Project: {project.title}
Current Date: {current_date.strftime('%Y-%m-%d')}

Tasks Data:
{json.dumps([task.dict() for task in task_data], indent=2)}

IMPORTANT RULES:
- NEVER flag tasks with status "Done" as overdue, regardless of their due date
- Only consider tasks overdue if they have a due date in the past AND status is NOT "Done"
- Tasks with status "Done" are completed and should not be flagged for any time-related risks

Analyze and return a JSON response with the following structure:
{{
    "risk_alerts": [
        {{
            "risk_type": "string (e.g., 'Overdue Tasks', 'Resource Overload', 'Missing Assignments')",
            "severity": "string (High/Medium/Low)",
            "description": "string (detailed description of the risk)",
            "affected_items": ["array of affected task titles or team member names"],
            "recommendations": ["array of specific actionable recommendations"]
        }}
    ],
    "summary": "string (2-3 sentence overall project risk assessment)"
}}

Focus on these risk categories:
1. Overdue tasks (tasks past due date AND NOT completed)
2. High priority tasks without assignees
3. Team members with too many assigned tasks
4. Tasks stuck in "In Progress" for too long
5. Missing or unclear task priorities
6. Potential bottlenecks and dependencies

Return ONLY the JSON response.
    """

    try:
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,  # Lower temperature for more consistent analysis
            max_tokens=1000,
        )
        raw_response = completion.choices[0].message.content
        logger.info("OpenAI risk analysis raw output:\n%s", raw_response)
    except OpenAIError as e:
        logger.error("OpenAIError in analyze_risks: %s", e, exc_info=True)
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, f"OpenAI error: {e}")

    # Clean and parse JSON response
    cleaned = re.sub(r"^```(?:json)?\s*", "", raw_response.strip(), flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned).strip()

    try:
        parsed_response = json.loads(cleaned)
    except json.JSONDecodeError as e:
        logger.error("Failed to parse AI response as JSON: %s", e)
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "Invalid JSON response from AI")

    # Validate and structure the response
    risk_alerts = []
    for alert_data in parsed_response.get("risk_alerts", []):
        risk_alert = RiskAlert(
            risk_type=alert_data.get("risk_type", "Unknown Risk"),
            severity=alert_data.get("severity", "Medium"),
            description=alert_data.get("description", "No description provided"),
            affected_items=alert_data.get("affected_items", []),
            recommendations=alert_data.get("recommendations", [])
        )
        risk_alerts.append(risk_alert)

    return RiskAnalysisResponse(
        project_title=project.title,
        total_risks=len(risk_alerts),
        risk_alerts=risk_alerts,
        summary=parsed_response.get("summary", "Risk analysis completed.")
    )
