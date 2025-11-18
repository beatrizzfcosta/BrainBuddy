"""
Modelo de dados para Slide
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class SlideBase(BaseModel):
    fileName: str


class SlideCreate(SlideBase):
    topicId: str
    fileUrl: Optional[str] = None


class SlideUpdate(BaseModel):
    fileName: Optional[str] = None
    fileUrl: Optional[str] = None


class Slide(SlideBase):
    slideId: str
    topicId: str
    fileUrl: Optional[str] = None
    createdAt: datetime
    uploadedAt: datetime

    class Config:
        from_attributes = True

