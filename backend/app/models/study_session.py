"""
Modelo de dados para StudySession
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum


class SessionState(str, Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in progress"
    COMPLETED = "completed"
    MISSED = "missed"


class StudySessionBase(BaseModel):
    startTime: datetime
    endTime: datetime
    topicId: str


class StudySessionCreate(StudySessionBase):
    userId: str
    requestId: Optional[str] = None
    calendarEvent: Optional[str] = None
    numberSessions: Optional[int] = 1


class StudySessionUpdate(BaseModel):
    startTime: Optional[datetime] = None
    endTime: Optional[datetime] = None
    calendarEvent: Optional[str] = None
    state: Optional[SessionState] = None
    numberSessions: Optional[int] = None


class StudySession(StudySessionBase):
    sessionId: str
    userId: str
    requestId: Optional[str] = None
    calendarEvent: Optional[str] = None
    numberSessions: int = 1
    state: SessionState = SessionState.SCHEDULED

    class Config:
        from_attributes = True

