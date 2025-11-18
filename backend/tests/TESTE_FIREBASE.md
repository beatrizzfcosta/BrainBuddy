# Como Testar e Ver Dados no Firebase

## Pré-requisitos

1. arquivo `firebase-service-account.json` na pasta `backend/`
2. Dependências instaladas (`pip install -r requirements.txt`)

## Opção 1: Criar Dados de Exemplo (Recomendado)

Execute o script que cria dados de exemplo:

```bash
cd backend
python create_sample_data.py
```

Este script irá criar:
- 1 Usuário
- 1 Subject (Matemática)
- 1 Topic (Álgebra Linear)
- 1 Slide
- 1 Note
- 1 AI Request
- 1 Study Session
- 1 YouTube Suggestion

## Opção 2: Usar a API REST

### 1. Iniciar o servidor:

```bash
cd backend
uvicorn main:app --reload
```

### 2. Acessar a documentação interativa:

Abra no navegador: http://localhost:8000/docs

### 3. Criar dados via API:

**Criar um usuário:**
```bash
curl -X POST "http://localhost:8000/api/users/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Santos",
    "email": "maria@example.com",
    "googleCalendarConnected": false
  }'
```

**Criar um subject:**
```bash
curl -X POST "http://localhost:8000/api/subjects/" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "ID_DO_USUARIO_AQUI",
    "name": "Física",
    "description": "Disciplina de física"
  }'
```

## Verificar Dados no Firebase Console

1. Acesse: https://console.firebase.google.com/
2. Selecione seu projeto
3. Vá em **Firestore Database**
4. Você verá as seguintes coleções:
   - `users`
   - `subjects`
   - `topics`
   - `slides`
   - `notes`
   - `ai_requests`
   - `study_sessions`
   - `youtube_suggestions`

## Estrutura dos Dados

### Coleção: `users`
- `userId` (ID do documento)
- `name`
- `email`
- `googleCalendarConnected`
- `createdAt`

### Coleção: `subjects`
- `subjectId` (ID do documento)
- `userId`
- `name`
- `description`
- `createdAt`

### Coleção: `topics`
- `topicId` (ID do documento)
- `subjectId`
- `title`
- `description`

### Coleção: `slides`
- `slideId` (ID do documento)
- `topicId`
- `fileName`
- `fileUrl`
- `createdAt`
- `uploadedAt`

### Coleção: `notes`
- `noteId` (ID do documento)
- `topicId`
- `content`
- `source` (manual, AI-generated, extracted from slide)
- `createdAt`

### Coleção: `ai_requests`
- `requestId` (ID do documento)
- `userId`
- `topicId`
- `slideId` (opcional)
- `prompt`
- `response`
- `status` (pending, completed, failed)
- `createdAt`

### Coleção: `study_sessions`
- `sessionId` (ID do documento)
- `userId`
- `topicId`
- `requestId` (opcional)
- `startTime`
- `endTime`
- `calendarEvent`
- `numberSessions`
- `state` (scheduled, in progress, completed, missed)

### Coleção: `youtube_suggestions`
- `suggestionId` (ID do documento)
- `topicId`
- `title`
- `url`

## Testar Conexão

Para apenas testar se a conexão está funcionando:

```bash
cd backend
python test_firebase.py
```

Se aparecer "Firebase conectado com sucesso!", ta tudo certo

