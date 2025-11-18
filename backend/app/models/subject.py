"""
Modelo de dados para Subject
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class SubjectBase(BaseModel):
    name: str
    description: Optional[str] = None


class SubjectCreate(SubjectBase):
    userId: str


class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class Subject(SubjectBase):
    subjectId: str
    userId: str
    createdAt: datetime

    class Config:
        from_attributes = True

