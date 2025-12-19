"""
Serviço para operações CRUD de Slide no Firestore
"""
from app.services.firebase_service import db
from app.models.slide import Slide, SlideCreate, SlideUpdate
from datetime import datetime
from typing import Optional, List
from google.cloud.firestore_v1 import FieldFilter


class SlideService:
    """
    Serviço para operações CRUD de slides no Firestore
    
    Gerencia todas as operações relacionadas a slides (arquivos de apresentação
    ou documentos) associados a topics.
    
    Attributes:
        COLLECTION: Nome da coleção no Firestore ("slides")
    """
    COLLECTION = "slides"

    @staticmethod
    def create_slide(slide_data: SlideCreate) -> Slide:
        """
        Cria um novo slide no Firestore
        
        Args:
            slide_data: Dados do slide a ser criado (SlideCreate)
        
        Returns:
            Slide: Slide criado (com slideId, createdAt e uploadedAt atribuídos)
        
        Note:
            Os campos `createdAt` e `uploadedAt` são automaticamente adicionados
            com a data/hora atual
        """
        slide_dict = slide_data.model_dump()
        now = datetime.utcnow()
        slide_dict["createdAt"] = now
        slide_dict["uploadedAt"] = now
        
        doc_ref = db.collection(SlideService.COLLECTION).add(slide_dict)
        slide_dict["slideId"] = doc_ref[1].id
        return Slide(**slide_dict)

    @staticmethod
    def get_slide(slide_id: str) -> Optional[Slide]:
        """
        Busca um slide por ID no Firestore
        
        Args:
            slide_id: ID único do slide no Firestore
        
        Returns:
            Optional[Slide]: Dados do slide se encontrado, None caso contrário
        """
        doc = db.collection(SlideService.COLLECTION).document(slide_id).get()
        if doc.exists:
            data = doc.to_dict()
            return Slide(slideId=doc.id, **data)
        return None

    @staticmethod
    def update_slide(slide_id: str, slide_data: SlideUpdate) -> Optional[Slide]:
        """
        Atualiza um slide existente no Firestore
        
        Args:
            slide_id: ID único do slide a ser atualizado
            slide_data: Dados atualizados (SlideUpdate)
        
        Returns:
            Optional[Slide]: Slide atualizado se encontrado, None caso contrário
        """
        update_data = slide_data.model_dump(exclude_unset=True)
        if not update_data:
            return SlideService.get_slide(slide_id)
        
        doc_ref = db.collection(SlideService.COLLECTION).document(slide_id)
        doc_ref.update(update_data)
        return SlideService.get_slide(slide_id)

    @staticmethod
    def delete_slide(slide_id: str) -> bool:
        """
        Deleta um slide do Firestore
        
        Args:
            slide_id: ID único do slide a ser deletado
        
        Returns:
            bool: True se a operação foi bem-sucedida
        
        Note:
            Esta operação não deleta o arquivo físico se estiver armazenado
            em outro serviço (ex: Google Cloud Storage)
        """
        db.collection(SlideService.COLLECTION).document(slide_id).delete()
        return True

    @staticmethod
    def list_slides_by_topic(topic_id: str) -> List[Slide]:
        """
        Lista todos os slides relacionados a um topic
        
        Args:
            topic_id: ID único do topic
        
        Returns:
            List[Slide]: Lista de todos os slides do topic especificado
        """
        docs = db.collection(SlideService.COLLECTION).where(
            filter=FieldFilter("topicId", "==", topic_id)
        ).stream()
        return [Slide(slideId=doc.id, **doc.to_dict()) for doc in docs]

