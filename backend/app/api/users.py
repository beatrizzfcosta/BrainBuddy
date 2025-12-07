"""
Rotas para gerenciamento de Users
"""
from fastapi import APIRouter, HTTPException, status
from app.models.user import User, UserCreate, UserUpdate
from app.services.user_service import UserService
from typing import List

router = APIRouter()


@router.post("/", response_model=User, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate):
    """Cria um novo usuário"""
    try:
        return UserService.create_user(user)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar usuário: {str(e)}"
        )


@router.get("/{user_id}", response_model=User)
async def get_user(user_id: str):
    """Busca um usuário por ID"""
    user = UserService.get_user(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    return user


@router.get("/email/{email}", response_model=User)
async def get_user_by_email(email: str):
    """Busca um usuário por email"""
    user = UserService.get_user_by_email(email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    return user


@router.put("/{user_id}", response_model=User)
async def update_user(user_id: str, user: UserUpdate):
    """Atualiza um usuário"""
    updated_user = UserService.update_user(user_id, user)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    return updated_user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: str):
    """Deleta um usuário"""
    user = UserService.get_user(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    UserService.delete_user(user_id)
    return None


@router.get("/", response_model=List[User])
async def list_users():
    """Lista todos os usuários"""
    return UserService.list_users()


@router.get("/{user_id}/access-token")
async def get_user_access_token(user_id: str):
    """Obtém o access_token do Google Calendar do usuário, fazendo refresh se necessário"""
    from app.services.firebase_service import db
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request
    import os
    
    doc = db.collection("users").document(user_id).get()
    if not doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    data = doc.to_dict()
    google_tokens = data.get("googleTokens", {})
    access_token = google_tokens.get("access_token")
    refresh_token = google_tokens.get("refresh_token")
    
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Access token não encontrado. O usuário precisa fazer login novamente."
        )
    
    # Verificar se o token expirou e fazer refresh se necessário
    expiry_str = google_tokens.get("expiry")
    needs_refresh = False
    
    if expiry_str:
        from datetime import datetime, timezone
        try:
            expiry = datetime.fromisoformat(expiry_str.replace('Z', '+00:00'))
            if expiry < datetime.now(timezone.utc):
                needs_refresh = True
        except Exception:
            pass
    
    # Se o token expirou e temos refresh_token, fazer refresh
    if needs_refresh and refresh_token:
        try:
            GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
            GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
            
            credentials = Credentials(
                token=None,
                refresh_token=refresh_token,
                token_uri="https://oauth2.googleapis.com/token",
                client_id=GOOGLE_CLIENT_ID,
                client_secret=GOOGLE_CLIENT_SECRET
            )
            
            credentials.refresh(Request())
            
            # Atualizar tokens no Firebase
            updated_tokens = {
                "access_token": credentials.token,
                "refresh_token": credentials.refresh_token or refresh_token,
                "expiry": credentials.expiry.isoformat() if credentials.expiry else None,
            }
            
            doc.reference.update({"googleTokens": updated_tokens})
            
            access_token = credentials.token
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Erro ao fazer refresh do token: {str(e)}. O usuário precisa fazer login novamente."
            )
    elif needs_refresh:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token expirado e refresh token não disponível. O usuário precisa fazer login novamente."
        )
    
    return {"access_token": access_token}

