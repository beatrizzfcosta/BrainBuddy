"""
Rotas para integração com Google Calendar
"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import os
import httpx

router = APIRouter()

GOOGLE_CALENDAR_API_URL = "https://www.googleapis.com/calendar/v3"


class CalendarEventCreate(BaseModel):
    """
    Modelo Pydantic para criação de evento no Google Calendar
    
    Attributes:
        summary: Título/resumo do evento
        description: Descrição opcional do evento
        start_time: Data e hora de início do evento
        end_time: Data e hora de fim do evento
        timezone: Fuso horário (padrão: UTC)
    """
    summary: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    timezone: str = "UTC"


@router.post("/events")
async def create_calendar_event(
    event: CalendarEventCreate,
    access_token: str  # Query parameter: ?access_token=...
):
    """
    Cria um evento no Google Calendar
    
    Args:
        event: Dados do evento a ser criado (CalendarEventCreate)
        access_token: Token de acesso do Google OAuth (query parameter)
    
    Returns:
        dict: Dados do evento criado retornados pela API do Google Calendar
    
    Raises:
        HTTPException: Se falhar ao criar o evento (status code da API do Google)
    """
    event_data = {
        "summary": event.summary,
        "description": event.description,
        "start": {
            "dateTime": event.start_time.isoformat(),
            "timeZone": event.timezone
        },
        "end": {
            "dateTime": event.end_time.isoformat(),
            "timeZone": event.timezone
        }
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{GOOGLE_CALENDAR_API_URL}/calendars/primary/events",
            headers={"Authorization": f"Bearer {access_token}"},
            json=event_data
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Erro ao criar evento: {response.text}"
            )
        
        return response.json()


@router.get("/events/{event_id}")
async def get_calendar_event(
    event_id: str,
    access_token: str  # Query parameter: ?access_token=...
):
    """
    Busca um evento específico do Google Calendar
    
    Args:
        event_id: ID do evento no Google Calendar
        access_token: Token de acesso do Google OAuth (query parameter)
    
    Returns:
        dict: Dados do evento retornados pela API do Google Calendar
    
    Raises:
        HTTPException: Se o evento não for encontrado (404)
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{GOOGLE_CALENDAR_API_URL}/calendars/primary/events/{event_id}",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail="Evento não encontrado"
            )
        
        return response.json()


@router.delete("/events/{event_id}")
async def delete_calendar_event(
    event_id: str,
    access_token: str  # Query parameter: ?access_token=...
):
    """
    Deleta um evento do Google Calendar
    
    Args:
        event_id: ID do evento no Google Calendar a ser deletado
        access_token: Token de acesso do Google OAuth (query parameter)
    
    Returns:
        dict: Mensagem de sucesso {"message": "Evento deletado com sucesso"}
    
    Raises:
        HTTPException: Se falhar ao deletar o evento
    """
    async with httpx.AsyncClient() as client:
        response = await client.delete(
            f"{GOOGLE_CALENDAR_API_URL}/calendars/primary/events/{event_id}",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        
        if response.status_code != 204:
            raise HTTPException(
                status_code=response.status_code,
                detail="Erro ao deletar evento"
            )
        
        return {"message": "Evento deletado com sucesso"}


@router.get("/calendars")
async def list_calendars(
    access_token: str  # Query parameter: ?access_token=...
):
    """
    Lista todos os calendários do usuário no Google Calendar
    
    Args:
        access_token: Token de acesso do Google OAuth (query parameter)
    
    Returns:
        dict: Lista de calendários retornada pela API do Google Calendar
    
    Raises:
        HTTPException: Se falhar ao listar os calendários
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{GOOGLE_CALENDAR_API_URL}/users/me/calendarList",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail="Erro ao listar calendários"
            )
        
        return response.json()

