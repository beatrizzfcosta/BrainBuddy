# Como Testar o Google Calendar API

## Pré-requisitos

1. ✅ Google Calendar API habilitada no Google Cloud
2. ✅ OAuth 2.0 configurado (Client ID e Secret)
3. ✅ Variáveis de ambiente configuradas no `.env`
4. ✅ Container reiniciado

---

## Passo 1: Obter um Access Token

O Google Calendar precisa de um **access_token** OAuth. Você tem 2 opções:

### Opção A: Via Google OAuth Playground (Mais Fácil para Testes)

1. **Acesse:** https://developers.google.com/oauthplayground/

2. **No canto superior direito**, clique na engrenagem ⚙️
   - Marque **"Use your own OAuth credentials"**
   - Cole seu **Client ID**
   - Cole seu **Client Secret**
   - Clique em **"Close"**

3. **No painel esquerdo**, encontre **"Calendar API v3"**
   - Expanda a seção
   - Marque:
     - ✅ `https://www.googleapis.com/auth/calendar`
     - ✅ `https://www.googleapis.com/auth/calendar.events`

4. **Clique em "Authorize APIs"**
   - Faça login com sua conta Google
   - Autorize o acesso ao calendário

5. **Clique em "Exchange authorization code for tokens"**
   - Copie o **"Access token"** (válido por 1 hora)

### Opção B: Via OAuth do Backend (quando implementado)

Quando o OAuth estiver implementado, você poderá usar:
```
GET http://localhost:8000/api/oauth/auth
```

---

## Passo 2: Testar os Endpoints

### Método 1: Interface Swagger (Recomendado)

1. **Acesse:** http://localhost:8000/docs

2. **Encontre a seção "Calendar"**

3. **Teste criar um evento:**
   - Clique em `POST /api/calendar/events`
   - Clique em **"Try it out"**
   - Preencha:
     - **access_token**: Cole o token obtido no Passo 1
     - **Request body**:
       ```json
       {
         "summary": "Teste - Sessão de Estudo",
         "description": "Testando integração com Google Calendar",
         "start_time": "2024-11-20T14:00:00",
         "end_time": "2024-11-20T16:00:00",
         "timezone": "Europe/Lisbon"
       }
       ```
   - Clique em **"Execute"**
   - ✅ Se funcionar, você verá um JSON com o `id` do evento criado

4. **Verificar no Google Calendar:**
   - Acesse: https://calendar.google.com/
   - Você deve ver o evento criado!

5. **Teste listar calendários:**
   - Clique em `GET /api/calendar/calendars`
   - Preencha `access_token`
   - Clique em **"Execute"**
   - ✅ Deve retornar lista de calendários

6. **Teste buscar evento:**
   - Use o `id` do evento criado anteriormente
   - Clique em `GET /api/calendar/events/{event_id}`
   - Preencha `access_token` e `event_id`
   - Clique em **"Execute"**

7. **Teste deletar evento:**
   - Clique em `DELETE /api/calendar/events/{event_id}`
   - Preencha `access_token` e `event_id`
   - Clique em **"Execute"**
   - ✅ O evento deve ser removido do Google Calendar

---

### Método 2: Usando cURL

#### 1. Criar Evento

```bash
curl -X POST "http://localhost:8000/api/calendar/events?access_token=SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Sessão de Estudo - Matemática",
    "description": "Estudar álgebra linear",
    "start_time": "2024-11-20T10:00:00",
    "end_time": "2024-11-20T12:00:00",
    "timezone": "Europe/Lisbon"
  }'
```

**Resposta esperada:**
```json
{
  "id": "abc123xyz",
  "summary": "Sessão de Estudo - Matemática",
  "start": {...},
  "end": {...}
}
```

#### 2. Listar Calendários

```bash
curl "http://localhost:8000/api/calendar/calendars?access_token=SEU_TOKEN_AQUI"
```

#### 3. Buscar Evento

```bash
curl "http://localhost:8000/api/calendar/events/EVENT_ID_AQUI?access_token=SEU_TOKEN_AQUI"
```

#### 4. Deletar Evento

