# services/ai_service/routers/suggestions.py
import os
import re
import json
import logging

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from openai import OpenAI, OpenAIError

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
