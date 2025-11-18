"""
Modelo de dados para Topic
"""
from pydantic import BaseModel
from typing import Optional


class TopicBase(BaseModel):
    title: str
    description: Optional[str] = None


class TopicCreate(TopicBase):
    subjectId: str


class TopicUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None


class Topic(TopicBase):
    topicId: str
    subjectId: str

    class Config:
        from_attributes = True

