"""
Rotas para gerenciamento de YouTubeSuggestions
"""
from fastapi import APIRouter, HTTPException, status
from app.api.youtube import youtube_search
from app.models.youtube_suggestion import (
    YouTubeSuggestion,
    YouTubeSuggestionCreate
)
from app.services.youtube_suggestion_service import YouTubeSuggestionService
from app.services.topic_service import TopicService  # ⬅ IMPORTANTE

router = APIRouter()


@router.get("/suggest", response_model=YouTubeSuggestion)
def generate_single_youtube_suggestion(topicId: str):
    #Gera sugestão, através do título do topic
    #Busca na FireStore
    topic = TopicService.get_topic(topicId)
    if not topic:
        raise HTTPException(status_code=404, detail="Topic não encontrado.")

    #Pesquisa no Youtube
    search_text = topic.title
    yt_results = youtube_search(search_text, max_results=1)["results"]

    if not yt_results:
        raise HTTPException(
            status_code=404,
            detail="Nenhum vídeo encontrado para este tópico."
        )

    video = yt_results[0]

    #Cria sugestão
    suggestion = YouTubeSuggestionCreate(
        title=video["title"],
        url=video["url"],
        topicId=topicId
    )

    saved = YouTubeSuggestionService.create_youtube_suggestion(suggestion)
    return saved


@router.get("/{suggestion_id}", response_model=YouTubeSuggestion)
def get_youtube_suggestion(suggestion_id: str):
    suggestion = YouTubeSuggestionService.get_youtube_suggestion(suggestion_id)
    if not suggestion:
        raise HTTPException(status_code=404, detail="Sugestão não encontrada.")
    return suggestion


@router.get("/topic/{topic_id}")
def list_suggestions_by_topic(topic_id: str):
    return YouTubeSuggestionService.list_youtube_suggestions_by_topic(topic_id)


@router.delete("/{suggestion_id}")
def delete_youtube_suggestion(suggestion_id: str):
    YouTubeSuggestionService.delete_youtube_suggestion(suggestion_id)
    return {"deleted": True, "suggestionId": suggestion_id}
