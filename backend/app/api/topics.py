"""
Rotas para gerenciamento de Topics
"""
from fastapi import APIRouter, HTTPException, status
from app.models.topic import Topic, TopicCreate, TopicUpdate
from app.services.topic_service import TopicService
from typing import List

router = APIRouter()


@router.post("/", response_model=Topic, status_code=status.HTTP_201_CREATED)
async def create_topic(topic: TopicCreate):
    """Cria um novo topic"""
    try:
        return TopicService.create_topic(topic)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar topic: {str(e)}"
        )


@router.get("/{topic_id}", response_model=Topic)
async def get_topic(topic_id: str):
    """Busca um topic por ID"""
    topic = TopicService.get_topic(topic_id)
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic não encontrado"
        )
    return topic


@router.put("/{topic_id}", response_model=Topic)
async def update_topic(topic_id: str, topic: TopicUpdate):
    """Atualiza um topic"""
    updated_topic = TopicService.update_topic(topic_id, topic)
    if not updated_topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic não encontrado"
        )
    return updated_topic


@router.delete("/{topic_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_topic(topic_id: str):
    """Deleta um topic"""
    topic = TopicService.get_topic(topic_id)
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic não encontrado"
        )
    TopicService.delete_topic(topic_id)
    return None


@router.get("/subject/{subject_id}", response_model=List[Topic])
async def list_topics_by_subject(subject_id: str):
    """Lista todos os topics de um subject"""
    return TopicService.list_topics_by_subject(subject_id)

