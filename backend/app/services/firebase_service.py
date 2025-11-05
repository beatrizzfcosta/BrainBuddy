"""
Serviço Firebase para o backend BrainBudy.
Inicializa o Firebase Admin SDK e fornece acesso ao Firestore.
"""
import firebase_admin
from firebase_admin import credentials, firestore
import os
from pathlib import Path

# Caminho para o arquivo de credenciais
BASE_DIR = Path(__file__).resolve().parent.parent.parent
CREDENTIALS_PATH = BASE_DIR / "firebase-service-account.json"

# Inicializar Firebase Admin apenas uma vez
if not firebase_admin._apps:
    if CREDENTIALS_PATH.exists():
        cred = credentials.Certificate(str(CREDENTIALS_PATH))
        firebase_admin.initialize_app(cred)
    else:
        raise FileNotFoundError(
            f"Arquivo de credenciais não encontrado em: {CREDENTIALS_PATH}\n"
            f"Por favor, baixe o arquivo firebase-service-account.json do Firebase Console\n"
            f"e coloque-o na pasta backend/"
        )

# Inicializar serviços
db = firestore.client()

__all__ = ['db']

