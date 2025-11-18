"""
Modelo de dados para AIRequest
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum


class AIStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"


class AIRequestBase(BaseModel):
    prompt: str
    topicId: str
    slideId: Optional[str] = None


class AIRequestCreate(AIRequestBase):
    userId: str


class AIRequestUpdate(BaseModel):
    response: Optional[str] = None
    status: Optional[AIStatus] = None


class AIRequest(AIRequestBase):
    requestId: str
    userId: str
    response: Optional[str] = None
    status: AIStatus = AIStatus.PENDING
    createdAt: datetime

    class Config:
        from_attributes = True

