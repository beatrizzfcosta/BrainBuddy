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
    summary: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    timezone: str = "UTC"


@router.post("/events")
async def create_calendar_event(
    event: CalendarEventCreate,
    access_token: str
):
    """Cria um evento no Google Calendar"""
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
async def get_calendar_event(event_id: str, access_token: str):
    """Busca um evento do Google Calendar"""
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
async def delete_calendar_event(event_id: str, access_token: str):
    """Deleta um evento do Google Calendar"""
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
async def list_calendars(access_token: str):
    """Lista os calendários do usuário"""
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

