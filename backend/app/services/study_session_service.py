"""
Serviço para operações CRUD de StudySession no Firestore
"""
from app.services.firebase_service import db
from app.models.study_session import StudySession, StudySessionCreate, StudySessionUpdate, SessionState
from typing import Optional, List
from google.cloud.firestore_v1 import FieldFilter


class StudySessionService:
    COLLECTION = "study_sessions"

    @staticmethod
    def create_study_session(session_data: StudySessionCreate) -> StudySession:
        """Cria uma nova study session"""
        session_dict = session_data.model_dump()
        session_dict["state"] = SessionState.SCHEDULED
        if "numberSessions" not in session_dict or session_dict["numberSessions"] is None:
            session_dict["numberSessions"] = 1
        
        doc_ref = db.collection(StudySessionService.COLLECTION).add(session_dict)
        session_dict["sessionId"] = doc_ref[1].id
        return StudySession(**session_dict)

    @staticmethod
    def get_study_session(session_id: str) -> Optional[StudySession]:
        """Busca uma study session por ID"""
        doc = db.collection(StudySessionService.COLLECTION).document(session_id).get()
        if doc.exists:
            data = doc.to_dict()
            return StudySession(sessionId=doc.id, **data)
        return None

    @staticmethod
    def update_study_session(session_id: str, session_data: StudySessionUpdate) -> Optional[StudySession]:
        """Atualiza uma study session"""
        update_data = session_data.model_dump(exclude_unset=True)
        if not update_data:
            return StudySessionService.get_study_session(session_id)
        
        doc_ref = db.collection(StudySessionService.COLLECTION).document(session_id)
        doc_ref.update(update_data)
        return StudySessionService.get_study_session(session_id)

    @staticmethod
    def delete_study_session(session_id: str) -> bool:
        """Deleta uma study session"""
        db.collection(StudySessionService.COLLECTION).document(session_id).delete()
        return True

    @staticmethod
    def list_study_sessions_by_user(user_id: str) -> List[StudySession]:
        """Lista todas as study sessions de um usuário"""
        docs = db.collection(StudySessionService.COLLECTION).where(
            filter=FieldFilter("userId", "==", user_id)
        ).stream()
        return [StudySession(sessionId=doc.id, **doc.to_dict()) for doc in docs]

    @staticmethod
    def list_study_sessions_by_topic(topic_id: str) -> List[StudySession]:
        """Lista todas as study sessions de um topic"""
        docs = db.collection(StudySessionService.COLLECTION).where(
            filter=FieldFilter("topicId", "==", topic_id)
        ).stream()
        return [StudySession(sessionId=doc.id, **doc.to_dict()) for doc in docs]

