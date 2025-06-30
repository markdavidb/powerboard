# app/config.py
from typing import Optional
from pydantic_settings import BaseSettings     # ← CHANGE 1

class Settings(BaseSettings):
    # existing
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    DATABASE_URL: str
    # SPA (used by Auth0Bearer & docs OAuth config)
    AUTH0_DOMAIN: str
    AUTH0_API_AUDIENCE: str
    AUTH0_CLIENT_ID: str  # ← SPA Client ID
    AUTH0_ALGORITHMS: str = "RS256"
    AUTH0_ISSUER: Optional[str]

    # M2M (used only for mgmt‐api ticket calls)
    AUTH0_M2M_CLIENT_ID: str
    AUTH0_M2M_CLIENT_SECRET: str
    AUTH0_M2M_AUDIENCE: str

    FRONTEND_ORIGIN: str

    # ─────────── admin-role config ─
    AUTH0_ROLES_CLAIM_NAMESPACE: str = "https://powerboard.local/"
    PLATFORM_ADMIN_ROLE: str = "platform_admin"

    def issuer(self) -> str:
        return self.AUTH0_ISSUER or f"https://{self.AUTH0_DOMAIN}/"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
