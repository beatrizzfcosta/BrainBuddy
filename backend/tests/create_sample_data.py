"""
Script para criar dados de exemplo no Firestore
Execute este script para popular o banco de dados com dados de teste
"""
from app.services.user_service import UserService
from app.services.subject_service import SubjectService
from app.services.topic_service import TopicService
from app.services.slide_service import SlideService
from app.services.note_service import NoteService
from app.services.ai_request_service import AIRequestService
from app.services.study_session_service import StudySessionService
from app.services.youtube_suggestion_service import YouTubeSuggestionService
from app.models.user import UserCreate
from app.models.subject import SubjectCreate
from app.models.topic import TopicCreate
from app.models.slide import SlideCreate
from app.models.note import NoteCreate, NoteSource
from app.models.ai_request import AIRequestCreate, AIStatus
from app.models.study_session import StudySessionCreate, SessionState
from app.models.youtube_suggestion import YouTubeSuggestionCreate
from datetime import datetime, timedelta

def create_sample_data():
    """Cria dados de exemplo no Firestore"""
    print("🚀 Iniciando criação de dados de exemplo...\n")
    
    try:
        # 1. Criar usuário
        print("1. Criando usuário...")
        user = UserService.create_user(UserCreate(
            name="João Silva",
            email="joao.silva@example.com",
            googleCalendarConnected=False
        ))
        print(f"Utilizador criado: {user.userId} - {user.name}\n")
        
        # 2. Criar subject
        print("2. Criando subject...")
        subject = SubjectService.create_subject(SubjectCreate(
            userId=user.userId,
            name="Matemática",
            description="Disciplina de matemática aplicada"
        ))
        print(f"Subject criado: {subject.subjectId} - {subject.name}\n")
        
        # 3. Criar topic
        print("3. Criando topic...")
        topic = TopicService.create_topic(TopicCreate(
            subjectId=subject.subjectId,
            title="Álgebra Linear",
            description="Vetores, matrizes e transformações lineares"
        ))
        print(f"Topic criado: {topic.topicId} - {topic.title}\n")
        
        # 4. Criar slide
        print("4. Criando slide...")
        slide = SlideService.create_slide(SlideCreate(
            topicId=topic.topicId,
            fileName="algebra_linear_aula1.pdf",
            fileUrl="https://storage.googleapis.com/brainbudy/slides/algebra_linear_aula1.pdf"
        ))
        print(f"Slide criado: {slide.slideId} - {slide.fileName}\n")
        
        # 5. Criar note
        print("5. Criando note...")
        note = NoteService.create_note(NoteCreate(
            topicId=topic.topicId,
            content="Vetores são objetos matemáticos que possuem magnitude e direção.",
            source=NoteSource.MANUAL
        ))
        print(f"Note criada: {note.noteId}\n")
        
        # 6. Criar AI Request
        print("6. Criando AI request...")
        ai_request = AIRequestService.create_ai_request(AIRequestCreate(
            userId=user.userId,
            topicId=topic.topicId,
            slideId=slide.slideId,
            prompt="Explique o conceito de vetores de forma simples"
        ))
        print(f"AI Request criado: {ai_request.requestId}\n")
        
        # Atualizar AI Request com resposta simulada
        from app.models.ai_request import AIRequestUpdate
        AIRequestService.update_ai_request(ai_request.requestId, AIRequestUpdate(
            response="Vetores são representações matemáticas que possuem tanto magnitude quanto direção. Eles são fundamentais em álgebra linear e podem ser representados graficamente como setas.",
            status=AIStatus.COMPLETED
        ))
        print("AI Request atualizado com resposta\n")
        
        # 7. Criar Study Session
        print("7. Criando study session...")
        start_time = datetime.utcnow() + timedelta(days=1)
        end_time = start_time + timedelta(hours=2)
        study_session = StudySessionService.create_study_session(StudySessionCreate(
            userId=user.userId,
            topicId=topic.topicId,
            requestId=ai_request.requestId,
            startTime=start_time,
            endTime=end_time,
            numberSessions=1
        ))
        print(f"Study Session criada: {study_session.sessionId}\n")
        
        # 8. Criar YouTube Suggestion
        print("8. Criando YouTube suggestion...")
        youtube_suggestion = YouTubeSuggestionService.create_youtube_suggestion(
            YouTubeSuggestionCreate(
                topicId=topic.topicId,
                title="Álgebra Linear - Introdução aos Vetores",
                url="https://www.youtube.com/watch?v=example123"
            )
        )
        print(f"YouTube Suggestion criada: {youtube_suggestion.suggestionId}\n")
        
        print("=" * 50)
        print("Dados de exemplo criados com sucesso!")
        print("=" * 50)
        print("\nResumo dos dados criados:")
        print(f"   - Utilizador: {user.name} ({user.email})")
        print(f"   - Subject: {subject.name}")
        print(f"   - Topic: {topic.title}")
        print(f"   - Slide: {slide.fileName}")
        print(f"   - Note: {len(note.content)} caracteres")
        print(f"   - AI Request: {ai_request.status}")
        print(f"   - Study Session: {study_session.state}")
        print(f"   - YouTube Suggestion: {youtube_suggestion.title}")
        print("\nAgora pode verificar os dados no Firebase Console!")
        print("   Acesse: https://console.firebase.google.com/")
        print("   Vá em Firestore Database e verifique as coleções criadas.")
        
    except Exception as e:
        print(f"\nErro ao criar dados: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    create_sample_data()

