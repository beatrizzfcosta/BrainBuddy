"""
Serviço para operações CRUD de YouTubeSuggestion no Firestore
"""
from app.services.firebase_service import db
from app.models.youtube_suggestion import YouTubeSuggestion, YouTubeSuggestionCreate, YouTubeSuggestionUpdate
from typing import Optional, List
from google.cloud.firestore_v1 import FieldFilter


class YouTubeSuggestionService:
    """
    Serviço para operações CRUD de YouTube suggestions no Firestore
    
    Gerencia todas as operações relacionadas a sugestões de vídeos do YouTube
    para topics, incluindo criação, busca, atualização e listagem.
    
    Attributes:
        COLLECTION: Nome da coleção no Firestore ("youtube_suggestions")
    """
    COLLECTION = "youtube_suggestions"

    @staticmethod
    def create_youtube_suggestion(suggestion_data: YouTubeSuggestionCreate) -> YouTubeSuggestion:
        """
        Cria uma nova sugestão do YouTube no Firestore
        
        Args:
            suggestion_data: Dados da sugestão a ser criada (YouTubeSuggestionCreate)
        
        Returns:
            YouTubeSuggestion: Sugestão criada (com suggestionId atribuído)
        """
        suggestion_dict = suggestion_data.model_dump()
        
        doc_ref = db.collection(YouTubeSuggestionService.COLLECTION).add(suggestion_dict)
        suggestion_dict["suggestionId"] = doc_ref[1].id
        return YouTubeSuggestion(**suggestion_dict)

    @staticmethod
    def get_youtube_suggestion(suggestion_id: str) -> Optional[YouTubeSuggestion]:
        """
        Busca uma sugestão do YouTube por ID no Firestore
        
        Args:
            suggestion_id: ID único da sugestão no Firestore
        
        Returns:
            Optional[YouTubeSuggestion]: Dados da sugestão se encontrada, None caso contrário
        """
        doc = db.collection(YouTubeSuggestionService.COLLECTION).document(suggestion_id).get()
        if doc.exists:
            data = doc.to_dict()
            return YouTubeSuggestion(suggestionId=doc.id, **data)
        return None

    @staticmethod
    def update_youtube_suggestion(suggestion_id: str, suggestion_data: YouTubeSuggestionUpdate) -> Optional[YouTubeSuggestion]:
        """
        Atualiza uma sugestão do YouTube existente no Firestore
        
        Args:
            suggestion_id: ID único da sugestão a ser atualizada
            suggestion_data: Dados atualizados (YouTubeSuggestionUpdate)
        
        Returns:
            Optional[YouTubeSuggestion]: Sugestão atualizada se encontrada, None caso contrário
        """
        update_data = suggestion_data.model_dump(exclude_unset=True)
        if not update_data:
            return YouTubeSuggestionService.get_youtube_suggestion(suggestion_id)
        
        doc_ref = db.collection(YouTubeSuggestionService.COLLECTION).document(suggestion_id)
        doc_ref.update(update_data)
        return YouTubeSuggestionService.get_youtube_suggestion(suggestion_id)

    @staticmethod
    def delete_youtube_suggestion(suggestion_id: str) -> bool:
        """
        Deleta uma sugestão do YouTube do Firestore
        
        Args:
            suggestion_id: ID único da sugestão a ser deletada
        
        Returns:
            bool: True se a operação foi bem-sucedida
        """
        db.collection(YouTubeSuggestionService.COLLECTION).document(suggestion_id).delete()
        return True

    @staticmethod
    def list_youtube_suggestions_by_topic(topic_id: str) -> List[YouTubeSuggestion]:
        """
        Lista todas as sugestões do YouTube relacionadas a um topic (máximo de 5)
        
        Args:
            topic_id: ID único do topic
        
        Returns:
            List[YouTubeSuggestion]: Lista de até 5 sugestões do topic especificado
        
        Note:
            O limite de 5 sugestões é aplicado para manter a interface limpa
        """
        docs = db.collection(YouTubeSuggestionService.COLLECTION).where(
            filter=FieldFilter("topicId", "==", topic_id)
        ).limit(5).stream()
        return [YouTubeSuggestion(suggestionId=doc.id, **doc.to_dict()) for doc in docs]

    @staticmethod
    def count_suggestions_by_topic(topic_id: str) -> int:
        """
        Conta quantas sugestões existem para um topic
        
        Útil para verificar se já foram geradas 5 sugestões (limite máximo)
        antes de criar novas.
        
        Args:
            topic_id: ID único do topic
        
        Returns:
            int: Número total de sugestões para o topic
        """
        docs = db.collection(YouTubeSuggestionService.COLLECTION).where(
            filter=FieldFilter("topicId", "==", topic_id)
        ).stream()
        return sum(1 for _ in docs)

