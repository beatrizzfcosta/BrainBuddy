"""
Rotas para gerenciamento de Subjects
"""
from fastapi import APIRouter, HTTPException, status
from app.models.subject import Subject, SubjectCreate, SubjectUpdate
from app.services.subject_service import SubjectService
from typing import List

router = APIRouter()


@router.post("/", response_model=Subject, status_code=status.HTTP_201_CREATED)
async def create_subject(subject: SubjectCreate):
    """Cria um novo subject"""
    try:
        return SubjectService.create_subject(subject)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar subject: {str(e)}"
        )


@router.get("/{subject_id}", response_model=Subject)
async def get_subject(subject_id: str):
    """Busca um subject por ID"""
    subject = SubjectService.get_subject(subject_id)
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject não encontrado"
        )
    return subject


@router.put("/{subject_id}", response_model=Subject)
async def update_subject(subject_id: str, subject: SubjectUpdate):
    """Atualiza um subject"""
    updated_subject = SubjectService.update_subject(subject_id, subject)
    if not updated_subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject não encontrado"
        )
    return updated_subject


@router.delete("/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subject(subject_id: str):
    """Deleta um subject"""
    subject = SubjectService.get_subject(subject_id)
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject não encontrado"
        )
    SubjectService.delete_subject(subject_id)
    return None


@router.get("/user/{user_id}", response_model=List[Subject])
async def list_subjects_by_user(user_id: str):
    """Lista todos os subjects de um usuário"""
    return SubjectService.list_subjects_by_user(user_id)

