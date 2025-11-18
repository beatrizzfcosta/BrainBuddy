"""
Modelo de dados para YouTubeSuggestion
"""
from pydantic import BaseModel
from typing import Optional


class YouTubeSuggestionBase(BaseModel):
    title: str
    url: str


class YouTubeSuggestionCreate(YouTubeSuggestionBase):
    topicId: str


class YouTubeSuggestionUpdate(BaseModel):
    title: Optional[str] = None
    url: Optional[str] = None


class YouTubeSuggestion(YouTubeSuggestionBase):
    suggestionId: str
    topicId: str

    class Config:
        from_attributes = True

