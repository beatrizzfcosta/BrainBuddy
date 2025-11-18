"""
Backend BrainBudy - FastAPI Application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Criar instância da aplicação FastAPI
app = FastAPI(
    title="BrainBudy API",
    description="API para o sistema de gestão de estudos BrainBudy",
    version="1.0.0"
)

# Configurar CORS para permitir requisições do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://frontend:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rota de health check
@app.get("/")
async def root():
    """Rota raiz - health check"""
    return {
        "message": "BrainBudy API está funcionando!",
        "status": "ok",
        "version": "1.0.0"
    }

@app.get("/health")
async def health():
    """Endpoint de health check"""
    return {"status": "healthy"}

# Importar e incluir rotas da API
from app.api import (
    users, subjects, topics, slides, notes,
    ai_requests, study_sessions,
    youtube_suggestions, 
    # oauth,  # TODO: Será implementado por outra pessoa
    youtube,  
    calendar, gemini
)

# Rotas de entidades principais
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(subjects.router, prefix="/api/subjects", tags=["Subjects"])
app.include_router(topics.router, prefix="/api/topics", tags=["Topics"])
app.include_router(slides.router, prefix="/api/slides", tags=["Slides"])
app.include_router(notes.router, prefix="/api/notes", tags=["Notes"])
app.include_router(ai_requests.router, prefix="/api/ai-requests", tags=["AI Requests"])
app.include_router(study_sessions.router, prefix="/api/study-sessions", tags=["Study Sessions"])
app.include_router(youtube_suggestions.router, prefix="/api/youtube-suggestions", tags=["YouTube Suggestions"])
app.include_router(youtube.router, prefix="/api/youtube", tags=["YouTube"])


# Rotas de integração com serviços externos
app.include_router(youtube.router, prefix="/api/youtube", tags=["YouTube"])
app.include_router(youtube_suggestions.router, prefix="/api/youtube-suggestions", tags=["YouTube Suggestions"])
# app.include_router(oauth.router, prefix="/api/oauth", tags=["OAuth"])
app.include_router(calendar.router, prefix="/api/calendar", tags=["Calendar"])
app.include_router(gemini.router, prefix="/api/gemini", tags=["Gemini"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

