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

