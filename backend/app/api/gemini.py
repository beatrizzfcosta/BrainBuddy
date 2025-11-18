"""
Rotas para integração com Gemini API (versão atualizada)
"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
import os
import httpx
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# API do Gemini - versão gratuita
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-pro")

class GeminiRequest(BaseModel):
    prompt: str
    topic_id: Optional[str] = None
    slide_id: Optional[str] = None
    context: Optional[str] = None

async def list_available_models(client: httpx.AsyncClient) -> List[str]:
    """
    Lista modelos disponíveis via API. Útil para debug / fallback dinâmico.
    Retorna uma lista de model ids (strings) — se falhar, retorna lista vazia.
    """
    try:
        url = f"{GEMINI_API_URL}/models"
        r = await client.get(url, params={"key": GEMINI_API_KEY}, timeout=10.0)
        if r.status_code == 200:
            data = r.json()
            models = []
            for m in data.get("models", []):
                # cada item tem 'name' ou 'id' dependendo da resposta — adaptamos
                name = m.get("name") or m.get("id") or m.get("model")
                if name:
                    models.append(name)
            return models
    except Exception as e:
        logger.debug("Não foi possível listar modelos: %s", e)
    return []

@router.post("/generate")
async def generate_with_gemini(request: GeminiRequest):
    """Gera explicação usando Gemini API (versão gratuita)"""
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GEMINI_API_KEY não configurado"
        )

    # Construir prompt com contexto se fornecido
    full_prompt = request.prompt
    if request.context:
        full_prompt = f"Contexto: {request.context}\n\nExplique: {request.prompt}"

    payload = {
        "contents": [{
            "parts": [{"text": full_prompt}]
        }]
    }

    # Modelos a tentar 
    models_to_try = [
        GEMINI_MODEL,
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
        "gemini-2.5-pro",
        "gemini-2.5-flash-preview-09-2025"
    ]

    async with httpx.AsyncClient() as client:
        last_error = None

        # --- opcional: obter modelos disponíveis e filtrar a lista ---
        try:
            available = await list_available_models(client)
            if available:
                # Keep only models that appear to be available (string contains model id)
                filtered = [m for m in models_to_try if any(m in a for a in available)]
                if filtered:
                    models_to_try = filtered
        except Exception:
            # não falhar aqui — apenas log
            logger.debug("Falha ao filtrar modelos via list_available_models", exc_info=True)

        for model in models_to_try:
            if not model:
                continue

            try:
                url = f"{GEMINI_API_URL}/models/{model}:generateContent"
                params = {"key": GEMINI_API_KEY}

                response = await client.post(
                    url,
                    params=params,
                    json=payload,
                    timeout=30.0
                )

                # debug
                logger.debug("Tentativa model=%s status=%s", model, response.status_code)

                if response.status_code == 200:
                    data = response.json()
                    # estrutura esperada: data["candidates"][0]["content"]["parts"][0]["text"]
                    candidates = data.get("candidates") or []
                    if len(candidates) > 0:
                        # concatena todos os parts de texto (se houver mais de um)
                        parts = candidates[0].get("content", {}).get("parts", [])
                        texts = []
                        for p in parts:
                            # p pode ter 'text' ou 'inline_data'; lidamos apenas com text aqui
                            if isinstance(p, dict) and p.get("text"):
                                texts.append(p.get("text"))
                        text = "\n".join(texts).strip()
                        if text:
                            return {
                                "response": text,
                                "prompt": request.prompt,
                                "topic_id": request.topic_id,
                                "slide_id": request.slide_id,
                                "model_used": model
                            }

                    # se status 200 mas sem candidatos, capturar corpo para debug
                    last_error = f"No candidates returned. body={response.text}"
                else:
                    # registrar corpo de erro/razão (ex.: 404 model not found)
                    last_error = f"model={model} status={response.status_code} body={response.text}"
                    logger.warning(last_error)

            except Exception as e:
                last_error = str(e)
                logger.exception("Erro ao chamar Gemini para model %s: %s", model, e)
                continue

        # Se nenhum modelo funcionou, retornar erro
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao gerar resposta com todos os modelos tentados. Último erro: {last_error}"
        )

@router.post("/summarize")
async def summarize_with_gemini(
    content: str,
    topic_id: Optional[str] = None
):
    """Gera um resumo usando Gemini API"""
    prompt = f"Por favor, crie um resumo conciso e bem estruturado do seguinte conteúdo:\n\n{content}"
    req = GeminiRequest(prompt=prompt, topic_id=topic_id)
    return await generate_with_gemini(req)

