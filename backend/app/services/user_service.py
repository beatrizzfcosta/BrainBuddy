"""
Serviço para operações CRUD de User no Firestore
"""
from app.services.firebase_service import db
from app.models.user import User, UserCreate, UserUpdate
from datetime import datetime
from typing import Optional, List
from google.cloud.firestore_v1 import FieldFilter


class UserService:
    """
    Serviço para operações CRUD de usuários no Firestore
    
    Gerencia todas as operações relacionadas a usuários, incluindo criação,
    busca, atualização e listagem. Verifica duplicatas por email antes de criar.
    
    Attributes:
        COLLECTION: Nome da coleção no Firestore ("users")
    """
    COLLECTION = "users"

    @staticmethod
    def create_user(user_data: UserCreate) -> User:
        """
        Cria um novo usuário no Firestore
        
        Verifica se já existe um usuário com o mesmo email. Se existir,
        retorna o usuário existente. Caso contrário, cria um novo.
        
        Args:
            user_data: Dados do usuário a ser criado (UserCreate)
        
        Returns:
            User: Usuário criado ou existente (com userId atribuído)
        
        Note:
            O campo `createdAt` é automaticamente adicionado com a data/hora atual
        """
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
        """
        Busca um usuário por ID no Firestore
        
        Args:
            user_id: ID único do usuário no Firestore
        
        Returns:
            Optional[User]: Dados do usuário se encontrado, None caso contrário
        """
        doc = db.collection(UserService.COLLECTION).document(user_id).get()
        if doc.exists:
            data = doc.to_dict()
            return User(userId=doc.id, **data)
        return None

    @staticmethod
    def get_user_by_email(email: str) -> Optional[User]:
        """
        Busca um usuário por email no Firestore
        
        Args:
            email: Email do usuário a ser buscado
        
        Returns:
            Optional[User]: Dados do usuário se encontrado, None caso contrário
        
        Note:
            Retorna apenas o primeiro usuário encontrado com o email especificado
        """
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
        """
        Atualiza um usuário existente no Firestore
        
        Atualiza apenas os campos fornecidos em user_data. Se nenhum campo
        for fornecido, retorna o usuário sem modificações.
        
        Args:
            user_id: ID único do usuário a ser atualizado
            user_data: Dados atualizados (UserUpdate) - apenas campos fornecidos serão atualizados
        
        Returns:
            Optional[User]: Usuário atualizado se encontrado, None caso contrário
        """
        update_data = user_data.model_dump(exclude_unset=True)
        if not update_data:
            return UserService.get_user(user_id)
        
        doc_ref = db.collection(UserService.COLLECTION).document(user_id)
        doc_ref.update(update_data)
        return UserService.get_user(user_id)

    @staticmethod
    def delete_user(user_id: str) -> bool:
        """
        Deleta um usuário do Firestore
        
        Args:
            user_id: ID único do usuário a ser deletado
        
        Returns:
            bool: True se a operação foi bem-sucedida
        
        Warning:
            Esta operação é irreversível. Certifique-se de que não há dados
            dependentes antes de deletar um usuário.
        """
        db.collection(UserService.COLLECTION).document(user_id).delete()
        return True

    @staticmethod
    def list_users() -> List[User]:
        """
        Lista todos os usuários cadastrados no Firestore
        
        Returns:
            List[User]: Lista de todos os usuários (pode ser grande - use com cuidado)
        
        Warning:
            Esta operação pode ser custosa se houver muitos usuários.
            Considere implementar paginação para produção.
        """
        docs = db.collection(UserService.COLLECTION).stream()
        return [User(userId=doc.id, **doc.to_dict()) for doc in docs]

