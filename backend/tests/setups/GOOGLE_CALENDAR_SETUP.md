# Configuração do Google Calendar API

Este documento explica como configurar e usar a integração com o Google Calendar API no backend do BrainBudy.

## Índice

- [O que é o Google Calendar API](#o-que-é-o-google-calendar-api)
- [Pré-requisitos](#pré-requisitos)
- [Como Configurar](#como-configurar)
- [Endpoints Disponíveis](#endpoints-disponíveis)
- [Exemplos de Uso](#exemplos-de-uso)
- [Integração com Study Sessions](#integração-com-study-sessions)
- [Troubleshooting](#troubleshooting)

---

## O que é o Google Calendar API

O **Google Calendar API** permite criar, ler, atualizar e deletar eventos no Google Calendar. No BrainBudy, ele é usado para:

- Criar eventos de estudo automaticamente
- Sincronizar sessões de estudo com o calendário do utilizador
- Gerenciar eventos de estudo criados pela IA

---

## Pré-requisitos

- Conta Google (Gmail)
- Projeto no Google Cloud Platform
- Backend do BrainBudy configurado e rodando
- OAuth configurado (necessário para obter access_token)

---

## Como Configurar

### Passo 1: Criar Projeto no Google Cloud Platform

1. Acesse: https://console.cloud.google.com/
2. Faça login com sua conta Google
3. Clique em **"Select a project"** → **"New Project"**
4. Preencha:
   - **Project name**: BrainBudy (ou outro nome)
   - **Organization**: Deixe em branco (se não tiver)
   - **Location**: Deixe em branco
5. Clique em **"Create"**

### Passo 2: Habilitar Google Calendar API

1. No Google Cloud Console, vá em **"APIs & Services"** → **"Library"**
2. Busque por **"Google Calendar API"**
3. Clique no resultado
4. Clique em **"Enable"** (Habilitar)

### Passo 3: Configurar OAuth Consent Screen

1. Vá em **"APIs & Services"** → **"OAuth consent screen"**
2. Selecione **"External"** (para desenvolvimento) ou **"Internal"** (se for organização Google Workspace)
3. Clique em **"Create"**
4. Preencha:
   - **App name**: BrainBudy
   - **User support email**: Seu email
   - **Developer contact information**: Seu email
5. Clique em **"Save and Continue"**
6. Em **"Scopes"**, clique em **"Add or Remove Scopes"**
7. Adicione os seguintes scopes:
   - `https://www.googleapis.com/auth/calendar` (acesso completo ao calendário)
   - `https://www.googleapis.com/auth/calendar.events` (acesso a eventos)
8. Clique em **"Update"** → **"Save and Continue"**
9. Em **"Test users"** (se External), adicione emails de teste
10. Clique em **"Save and Continue"** → **"Back to Dashboard"**

### Passo 4: Criar Credenciais OAuth 2.0

1. Vá em **"APIs & Services"** → **"Credentials"**
2. Clique em **"Create Credentials"** → **"OAuth client ID"**
3. Selecione **"Web application"**
4. Preencha:
   - **Name**: BrainBudy Web Client
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (frontend local)
     - `http://localhost:8000` (backend local, se necessário)
   - **Authorized redirect URIs**:
     - `http://localhost:8000/api/oauth/callback` (backend)
     - `http://localhost:3000/api/oauth/callback` (frontend, se aplicável)
5. Clique em **"Create"**
6. **IMPORTANTE**: Copie o **Client ID** e **Client Secret**
   - Guarde em local seguro!

### Passo 5: Configurar Variáveis de Ambiente

Adicione ao arquivo `.env` na raiz do projeto:

### Passo 6: Configurar Docker Compose (se usar Docker)

Adicione ao `docker-compose.yml`:

```yaml
services:
  backend:
    environment:
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - GOOGLE_REDIRECT_URI=${GOOGLE_REDIRECT_URI}
```

---

## Endpoints Disponíveis

A API do Calendar está disponível em: `http://localhost:8000/api/calendar`

### 1. **POST** `/api/calendar/events`

Cria um evento no Google Calendar.

**Request Body:**
```json
{
  "summary": "Sessão de Estudo - Álgebra Linear",
  "description": "Estudar vetores e matrizes",
  "start_time": "2024-11-15T10:00:00",
  "end_time": "2024-11-15T12:00:00",
  "timezone": "Europe/Lisbon"
}
```

**Query Parameter:**
- `access_token` (obrigatório): Token OAuth do usuário

**Response:**
```json
{
  "id": "event_id_123",
  "summary": "Sessão de Estudo - Álgebra Linear",
  "start": {
    "dateTime": "2024-11-15T10:00:00+00:00",
    "timeZone": "Europe/Lisbon"
  },
  "end": {
    "dateTime": "2024-11-15T12:00:00+00:00",
    "timeZone": "Europe/Lisbon"
  }
}
```

### 2. **GET** `/api/calendar/events/{event_id}`

Busca um evento específico.

**Query Parameter:**
- `access_token` (obrigatório): Token OAuth do usuário

### 3. **DELETE** `/api/calendar/events/{event_id}`

Deleta um evento.

**Query Parameter:**
- `access_token` (obrigatório): Token OAuth do usuário

### 4. **GET** `/api/calendar/calendars`

Lista todos os calendários do usuário.

**Query Parameter:**
- `access_token` (obrigatório): Token OAuth do usuário

---

## Exemplos de Uso

### Exemplo 1: Criar Evento via Swagger

1. Acesse: http://localhost:8000/docs
2. Vá em `POST /api/calendar/events`
3. Clique em **"Try it out"**
4. Preencha:
   - **access_token**: Token OAuth do usuário
   - **Request body**:
     ```json
     {
       "summary": "Estudar Matemática",
       "description": "Revisão de álgebra linear",
       "start_time": "2024-11-20T14:00:00",
       "end_time": "2024-11-20T16:00:00",
       "timezone": "Europe/Lisbon"
     }
     ```
5. Clique em **"Execute"**

### Exemplo 2: Usando cURL

```bash
curl -X POST "http://localhost:8000/api/calendar/events?access_token=SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Sessão de Estudo",
    "description": "Estudar Python",
    "start_time": "2024-11-20T10:00:00",
    "end_time": "2024-11-20T12:00:00",
    "timezone": "Europe/Lisbon"
  }'
```

## Integração com Study Sessions

O Google Calendar pode ser integrado com as Study Sessions do BrainBudy:

### Fluxo de Integração:

1. **Criar Study Session** → Criar evento no Calendar
2. **Atualizar Study Session** → Atualizar evento no Calendar
3. **Deletar Study Session** → Deletar evento no Calendar

### Exemplo de Integração:

```python
# Quando criar uma Study Session, também criar evento no Calendar
from app.services.study_session_service import StudySessionService
from app.api.calendar import create_calendar_event

# Criar study session
session = StudySessionService.create_study_session(session_data)

# Criar evento no calendar
event = await create_calendar_event(
    CalendarEventCreate(
        summary=f"Estudo: {topic.title}",
        description=f"Sessão de estudo sobre {topic.title}",
        start_time=session.startTime,
        end_time=session.endTime,
        timezone="Europe/Lisbon"
    ),
    access_token=user_access_token
)

# Salvar ID do evento na session
StudySessionService.update_study_session(
    session.sessionId,
    {"calendarEvent": event["id"]}
)
```

---

## Troubleshooting

### Erro: "access_token não fornecido"

**Causa:** O token OAuth não foi passado como parâmetro.

**Solução:**
- Certifique-se de passar `access_token` como query parameter
- Verifique se o token não expirou (tokens OAuth expiram após 1 hora)

### Erro: "401 Unauthorized"

**Causa:** Token inválido ou expirado.

**Solução:**
1. Obtenha um novo token via OAuth
2. Verifique se o token tem os scopes corretos:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`

### Erro: "403 Forbidden"

**Causa:** Permissões insuficientes ou API não habilitada.

**Solução:**
1. Verifique se a Google Calendar API está habilitada no projeto
2. Verifique se os scopes corretos foram solicitados no OAuth
3. Verifique se o usuário autorizou o acesso ao calendário

### Erro: "404 Not Found" ao criar evento

**Causa:** URL ou formato de dados incorreto.

**Solução:**
1. Verifique se está usando o formato correto de data/hora (ISO 8601)
2. Verifique se o timezone está correto
3. Verifique se está usando `/calendars/primary/events`

### Como Obter um Access Token

**Opção 1: Via OAuth (quando implementado)**

1. Acesse: `http://localhost:8000/api/oauth/auth`
2. Autorize o acesso
3. Receba o `access_token` no callback

**Opção 2: Via Google OAuth Playground (para testes)**

1. Acesse: https://developers.google.com/oauthplayground/
2. Selecione **"Calendar API v3"**
3. Marque os scopes:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`
4. Clique em **"Authorize APIs"**
5. Faça login e autorize
6. Clique em **"Exchange authorization code for tokens"**
7. Copie o `access_token`

---

## Recursos Adicionais

- **Documentação Oficial:** https://developers.google.com/calendar/api
- **OAuth 2.0 Guide:** https://developers.google.com/identity/protocols/oauth2
- **API Reference:** https://developers.google.com/calendar/api/v3/reference
- **Scopes:** https://developers.google.com/identity/protocols/oauth2/scopes#calendar

---

## Segurança

⚠️ **IMPORTANTE:**

1. **NUNCA** commite credenciais OAuth no Git
2. Adicione `.env` ao `.gitignore`
3. Use variáveis de ambiente em produção
4. Rotacione credenciais periodicamente
5. Monitore o uso da API
6. Tokens OAuth expiram após 1 hora - implemente refresh token

---

## Verificação

Para verificar se está tudo configurado:

```bash
# 1. Verificar se as variáveis estão definidas
echo $GOOGLE_CLIENT_ID
echo $GOOGLE_CLIENT_SECRET

# 2. Testar criar um evento (precisa de access_token)
curl -X POST "http://localhost:8000/api/calendar/events?access_token=SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Teste",
    "start_time": "2024-11-20T10:00:00",
    "end_time": "2024-11-20T11:00:00",
    "timezone": "UTC"
  }'
```

Se retornar um JSON com `"id"` do evento, está funcionando!

---

**Última atualização:**

