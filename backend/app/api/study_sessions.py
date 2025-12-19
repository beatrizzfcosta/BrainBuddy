"""
Rotas para gerenciamento de StudySessions
"""
from fastapi import APIRouter, HTTPException, status
from app.models.study_session import StudySession, StudySessionCreate, StudySessionUpdate
from app.services.study_session_service import StudySessionService
from typing import List

router = APIRouter()


@router.post("/", response_model=StudySession, status_code=status.HTTP_201_CREATED)
async def create_study_session(session: StudySessionCreate):
    """
    Cria uma nova sessão de estudo
    
    Args:
        session: Dados da sessão de estudo a ser criada (StudySessionCreate)
    
    Returns:
        StudySession: Sessão de estudo criada
    
    Raises:
        HTTPException: Se falhar ao criar a sessão (500)
    """
    try:
        return StudySessionService.create_study_session(session)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar study session: {str(e)}"
        )


@router.get("/{session_id}", response_model=StudySession)
async def get_study_session(session_id: str):
    """
    Busca uma sessão de estudo por ID
    
    Args:
        session_id: ID único da sessão de estudo
    
    Returns:
        StudySession: Dados da sessão encontrada
    
    Raises:
        HTTPException: Se a sessão não for encontrada (404)
    """
    session = StudySessionService.get_study_session(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study session não encontrada"
        )
    return session


@router.put("/{session_id}", response_model=StudySession)
async def update_study_session(session_id: str, session: StudySessionUpdate):
    """
    Atualiza uma sessão de estudo existente
    
    Args:
        session_id: ID único da sessão a ser atualizada
        session: Dados atualizados (StudySessionUpdate)
    
    Returns:
        StudySession: Sessão atualizada
    
    Raises:
        HTTPException: Se a sessão não for encontrada (404)
    """
    updated_session = StudySessionService.update_study_session(session_id, session)
    if not updated_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study session não encontrada"
        )
    return updated_session


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_study_session(session_id: str):
    """
    Deleta uma sessão de estudo
    
    Args:
        session_id: ID único da sessão a ser deletada
    
    Returns:
        None: Status 204 (No Content) em caso de sucesso
    
    Raises:
        HTTPException: Se a sessão não for encontrada (404)
    """
    session = StudySessionService.get_study_session(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study session não encontrada"
        )
    StudySessionService.delete_study_session(session_id)
    return None


@router.get("/user/{user_id}", response_model=List[StudySession])
async def list_study_sessions_by_user(user_id: str):
    """
    Lista todas as sessões de estudo de um usuário
    
    Args:
        user_id: ID único do usuário
    
    Returns:
        List[StudySession]: Lista de todas as sessões do usuário
    """
    return StudySessionService.list_study_sessions_by_user(user_id)


@router.get("/topic/{topic_id}", response_model=List[StudySession])
async def list_study_sessions_by_topic(topic_id: str):
    """
    Lista todas as sessões de estudo relacionadas a um topic
    
    Args:
        topic_id: ID único do topic
    
    Returns:
        List[StudySession]: Lista de todas as sessões do topic
    """
    return StudySessionService.list_study_sessions_by_topic(topic_id)

