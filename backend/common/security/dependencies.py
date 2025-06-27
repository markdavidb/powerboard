#common/security/dependencies.py

import requests
from fastapi import Depends, HTTPException, Security, status, Request
from sqlalchemy.orm import Session
from common.database import get_db
from common.models.user import User
from common.config import settings
from common.security.auth0_bearer import Auth0Bearer

# ──────────────────────────────────────────────────────────────
# Auth0 token validator
# ──────────────────────────────────────────────────────────────
auth0_scheme = Auth0Bearer()

# Namespace where the Post-Login Action inserts `"roles": [...]`
ROLES_CLAIM = f"{settings.AUTH0_ROLES_CLAIM_NAMESPACE}roles"
ADMIN_ROLE = settings.PLATFORM_ADMIN_ROLE


def get_current_user(
    request: Request,
    token_payload: dict = Security(auth0_scheme),
    db: Session       = Depends(get_db),
) -> User:
    """
    Returns the local `User` DB object for the caller.
    Creates the record on-the-fly if this is a first-time login.

    Also stamps `request.state.is_admin = True` when the token
    contains the `platform_admin` role.
    """

    # ─── 1. Basic token fields ────────────────────────────────
    sub   = token_payload["sub"]
    token = token_payload.pop("_token", None)

    # ─── 2. Platform-admin flag ───────────────────────────────
    roles = token_payload.get(ROLES_CLAIM, [])
    request.state.is_admin = ADMIN_ROLE in roles

    # Find existing user
    user = db.query(User).filter(User.auth0_id == sub).first()
    if user:
        user.is_admin = request.state.is_admin  # convenience attr
        return user

    # ─── 4. Create user if first login ────────────────────────
    email    = token_payload.get("email")
    username = token_payload.get("nickname")

    # If email missing, call Auth0 /userinfo
    if not email:
        # call /userinfo as a fallback
        if not token:
            raise HTTPException(
                status.HTTP_401_UNAUTHORIZED,
                "Cannot fetch user profile (missing token)",
            )
        resp = requests.get(
            f"https://{settings.AUTH0_DOMAIN}/userinfo",
            headers={"Authorization": f"Bearer {token}"},
            timeout=5,
        )
        if resp.status_code != 200:
            raise HTTPException(
                status.HTTP_401_UNAUTHORIZED, "Failed to fetch user profile"
            )
        info = resp.json()
        email = info.get("email")
        username = username or info.get("nickname")

    username = username or email.split("@")[0]

    user = User(
        auth0_id=sub,
        username=username,
        email=email,
        display_name=username,
        bio="",
    )
    user.is_admin = request.state.is_admin

    db.add(user)
    db.commit()
    db.refresh(user)
    return user
