"""
Modelo de dados para Note
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum


class NoteSource(str, Enum):
    MANUAL = "manual"
    AI_GENERATED = "AI-generated"
    EXTRACTED_FROM_SLIDE = "extracted from slide"


class NoteBase(BaseModel):
    content: str
    source: NoteSource = NoteSource.MANUAL


class NoteCreate(NoteBase):
    topicId: str


class NoteUpdate(BaseModel):
    content: Optional[str] = None
    source: Optional[NoteSource] = None


class Note(NoteBase):
    noteId: str
    topicId: str
    createdAt: datetime

    class Config:
        from_attributes = True

