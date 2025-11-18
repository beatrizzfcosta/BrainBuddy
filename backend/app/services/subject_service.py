"""
Serviço para operações CRUD de Subject no Firestore
"""
from app.services.firebase_service import db
from app.models.subject import Subject, SubjectCreate, SubjectUpdate
from datetime import datetime
from typing import Optional, List
from google.cloud.firestore_v1 import FieldFilter


class SubjectService:
    COLLECTION = "subjects"

    @staticmethod
    def create_subject(subject_data: SubjectCreate) -> Subject:
        """Cria um novo subject"""
        subject_dict = subject_data.model_dump()
        subject_dict["createdAt"] = datetime.utcnow()
        
        doc_ref = db.collection(SubjectService.COLLECTION).add(subject_dict)
        subject_dict["subjectId"] = doc_ref[1].id
        return Subject(**subject_dict)

    @staticmethod
    def get_subject(subject_id: str) -> Optional[Subject]:
        """Busca um subject por ID"""
        doc = db.collection(SubjectService.COLLECTION).document(subject_id).get()
        if doc.exists:
            data = doc.to_dict()
            return Subject(subjectId=doc.id, **data)
        return None

    @staticmethod
    def update_subject(subject_id: str, subject_data: SubjectUpdate) -> Optional[Subject]:
        """Atualiza um subject"""
        update_data = subject_data.model_dump(exclude_unset=True)
        if not update_data:
            return SubjectService.get_subject(subject_id)
        
        doc_ref = db.collection(SubjectService.COLLECTION).document(subject_id)
        doc_ref.update(update_data)
        return SubjectService.get_subject(subject_id)

    @staticmethod
    def delete_subject(subject_id: str) -> bool:
        """Deleta um subject"""
        db.collection(SubjectService.COLLECTION).document(subject_id).delete()
        return True

    @staticmethod
    def list_subjects_by_user(user_id: str) -> List[Subject]:
        """Lista todos os subjects de um usuário"""
        docs = db.collection(SubjectService.COLLECTION).where(
            filter=FieldFilter("userId", "==", user_id)
        ).stream()
        return [Subject(subjectId=doc.id, **doc.to_dict()) for doc in docs]

