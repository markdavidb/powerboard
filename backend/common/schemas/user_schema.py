# app/schemas/user_schema.py
from pydantic import BaseModel, EmailStr, HttpUrl
from typing import Optional


class UserBase(BaseModel):
    email: EmailStr
    username: str
    display_name: Optional[str] = None
    avatar_url:   Optional[HttpUrl] = None
    bio:          Optional[str] = None

class UserCreate(UserBase):
    password: str          # used only if you keep a local password

class UserUpdate(BaseModel):
    email: Optional[EmailStr]      = None
    display_name: Optional[str]    = None
    avatar_url: Optional[HttpUrl]  = None
    bio: Optional[str]             = None


class User(UserBase):
    id: int
    class Config:
        from_attributes = True
