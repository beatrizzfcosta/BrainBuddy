"""
Rotas para gerenciamento de AIRequests
"""
from fastapi import APIRouter, HTTPException, status
from app.models.ai_request import AIRequest, AIRequestCreate, AIRequestUpdate
from app.services.ai_request_service import AIRequestService
from typing import List

router = APIRouter()


@router.post("/", response_model=AIRequest, status_code=status.HTTP_201_CREATED)
async def create_ai_request(request: AIRequestCreate):
    """Cria um novo AI request"""
    try:
        return AIRequestService.create_ai_request(request)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar AI request: {str(e)}"
        )


@router.get("/{request_id}", response_model=AIRequest)
async def get_ai_request(request_id: str):
    """Busca um AI request por ID"""
    ai_request = AIRequestService.get_ai_request(request_id)
    if not ai_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AI request não encontrado"
        )
    return ai_request


@router.put("/{request_id}", response_model=AIRequest)
async def update_ai_request(request_id: str, request: AIRequestUpdate):
    """Atualiza um AI request"""
    updated_request = AIRequestService.update_ai_request(request_id, request)
    if not updated_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AI request não encontrado"
        )
    return updated_request


@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ai_request(request_id: str):
    """Deleta um AI request"""
    ai_request = AIRequestService.get_ai_request(request_id)
    if not ai_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AI request não encontrado"
        )
    AIRequestService.delete_ai_request(request_id)
    return None


@router.get("/user/{user_id}", response_model=List[AIRequest])
async def list_ai_requests_by_user(user_id: str):
    """Lista todos os AI requests de um usuário"""
    return AIRequestService.list_ai_requests_by_user(user_id)


@router.get("/topic/{topic_id}", response_model=List[AIRequest])
async def list_ai_requests_by_topic(topic_id: str):
    """Lista todos os AI requests de um topic"""
    return AIRequestService.list_ai_requests_by_topic(topic_id)

