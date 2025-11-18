"""
Rotas para gerenciamento de Notes
"""
from fastapi import APIRouter, HTTPException, status
from app.models.note import Note, NoteCreate, NoteUpdate
from app.services.note_service import NoteService
from typing import List

router = APIRouter()


@router.post("/", response_model=Note, status_code=status.HTTP_201_CREATED)
async def create_note(note: NoteCreate):
    """Cria uma nova note"""
    try:
        return NoteService.create_note(note)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar note: {str(e)}"
        )


@router.get("/{note_id}", response_model=Note)
async def get_note(note_id: str):
    """Busca uma note por ID"""
    note = NoteService.get_note(note_id)
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note não encontrada"
        )
    return note


@router.put("/{note_id}", response_model=Note)
async def update_note(note_id: str, note: NoteUpdate):
    """Atualiza uma note"""
    updated_note = NoteService.update_note(note_id, note)
    if not updated_note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note não encontrada"
        )
    return updated_note


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(note_id: str):
    """Deleta uma note"""
    note = NoteService.get_note(note_id)
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note não encontrada"
        )
    NoteService.delete_note(note_id)
    return None


@router.get("/topic/{topic_id}", response_model=List[Note])
async def list_notes_by_topic(topic_id: str):
    """Lista todas as notes de um topic"""
    return NoteService.list_notes_by_topic(topic_id)

