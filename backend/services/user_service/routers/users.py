import requests
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import HttpUrl

from common.config import settings
from common.database import get_db
from common.models.user import User
from common.schemas.user_schema import User as UserSchema
from common.schemas.user_schema import UserUpdate
from common.security.dependencies import get_current_user

router = APIRouter()

# ────────────────────────────────────────────────────────────
# Helpers
# ────────────────────────────────────────────────────────────
def _get_mgmt_token() -> str:
    """
    Obtain a fresh Management-API token (client-credentials grant).
    """
    payload = {
        "grant_type": "client_credentials",
        "client_id": settings.AUTH0_M2M_CLIENT_ID,         # ← M2M client
        "client_secret": settings.AUTH0_M2M_CLIENT_SECRET, # ← M2M secret
        "audience": settings.AUTH0_M2M_AUDIENCE,           # ← M2M audience
        "scope": "create:user_tickets"
    }
    resp = requests.post(
        f"https://{settings.AUTH0_DOMAIN}/oauth/token",
        json=payload,
        timeout=5
    )
    if resp.status_code != 200:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            f"Auth0 token error: {resp.text}"
        )
    return resp.json()["access_token"]


# ────────────────────────────────────────────────────────────
# Profile CRUD
# ────────────────────────────────────────────────────────────
@router.get("/users/me", response_model=UserSchema)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/users/me", response_model=UserSchema)
def update_my_profile(
    update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    for field, value in update.dict(exclude_unset=True).items():
        if isinstance(value, HttpUrl):
            value = str(value)
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user

# ────────────────────────────────────────────────────────────
# Password‑change ticket
# ────────────────────────────────────────────────────────────
@router.post("/users/password-change-ticket")
def create_password_change_ticket(
    current_user: User = Depends(get_current_user)
) -> dict:
    """
    Returns `{ "ticket": "https://…/reset?ticket=…" }`
    Front‑end should redirect the browser to that URL.
    """
    mgmt_token = _get_mgmt_token()

    result_url = f"{settings.FRONTEND_ORIGIN.rstrip('/')}/profile"

    body = {
        "user_id": current_user.auth0_id,
        "result_url": result_url
    }
    headers = {"Authorization": f"Bearer {mgmt_token}"}

    resp = requests.post(
        f"https://{settings.AUTH0_DOMAIN}/api/v2/tickets/password-change",
        json=body,
        headers=headers,
        timeout=5
    )

    if resp.status_code != 201:
        raise HTTPException(
            status.HTTP_502_BAD_GATEWAY,
            f"Auth0 ticket error ({resp.status_code}): {resp.text}"
        )

    return {"ticket": resp.json()["ticket"]}
