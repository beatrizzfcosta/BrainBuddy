"""
Serviço para operações CRUD de StudySession no Firestore
"""
from app.services.firebase_service import db
from app.models.study_session import StudySession, StudySessionCreate, StudySessionUpdate, SessionState
from typing import Optional, List
from google.cloud.firestore_v1 import FieldFilter


class StudySessionService:
    """
    Serviço para operações CRUD de study sessions (sessões de estudo) no Firestore
    
    Gerencia todas as operações relacionadas a sessões de estudo agendadas,
    incluindo criação, busca, atualização e listagem por usuário ou topic.
    
    Attributes:
        COLLECTION: Nome da coleção no Firestore ("study_sessions")
    """
    COLLECTION = "study_sessions"

    @staticmethod
    def create_study_session(session_data: StudySessionCreate) -> StudySession:
        """
        Cria uma nova study session no Firestore
        
        Define automaticamente o estado como SCHEDULED e numberSessions como 1
        se não for fornecido.
        
        Args:
            session_data: Dados da sessão a ser criada (StudySessionCreate)
        
        Returns:
            StudySession: Sessão criada (com sessionId e state atribuídos)
        
        Note:
            O estado é automaticamente definido como SCHEDULED
        """
        session_dict = session_data.model_dump()
        session_dict["state"] = SessionState.SCHEDULED
        if "numberSessions" not in session_dict or session_dict["numberSessions"] is None:
            session_dict["numberSessions"] = 1
        
        doc_ref = db.collection(StudySessionService.COLLECTION).add(session_dict)
        session_dict["sessionId"] = doc_ref[1].id
        return StudySession(**session_dict)

    @staticmethod
    def get_study_session(session_id: str) -> Optional[StudySession]:
        """
        Busca uma study session por ID no Firestore
        
        Args:
            session_id: ID único da sessão no Firestore
        
        Returns:
            Optional[StudySession]: Dados da sessão se encontrada, None caso contrário
        """
        doc = db.collection(StudySessionService.COLLECTION).document(session_id).get()
        if doc.exists:
            data = doc.to_dict()
            return StudySession(sessionId=doc.id, **data)
        return None

    @staticmethod
    def update_study_session(session_id: str, session_data: StudySessionUpdate) -> Optional[StudySession]:
        """
        Atualiza uma study session existente no Firestore
        
        Permite atualizar campos como state (SCHEDULED, DONE, MISSED) e
        calendarEvent (ID do evento no Google Calendar).
        
        Args:
            session_id: ID único da sessão a ser atualizada
            session_data: Dados atualizados (StudySessionUpdate)
        
        Returns:
            Optional[StudySession]: Sessão atualizada se encontrada, None caso contrário
        """
        update_data = session_data.model_dump(exclude_unset=True)
        if not update_data:
            return StudySessionService.get_study_session(session_id)
        
        doc_ref = db.collection(StudySessionService.COLLECTION).document(session_id)
        doc_ref.update(update_data)
        return StudySessionService.get_study_session(session_id)

    @staticmethod
    def delete_study_session(session_id: str) -> bool:
        """
        Deleta uma study session do Firestore
        
        Args:
            session_id: ID único da sessão a ser deletada
        
        Returns:
            bool: True se a operação foi bem-sucedida
        
        Note:
            Esta operação não deleta automaticamente o evento no Google Calendar
            se houver um calendarEvent vinculado
        """
        db.collection(StudySessionService.COLLECTION).document(session_id).delete()
        return True

    @staticmethod
    def list_study_sessions_by_user(user_id: str) -> List[StudySession]:
        """
        Lista todas as study sessions de um usuário
        
        Args:
            user_id: ID único do usuário
        
        Returns:
            List[StudySession]: Lista de todas as sessões do usuário (todas os estados)
        """
        docs = db.collection(StudySessionService.COLLECTION).where(
            filter=FieldFilter("userId", "==", user_id)
        ).stream()
        return [StudySession(sessionId=doc.id, **doc.to_dict()) for doc in docs]

    @staticmethod
    def list_study_sessions_by_topic(topic_id: str) -> List[StudySession]:
        """
        Lista todas as study sessions relacionadas a um topic
        
        Args:
            topic_id: ID único do topic
        
        Returns:
            List[StudySession]: Lista de todas as sessões do topic especificado
        """
        docs = db.collection(StudySessionService.COLLECTION).where(
            filter=FieldFilter("topicId", "==", topic_id)
        ).stream()
        return [StudySession(sessionId=doc.id, **doc.to_dict()) for doc in docs]

