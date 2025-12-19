"""
Serviço para operações CRUD de Topic no Firestore
"""
from app.services.firebase_service import db
from app.models.topic import Topic, TopicCreate, TopicUpdate
from typing import Optional, List
from google.cloud.firestore_v1 import FieldFilter


class TopicService:
    """
    Serviço para operações CRUD de topics no Firestore
    
    Gerencia todas as operações relacionadas a topics (tópicos de estudo),
    incluindo criação, busca, atualização, deleção e listagem por subject.
    
    Attributes:
        COLLECTION: Nome da coleção no Firestore ("topics")
    """
    COLLECTION = "topics"

    @staticmethod
    def create_topic(topic_data: TopicCreate) -> Topic:
        """
        Cria um novo topic no Firestore
        
        Args:
            topic_data: Dados do topic a ser criado (TopicCreate)
        
        Returns:
            Topic: Topic criado (com topicId atribuído)
        """
        topic_dict = topic_data.model_dump()
        
        doc_ref = db.collection(TopicService.COLLECTION).add(topic_dict)
        topic_dict["topicId"] = doc_ref[1].id
        return Topic(**topic_dict)

    @staticmethod
    def get_topic(topic_id: str) -> Optional[Topic]:
        """
        Busca um topic por ID no Firestore
        
        Args:
            topic_id: ID único do topic no Firestore
        
        Returns:
            Optional[Topic]: Dados do topic se encontrado, None caso contrário
        """
        doc = db.collection(TopicService.COLLECTION).document(topic_id).get()
        if doc.exists:
            data = doc.to_dict()
            return Topic(topicId=doc.id, **data)
        return None

    @staticmethod
    def update_topic(topic_id: str, topic_data: TopicUpdate) -> Optional[Topic]:
        """
        Atualiza um topic existente no Firestore
        
        Atualiza apenas os campos fornecidos em topic_data.
        
        Args:
            topic_id: ID único do topic a ser atualizado
            topic_data: Dados atualizados (TopicUpdate)
        
        Returns:
            Optional[Topic]: Topic atualizado se encontrado, None caso contrário
        """
        update_data = topic_data.model_dump(exclude_unset=True)
        if not update_data:
            return TopicService.get_topic(topic_id)
        
        doc_ref = db.collection(TopicService.COLLECTION).document(topic_id)
        doc_ref.update(update_data)
        return TopicService.get_topic(topic_id)

    @staticmethod
    def delete_topic(topic_id: str) -> bool:
        """
        Deleta um topic do Firestore
        
        Args:
            topic_id: ID único do topic a ser deletado
        
        Returns:
            bool: True se a operação foi bem-sucedida
        
        Warning:
            Esta operação não deleta automaticamente notes, slides ou
            study sessions relacionados. Considere implementar cascade delete.
        """
        db.collection(TopicService.COLLECTION).document(topic_id).delete()
        return True

    @staticmethod
    def list_topics_by_subject(subject_id: str) -> List[Topic]:
        """
        Lista todos os topics relacionados a um subject
        
        Args:
            subject_id: ID único do subject
        
        Returns:
            List[Topic]: Lista de todos os topics do subject especificado
        """
        docs = db.collection(TopicService.COLLECTION).where(
            filter=FieldFilter("subjectId", "==", subject_id)
        ).stream()
        return [Topic(topicId=doc.id, **doc.to_dict()) for doc in docs]

