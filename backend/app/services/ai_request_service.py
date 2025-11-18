"""
Serviço para operações CRUD de AIRequest no Firestore
"""
from app.services.firebase_service import db
from app.models.ai_request import AIRequest, AIRequestCreate, AIRequestUpdate, AIStatus
from datetime import datetime
from typing import Optional, List
from google.cloud.firestore_v1 import FieldFilter


class AIRequestService:
    COLLECTION = "ai_requests"

    @staticmethod
    def create_ai_request(request_data: AIRequestCreate) -> AIRequest:
        """Cria um novo AI request"""
        request_dict = request_data.model_dump()
        request_dict["status"] = AIStatus.PENDING
        request_dict["createdAt"] = datetime.utcnow()
        
        doc_ref = db.collection(AIRequestService.COLLECTION).add(request_dict)
        request_dict["requestId"] = doc_ref[1].id
        return AIRequest(**request_dict)

    @staticmethod
    def get_ai_request(request_id: str) -> Optional[AIRequest]:
        """Busca um AI request por ID"""
        doc = db.collection(AIRequestService.COLLECTION).document(request_id).get()
        if doc.exists:
            data = doc.to_dict()
            return AIRequest(requestId=doc.id, **data)
        return None

    @staticmethod
    def update_ai_request(request_id: str, request_data: AIRequestUpdate) -> Optional[AIRequest]:
        """Atualiza um AI request"""
        update_data = request_data.model_dump(exclude_unset=True)
        if not update_data:
            return AIRequestService.get_ai_request(request_id)
        
        doc_ref = db.collection(AIRequestService.COLLECTION).document(request_id)
        doc_ref.update(update_data)
        return AIRequestService.get_ai_request(request_id)

    @staticmethod
    def delete_ai_request(request_id: str) -> bool:
        """Deleta um AI request"""
        db.collection(AIRequestService.COLLECTION).document(request_id).delete()
        return True

    @staticmethod
    def list_ai_requests_by_user(user_id: str) -> List[AIRequest]:
        """Lista todos os AI requests de um usuário"""
        docs = db.collection(AIRequestService.COLLECTION).where(
            filter=FieldFilter("userId", "==", user_id)
        ).stream()
        return [AIRequest(requestId=doc.id, **doc.to_dict()) for doc in docs]

    @staticmethod
    def list_ai_requests_by_topic(topic_id: str) -> List[AIRequest]:
        """Lista todos os AI requests de um topic"""
        docs = db.collection(AIRequestService.COLLECTION).where(
            filter=FieldFilter("topicId", "==", topic_id)
        ).stream()
        return [AIRequest(requestId=doc.id, **doc.to_dict()) for doc in docs]

