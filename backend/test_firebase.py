from app.services.firebase_service import db

def test_connection():
    try:
        # Tentar acessar uma coleção
        test_ref = db.collection('test')
        test_ref.get()
        print("Firebase conectado com sucesso!")
    except Exception as e:
        print(f"Erro: {e}")

if __name__ == "__main__":
    test_connection()