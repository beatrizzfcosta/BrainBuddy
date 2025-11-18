"""
Modelos de dados do BrainBudy
"""
from .user import User, UserCreate, UserUpdate
from .subject import Subject, SubjectCreate, SubjectUpdate
from .topic import Topic, TopicCreate, TopicUpdate
from .slide import Slide, SlideCreate, SlideUpdate
from .note import Note, NoteCreate, NoteUpdate, NoteSource
from .ai_request import AIRequest, AIRequestCreate, AIRequestUpdate, AIStatus
from .study_session import StudySession, StudySessionCreate, StudySessionUpdate, SessionState
from .youtube_suggestion import YouTubeSuggestion, YouTubeSuggestionCreate, YouTubeSuggestionUpdate

__all__ = [
    "User", "UserCreate", "UserUpdate",
    "Subject", "SubjectCreate", "SubjectUpdate",
    "Topic", "TopicCreate", "TopicUpdate",
    "Slide", "SlideCreate", "SlideUpdate",
    "Note", "NoteCreate", "NoteUpdate", "NoteSource",
    "AIRequest", "AIRequestCreate", "AIRequestUpdate", "AIStatus",
    "StudySession", "StudySessionCreate", "StudySessionUpdate", "SessionState",
    "YouTubeSuggestion", "YouTubeSuggestionCreate", "YouTubeSuggestionUpdate",
]

