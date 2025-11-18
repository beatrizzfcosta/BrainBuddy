from fastapi import APIRouter, HTTPException, status
from app.models.slide import Slide, SlideCreate, SlideUpdate
from app.services.slide_service import SlideService
from typing import List

router = APIRouter()


@router.post("/", response_model=Slide, status_code=status.HTTP_201_CREATED)
async def create_slide(slide: SlideCreate):
    """Cria um novo slide"""
    try:
        return SlideService.create_slide(slide)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar slide: {str(e)}"
        )


@router.get("/{slide_id}", response_model=Slide)
async def get_slide(slide_id: str):
    """Busca um slide por ID"""
    slide = SlideService.get_slide(slide_id)
    if not slide:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Slide não encontrado"
        )
    return slide


@router.put("/{slide_id}", response_model=Slide)
async def update_slide(slide_id: str, slide: SlideUpdate):
    """Atualiza um slide"""
    updated_slide = SlideService.update_slide(slide_id, slide)
    if not updated_slide:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Slide não encontrado"
        )
    return updated_slide


@router.delete("/{slide_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_slide(slide_id: str):
    """Deleta um slide"""
    slide = SlideService.get_slide(slide_id)
    if not slide:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Slide não encontrado"
        )
    SlideService.delete_slide(slide_id)
    return None


@router.get("/topic/{topic_id}", response_model=List[Slide])
async def list_slides_by_topic(topic_id: str):
    """Lista todos os slides de um topic"""
    return SlideService.list_slides_by_topic(topic_id)

