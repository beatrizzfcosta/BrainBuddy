"""
Rotas para gerenciamento de Topics
"""
from fastapi import APIRouter, HTTPException, status, UploadFile, File, Form
from app.models.topic import Topic, TopicCreate, TopicUpdate
from app.models.note import NoteCreate, NoteSource, NoteUpdate
from app.services.topic_service import TopicService
from app.services.note_service import NoteService
from app.api.gemini import generate_with_gemini, GeminiRequest
from typing import List, Optional
import logging

router = APIRouter()


@router.post("/", response_model=Topic, status_code=status.HTTP_201_CREATED)
async def create_topic(
    title: str = Form(...),
    subjectId: str = Form(...),
    description: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    """Cria um novo topic com opção de upload de arquivo .txt e gera conteúdo com IA"""
    try:
        # Se um arquivo foi enviado, ler seu conteúdo
        file_content = None
        if file:
            # Validar extensão do arquivo
            if not file.filename.endswith('.txt'):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Apenas arquivos .txt são permitidos"
                )
            
            # Ler conteúdo do arquivo
            try:
                file_content = await file.read()
                file_content = file_content.decode('utf-8')
                
                # Se não houver descrição, usar conteúdo do arquivo como descrição
                if not description and file_content:
                    description = file_content[:500]  # Limitar a 500 caracteres
            except UnicodeDecodeError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Erro ao ler arquivo. Certifique-se de que o arquivo está em UTF-8"
                )
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Erro ao processar arquivo: {str(e)}"
                )
        
        # Criar objeto TopicCreate
        topic_data = TopicCreate(
            title=title,
            subjectId=subjectId,
            description=description
        )
        
        # Criar o topic
        new_topic = TopicService.create_topic(topic_data)
        
        # Se houver arquivo, gerar conteúdo com IA baseado nas notas
        if file_content:
            try:
                # Criar uma note vazia para o topic
                note_data = NoteCreate(
                    content="",
                    source=NoteSource.AI_GENERATED,
                    topicId=new_topic.topicId
                )
                new_note = NoteService.create_note(note_data)
                
                # Gerar conteúdo com Gemini usando o arquivo como contexto
                prompt = f"Com base nas seguintes notas, crie uma explicação completa, clara e didática sobre: {title}"
                
                gemini_request = GeminiRequest(
                    prompt=prompt,
                    topic_id=new_topic.topicId,
                    context=file_content
                )
                
                # Chamar a API do Gemini
                gemini_response = await generate_with_gemini(gemini_request)
                generated_content = gemini_response.get("response", "")
                
                # Atualizar a note com o conteúdo gerado
                if generated_content:
                    NoteService.update_note(
                        new_note.noteId,
                        NoteUpdate(content=generated_content)
                    )
            except Exception as e:
                # Não falhar a criação do topic se a geração de conteúdo falhar
                # Apenas logar o erro
                logger = logging.getLogger(__name__)
                logger.error(f"Erro ao gerar conteúdo com IA para topic {new_topic.topicId}: {str(e)}")
        
        return new_topic
    except HTTPException:
        raise
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

