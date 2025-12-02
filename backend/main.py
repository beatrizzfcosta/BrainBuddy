"""
Backend BrainBudy - FastAPI Application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

#Carregar variáveis de ambiente
load_dotenv()

#Criar instância do FastAPI
app = FastAPI(
    title="BrainBudy API",
    description="API para o sistema de gestão de estudos BrainBudy",
    version="1.0.0"
)

#CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#Importar rotas após criar o app
from app.api import (
    users, subjects, topics, slides, notes,
    ai_requests, study_sessions, youtube_suggestions,
    youtube, calendar, gemini, oauth
)

@app.get("/")
async def root():
    return {"message": "BrainBudy API está funcionando!", "status": "ok"}

#Registar rotas principais
app.include_router(users.router, prefix="/api/users")
app.include_router(subjects.router, prefix="/api/subjects")
app.include_router(topics.router, prefix="/api/topics")
app.include_router(slides.router, prefix="/api/slides")
app.include_router(notes.router, prefix="/api/notes")
app.include_router(ai_requests.router, prefix="/api/ai-requests")
app.include_router(study_sessions.router, prefix="/api/study-sessions")
app.include_router(youtube_suggestions.router, prefix="/api/youtube-suggestions")
app.include_router(youtube.router, prefix="/api/youtube")
app.include_router(calendar.router, prefix="/api/calendar")
app.include_router(gemini.router, prefix="/api/gemini")

# Registar OAuth
app.include_router(oauth.router, prefix="/oauth", tags=["OAuth"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
