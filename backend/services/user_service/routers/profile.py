# services/user_service/routers/profile.py
from fastapi import APIRouter, Depends
from common.security.dependencies import get_current_user
from common.models.user import User
from pydantic import BaseModel

router = APIRouter()

class UserOut(BaseModel):
    id: int
    username: str
    email: str | None = None

    class Config:
        from_attributes = True

@router.get("/me", response_model=UserOut)
def get_my_profile(current_user: User = Depends(get_current_user)):
    """Return the Auth0‑based local user profile."""
    return current_user