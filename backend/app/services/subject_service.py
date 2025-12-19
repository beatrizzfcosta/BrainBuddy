"""
Serviço para operações CRUD de Subject no Firestore
"""
from app.services.firebase_service import db
from app.models.subject import Subject, SubjectCreate, SubjectUpdate
from datetime import datetime
from typing import Optional, List
from google.cloud.firestore_v1 import FieldFilter


class SubjectService:
    """
    Serviço para operações CRUD de subjects (disciplinas) no Firestore
    
    Gerencia todas as operações relacionadas a subjects, incluindo criação,
    busca, atualização, deleção e listagem por usuário.
    
    Attributes:
        COLLECTION: Nome da coleção no Firestore ("subjects")
    """
    COLLECTION = "subjects"

    @staticmethod
    def create_subject(subject_data: SubjectCreate) -> Subject:
        """
        Cria um novo subject no Firestore
        
        Args:
            subject_data: Dados do subject a ser criado (SubjectCreate)
        
        Returns:
            Subject: Subject criado (com subjectId e createdAt atribuídos)
        
        Note:
            O campo `createdAt` é automaticamente adicionado com a data/hora atual
        """
        subject_dict = subject_data.model_dump()
        subject_dict["createdAt"] = datetime.utcnow()
        
        doc_ref = db.collection(SubjectService.COLLECTION).add(subject_dict)
        subject_dict["subjectId"] = doc_ref[1].id
        return Subject(**subject_dict)

    @staticmethod
    def get_subject(subject_id: str) -> Optional[Subject]:
        """
        Busca um subject por ID no Firestore
        
        Args:
            subject_id: ID único do subject no Firestore
        
        Returns:
            Optional[Subject]: Dados do subject se encontrado, None caso contrário
        """
        doc = db.collection(SubjectService.COLLECTION).document(subject_id).get()
        if doc.exists:
            data = doc.to_dict()
            return Subject(subjectId=doc.id, **data)
        return None

    @staticmethod
    def update_subject(subject_id: str, subject_data: SubjectUpdate) -> Optional[Subject]:
        """
        Atualiza um subject existente no Firestore
        
        Args:
            subject_id: ID único do subject a ser atualizado
            subject_data: Dados atualizados (SubjectUpdate)
        
        Returns:
            Optional[Subject]: Subject atualizado se encontrado, None caso contrário
        """
        update_data = subject_data.model_dump(exclude_unset=True)
        if not update_data:
            return SubjectService.get_subject(subject_id)
        
        doc_ref = db.collection(SubjectService.COLLECTION).document(subject_id)
        doc_ref.update(update_data)
        return SubjectService.get_subject(subject_id)

    @staticmethod
    def delete_subject(subject_id: str) -> bool:
        """
        Deleta um subject do Firestore
        
        Args:
            subject_id: ID único do subject a ser deletado
        
        Returns:
            bool: True se a operação foi bem-sucedida
        
        Warning:
            Esta operação não deleta automaticamente topics, notes ou
            study sessions relacionados. Considere implementar cascade delete.
        """
        db.collection(SubjectService.COLLECTION).document(subject_id).delete()
        return True

    @staticmethod
    def list_subjects_by_user(user_id: str) -> List[Subject]:
        """
        Lista todos os subjects de um usuário
        
        Args:
            user_id: ID único do usuário
        
        Returns:
            List[Subject]: Lista de todos os subjects do usuário especificado
        """
        docs = db.collection(SubjectService.COLLECTION).where(
            filter=FieldFilter("userId", "==", user_id)
        ).stream()
        return [Subject(subjectId=doc.id, **doc.to_dict()) for doc in docs]

