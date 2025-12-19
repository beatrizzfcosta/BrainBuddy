"""
Serviço para operações CRUD de AIRequest no Firestore
"""
from app.services.firebase_service import db
from app.models.ai_request import AIRequest, AIRequestCreate, AIRequestUpdate, AIStatus
from datetime import datetime
from typing import Optional, List
from google.cloud.firestore_v1 import FieldFilter


class AIRequestService:
    """
    Serviço para operações CRUD de AI requests no Firestore
    
    Gerencia todas as operações relacionadas a requisições de IA, que são usadas
    para gerar conteúdo, resumos e sugestões usando a API do Gemini.
    
    Attributes:
        COLLECTION: Nome da coleção no Firestore ("ai_requests")
    """
    COLLECTION = "ai_requests"

    @staticmethod
    def create_ai_request(request_data: AIRequestCreate) -> AIRequest:
        """
        Cria um novo AI request no Firestore
        
        Define automaticamente o status como PENDING e adiciona createdAt.
        
        Args:
            request_data: Dados da requisição a ser criada (AIRequestCreate)
        
        Returns:
            AIRequest: Requisição criada (com requestId, status e createdAt atribuídos)
        
        Note:
            O status é automaticamente definido como PENDING
        """
        request_dict = request_data.model_dump()
        request_dict["status"] = AIStatus.PENDING
        request_dict["createdAt"] = datetime.utcnow()
        
        doc_ref = db.collection(AIRequestService.COLLECTION).add(request_dict)
        request_dict["requestId"] = doc_ref[1].id
        return AIRequest(**request_dict)

    @staticmethod
    def get_ai_request(request_id: str) -> Optional[AIRequest]:
        """
        Busca um AI request por ID no Firestore
        
        Args:
            request_id: ID único da requisição no Firestore
        
        Returns:
            Optional[AIRequest]: Dados da requisição se encontrada, None caso contrário
        """
        doc = db.collection(AIRequestService.COLLECTION).document(request_id).get()
        if doc.exists:
            data = doc.to_dict()
            return AIRequest(requestId=doc.id, **data)
        return None

    @staticmethod
    def update_ai_request(request_id: str, request_data: AIRequestUpdate) -> Optional[AIRequest]:
        """
        Atualiza um AI request existente no Firestore
        
        Permite atualizar campos como status (PENDING, DONE, ERROR) e response
        quando a requisição for processada.
        
        Args:
            request_id: ID único da requisição a ser atualizada
            request_data: Dados atualizados (AIRequestUpdate)
        
        Returns:
            Optional[AIRequest]: Requisição atualizada se encontrada, None caso contrário
        """
        update_data = request_data.model_dump(exclude_unset=True)
        if not update_data:
            return AIRequestService.get_ai_request(request_id)
        
        doc_ref = db.collection(AIRequestService.COLLECTION).document(request_id)
        doc_ref.update(update_data)
        return AIRequestService.get_ai_request(request_id)

    @staticmethod
    def delete_ai_request(request_id: str) -> bool:
        """
        Deleta um AI request do Firestore
        
        Args:
            request_id: ID único da requisição a ser deletada
        
        Returns:
            bool: True se a operação foi bem-sucedida
        """
        db.collection(AIRequestService.COLLECTION).document(request_id).delete()
        return True

    @staticmethod
    def list_ai_requests_by_user(user_id: str) -> List[AIRequest]:
        """
        Lista todos os AI requests de um usuário
        
        Args:
            user_id: ID único do usuário
        
        Returns:
            List[AIRequest]: Lista de todas as requisições do usuário (todos os status)
        """
        docs = db.collection(AIRequestService.COLLECTION).where(
            filter=FieldFilter("userId", "==", user_id)
        ).stream()
        return [AIRequest(requestId=doc.id, **doc.to_dict()) for doc in docs]

    @staticmethod
    def list_ai_requests_by_topic(topic_id: str) -> List[AIRequest]:
        """
        Lista todos os AI requests relacionados a um topic
        
        Args:
            topic_id: ID único do topic
        
        Returns:
            List[AIRequest]: Lista de todas as requisições do topic especificado
        """
        docs = db.collection(AIRequestService.COLLECTION).where(
            filter=FieldFilter("topicId", "==", topic_id)
        ).stream()
        return [AIRequest(requestId=doc.id, **doc.to_dict()) for doc in docs]