```bash
curl -X DELETE "http://localhost:8000/api/calendar/events/EVENT_ID_AQUI?access_token=SEU_TOKEN_AQUI"
```

---

### Método 3: Usando Python

```python
import httpx
import asyncio

async def test_calendar():
    access_token = "SEU_TOKEN_AQUI"
    
    async with httpx.AsyncClient() as client:
        # 1. Criar evento
        response = await client.post(
            "http://localhost:8000/api/calendar/events",
            params={"access_token": access_token},
            json={
                "summary": "Teste Python",
                "description": "Testando via Python",
                "start_time": "2024-11-20T15:00:00",
                "end_time": "2024-11-20T17:00:00",
                "timezone": "Europe/Lisbon"
            }
        )
        print("Criar evento:", response.json())
        event_id = response.json()["id"]
        
        # 2. Buscar evento
        response = await client.get(
            f"http://localhost:8000/api/calendar/events/{event_id}",
            params={"access_token": access_token}
        )
        print("Buscar evento:", response.json())
        
        # 3. Listar calendários
        response = await client.get(
            "http://localhost:8000/api/calendar/calendars",
            params={"access_token": access_token}
        )
        print("Listar calendários:", response.json())
        
        # 4. Deletar evento
        response = await client.delete(
            f"http://localhost:8000/api/calendar/events/{event_id}",
            params={"access_token": access_token}
        )
        print("Deletar evento:", response.json())

# Executar
asyncio.run(test_calendar())
```

---

## Exemplos de Datas e Horas

### Formato ISO 8601 (Recomendado)

```json
{
  "start_time": "2024-11-20T14:00:00",
  "end_time": "2024-11-20T16:00:00",
  "timezone": "Europe/Lisbon"
}
```

### Com Timezone UTC

```json
{
  "start_time": "2024-11-20T14:00:00Z",
  "end_time": "2024-11-20T16:00:00Z",
  "timezone": "UTC"
}
```

### Timezones Comuns

- `Europe/Lisbon` - Portugal
- `Europe/London` - Reino Unido
- `America/Sao_Paulo` - Brasil
- `America/New_York` - EUA (Leste)
- `UTC` - Tempo Universal

---

## Checklist de Teste

- [ ] Obter access_token via OAuth Playground
- [ ] Criar evento via Swagger
- [ ] Verificar evento no Google Calendar
- [ ] Listar calendários
- [ ] Buscar evento criado
- [ ] Deletar evento
- [ ] Verificar que evento foi removido do Google Calendar

---

## Troubleshooting

### Erro: "access_token não fornecido"

**Solução:** Certifique-se de passar o token como query parameter:
```
?access_token=SEU_TOKEN
```

### Erro: "401 Unauthorized"

**Causa:** Token expirado ou inválido.

**Solução:**
1. Obtenha um novo token (tokens expiram após 1 hora)
2. Verifique se o token tem os scopes corretos

### Erro: "403 Forbidden"

**Causa:** API não habilitada ou permissões insuficientes.

**Solução:**
1. Verifique se Google Calendar API está habilitada
2. Verifique se os scopes corretos foram solicitados
3. Verifique se o usuário autorizou o acesso

### Erro: "400 Bad Request" ao criar evento

**Causa:** Formato de data/hora incorreto.

**Solução:**
- Use formato ISO 8601: `YYYY-MM-DDTHH:MM:SS`
- Exemplo: `2024-11-20T14:00:00`

### Evento não aparece no Google Calendar

**Solução:**
1. Verifique se está olhando o calendário correto (geralmente "primary")
2. Verifique o timezone
3. Aguarde alguns segundos (pode haver delay)

---

## Dicas

1. **Tokens expiram rápido:** Tokens OAuth expiram após 1 hora. Para produção, implemente refresh token.

2. **Use timezone correto:** Sempre especifique o timezone correto para evitar confusão de horários.

3. **Teste em horários diferentes:** Teste criar eventos em diferentes horários para garantir que funciona.

4. **Verifique permissões:** Certifique-se de que o usuário autorizou acesso ao calendário.

---

**Pronto para testar!** 🚀

