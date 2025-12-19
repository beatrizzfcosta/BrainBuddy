"""
Serviço para operações CRUD de Notes no Firestore
"""
from app.services.firebase_service import db
from app.models.note import Note, NoteCreate, NoteUpdate
from datetime import datetime
from typing import Optional, List
from google.cloud.firestore_v1 import FieldFilter


class NoteService:
    """
    Serviço para operações CRUD de notes (anotações) no Firestore
    
    Gerencia todas as operações relacionadas a notes, que podem ser geradas
    por IA ou criadas manualmente pelo usuário.
    
    Attributes:
        COLLECTION: Nome da coleção no Firestore ("notes")
    """
    COLLECTION = "notes"

    @staticmethod
    def create_note(note_data: NoteCreate) -> Note:
        """
        Cria uma nova note no Firestore
        
        Args:
            note_data: Dados da note a ser criada (NoteCreate)
        
        Returns:
            Note: Note criada (com noteId e createdAt atribuídos)
        
        Note:
            O campo `createdAt` é automaticamente adicionado com a data/hora atual
        """
        note_dict = note_data.model_dump()
        note_dict["createdAt"] = datetime.utcnow()
        
        doc_ref = db.collection(NoteService.COLLECTION).add(note_dict)
        note_dict["noteId"] = doc_ref[1].id
        return Note(**note_dict)

    @staticmethod
    def get_note(note_id: str) -> Optional[Note]:
        """
        Busca uma note por ID no Firestore
        
        Args:
            note_id: ID único da note no Firestore
        
        Returns:
            Optional[Note]: Dados da note se encontrada, None caso contrário
        """
        doc = db.collection(NoteService.COLLECTION).document(note_id).get()
        if doc.exists:
            data = doc.to_dict()
            return Note(noteId=doc.id, **data)
        return None

    @staticmethod
    def update_note(note_id: str, note_data: NoteUpdate) -> Optional[Note]:
        """
        Atualiza uma note existente no Firestore
        
        Args:
            note_id: ID único da note a ser atualizada
            note_data: Dados atualizados (NoteUpdate)
        
        Returns:
            Optional[Note]: Note atualizada se encontrada, None caso contrário
        """
        update_data = note_data.model_dump(exclude_unset=True)
        if not update_data:
            return NoteService.get_note(note_id)
        
        doc_ref = db.collection(NoteService.COLLECTION).document(note_id)
        doc_ref.update(update_data)
        return NoteService.get_note(note_id)

    @staticmethod
    def delete_note(note_id: str) -> bool:
        """
        Deleta uma note do Firestore
        
        Args:
            note_id: ID único da note a ser deletada
        
        Returns:
            bool: True se a operação foi bem-sucedida
        """
        db.collection(NoteService.COLLECTION).document(note_id).delete()
        return True

    @staticmethod
    def list_notes_by_topic(topic_id: str) -> List[Note]:
        """
        Lista todas as notes relacionadas a um topic
        
        Args:
            topic_id: ID único do topic
        
        Returns:
            List[Note]: Lista de todas as notes do topic especificado
        """
        docs = db.collection(NoteService.COLLECTION).where(
            filter=FieldFilter("topicId", "==", topic_id)
        ).stream()
        return [Note(noteId=doc.id, **doc.to_dict()) for doc in docs]

