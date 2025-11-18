"""
Modelo de dados para User
"""
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class UserBase(BaseModel):
    name: str
    email: EmailStr
    googleCalendarConnected: bool = False


class UserCreate(UserBase):
    pass


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    googleCalendarConnected: Optional[bool] = None


class User(UserBase):
    userId: str
    createdAt: datetime

    class Config:
        from_attributes = True

