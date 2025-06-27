# app/core/auth0_bearer.py

from functools import lru_cache
from typing import Optional, Dict

import requests
from jose import jwt, jwk       # <-- import jwk
from jose.utils import base64url_decode
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    AUTH0_DOMAIN: str
    AUTH0_API_AUDIENCE: str
    AUTH0_ALGORITHMS: str = "RS256"
    AUTH0_ISSUER: Optional[str] = None

    @property
    def issuer(self) -> str:
        return self.AUTH0_ISSUER or f"https://{self.AUTH0_DOMAIN}/"

    class Config:
        env_file = ".env"
        extra = "ignore"

@lru_cache()
def get_settings() -> Settings:
    return Settings()

class Auth0Bearer(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super().__init__(auto_error=auto_error)
        cfg = get_settings()
        jwks = requests.get(
            f"https://{cfg.AUTH0_DOMAIN}/.well-known/jwks.json",
            timeout=5
        ).json()["keys"]
        # build an index from kid → JWK dict
        self.jwk_index: Dict[str, dict] = { k["kid"]: k for k in jwks }
        self.cfg = cfg

    def __call__(
        self,
        credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())
    ):
        if credentials.scheme.lower() != "bearer":
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid auth scheme")

        token = credentials.credentials

        try:
            unverified_header = jwt.get_unverified_header(token)
            jwk_dict = self.jwk_index[unverified_header["kid"]]

            # 1️⃣ reconstruct the public key from the JWK
            public_key = jwk.construct(jwk_dict)

            # 2️⃣ manually verify the signature (optional, but instructive)
            message, encoded_sig = token.rsplit(".", 1)
            decoded_sig = base64url_decode(encoded_sig.encode("utf-8"))
            if not public_key.verify(message.encode("utf-8"), decoded_sig):
                raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token signature")

            # 3️⃣ now decode the JWT using the PEM form of that public key
            pem_key = public_key.to_pem().decode("utf-8")
            payload = jwt.decode(
                token,
                pem_key,
                algorithms=[self.cfg.AUTH0_ALGORITHMS],
                audience=self.cfg.AUTH0_API_AUDIENCE,
                issuer=self.cfg.issuer,
            )

        except KeyError:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Unknown key ID")
        except jwt.JWTError as exc:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Bad token") from exc

        payload["_token"] = token
        return payload
