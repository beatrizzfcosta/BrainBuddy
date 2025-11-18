"""
Serviço para operações CRUD de YouTubeSuggestion no Firestore
"""
from app.services.firebase_service import db
from app.models.youtube_suggestion import YouTubeSuggestion, YouTubeSuggestionCreate, YouTubeSuggestionUpdate
from typing import Optional, List
from google.cloud.firestore_v1 import FieldFilter


class YouTubeSuggestionService:
    COLLECTION = "youtube_suggestions"

    @staticmethod
    def create_youtube_suggestion(suggestion_data: YouTubeSuggestionCreate) -> YouTubeSuggestion:
        """Cria uma nova YouTube suggestion"""
        suggestion_dict = suggestion_data.model_dump()
        
        doc_ref = db.collection(YouTubeSuggestionService.COLLECTION).add(suggestion_dict)
        suggestion_dict["suggestionId"] = doc_ref[1].id
        return YouTubeSuggestion(**suggestion_dict)

    @staticmethod
    def get_youtube_suggestion(suggestion_id: str) -> Optional[YouTubeSuggestion]:
        """Busca uma YouTube suggestion por ID"""
        doc = db.collection(YouTubeSuggestionService.COLLECTION).document(suggestion_id).get()
        if doc.exists:
            data = doc.to_dict()
            return YouTubeSuggestion(suggestionId=doc.id, **data)
        return None

    @staticmethod
    def update_youtube_suggestion(suggestion_id: str, suggestion_data: YouTubeSuggestionUpdate) -> Optional[YouTubeSuggestion]:
        """Atualiza uma YouTube suggestion"""
        update_data = suggestion_data.model_dump(exclude_unset=True)
        if not update_data:
            return YouTubeSuggestionService.get_youtube_suggestion(suggestion_id)
        
        doc_ref = db.collection(YouTubeSuggestionService.COLLECTION).document(suggestion_id)
        doc_ref.update(update_data)
        return YouTubeSuggestionService.get_youtube_suggestion(suggestion_id)

    @staticmethod
    def delete_youtube_suggestion(suggestion_id: str) -> bool:
        """Deleta uma YouTube suggestion"""
        db.collection(YouTubeSuggestionService.COLLECTION).document(suggestion_id).delete()
        return True

    @staticmethod
    def list_youtube_suggestions_by_topic(topic_id: str) -> List[YouTubeSuggestion]:
        """Lista todas as YouTube suggestions de um topic"""
        docs = db.collection(YouTubeSuggestionService.COLLECTION).where(
            filter=FieldFilter("topicId", "==", topic_id)
        ).stream()
        return [YouTubeSuggestion(suggestionId=doc.id, **doc.to_dict()) for doc in docs]

