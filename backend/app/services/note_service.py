from app.services.firebase_service import db
from app.models.note import Note, NoteCreate, NoteUpdate
from datetime import datetime
from typing import Optional, List
from google.cloud.firestore_v1 import FieldFilter


class NoteService:
    COLLECTION = "notes"

    @staticmethod
    def create_note(note_data: NoteCreate) -> Note:
        """Cria uma nova note"""
        note_dict = note_data.model_dump()
        note_dict["createdAt"] = datetime.utcnow()
        
        doc_ref = db.collection(NoteService.COLLECTION).add(note_dict)
        note_dict["noteId"] = doc_ref[1].id
        return Note(**note_dict)

    @staticmethod
    def get_note(note_id: str) -> Optional[Note]:
        """Busca uma note por ID"""
        doc = db.collection(NoteService.COLLECTION).document(note_id).get()
        if doc.exists:
            data = doc.to_dict()
            return Note(noteId=doc.id, **data)
        return None

    @staticmethod
    def update_note(note_id: str, note_data: NoteUpdate) -> Optional[Note]:
        """Atualiza uma note"""
        update_data = note_data.model_dump(exclude_unset=True)
        if not update_data:
            return NoteService.get_note(note_id)
        
        doc_ref = db.collection(NoteService.COLLECTION).document(note_id)
        doc_ref.update(update_data)
        return NoteService.get_note(note_id)

    @staticmethod
    def delete_note(note_id: str) -> bool:
        """Deleta uma note"""
        db.collection(NoteService.COLLECTION).document(note_id).delete()
        return True

    @staticmethod
    def list_notes_by_topic(topic_id: str) -> List[Note]:
        """Lista todas as notes de um topic"""
        docs = db.collection(NoteService.COLLECTION).where(
            filter=FieldFilter("topicId", "==", topic_id)
        ).stream()
        return [Note(noteId=doc.id, **doc.to_dict()) for doc in docs]

