"""
Serviço para operações CRUD de User no Firestore
"""
from app.services.firebase_service import db
from app.models.user import User, UserCreate, UserUpdate
from datetime import datetime
from typing import Optional, List
from google.cloud.firestore_v1 import FieldFilter


class UserService:
    COLLECTION = "users"

    @staticmethod
    def create_user(user_data: UserCreate) -> User:
        """Cria um novo usuário"""
        user_dict = user_data.model_dump()
        user_dict["createdAt"] = datetime.utcnow()
        
        # Verificar se já existe usuário com esse email
        existing = db.collection(UserService.COLLECTION).where(
            filter=FieldFilter("email", "==", user_data.email)
        ).limit(1).get()
        
        if existing:
            # Retornar usuário existente
            doc = existing[0]
            return User(userId=doc.id, **doc.to_dict())
        
        # Criar novo usuário
        doc_ref = db.collection(UserService.COLLECTION).add(user_dict)
        user_dict["userId"] = doc_ref[1].id
        return User(**user_dict)

    @staticmethod
    def get_user(user_id: str) -> Optional[User]:
        """Busca um usuário por ID"""
        doc = db.collection(UserService.COLLECTION).document(user_id).get()
        if doc.exists:
            data = doc.to_dict()
            return User(userId=doc.id, **data)
        return None

    @staticmethod
    def get_user_by_email(email: str) -> Optional[User]:
        """Busca um usuário por email"""
        docs = db.collection(UserService.COLLECTION).where(
            filter=FieldFilter("email", "==", email)
        ).limit(1).get()
        
        if docs:
            doc = docs[0]
            data = doc.to_dict()
            return User(userId=doc.id, **data)
        return None

    @staticmethod
    def update_user(user_id: str, user_data: UserUpdate) -> Optional[User]:
        """Atualiza um usuário"""
        update_data = user_data.model_dump(exclude_unset=True)
        if not update_data:
            return UserService.get_user(user_id)
        
        doc_ref = db.collection(UserService.COLLECTION).document(user_id)
        doc_ref.update(update_data)
        return UserService.get_user(user_id)

    @staticmethod
    def delete_user(user_id: str) -> bool:
        """Deleta um usuário"""
        db.collection(UserService.COLLECTION).document(user_id).delete()
        return True

    @staticmethod
    def list_users() -> List[User]:
        """Lista todos os usuários"""
        docs = db.collection(UserService.COLLECTION).stream()
        return [User(userId=doc.id, **doc.to_dict()) for doc in docs]

