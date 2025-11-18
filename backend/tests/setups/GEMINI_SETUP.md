# Configuração do Gemini API

Este documento explica como configurar e usar a integração com o Google Gemini API no backend do BrainBudy.

## Índice

- [O que é o Gemini API](#o-que-é-o-gemini-api)
- [Pré-requisitos](#pré-requisitos)
- [Como Obter a API Key](#como-obter-a-api-key)
- [Configuração](#configuração)
- [Endpoints Disponíveis](#endpoints-disponíveis)
- [Exemplos de Uso](#exemplos-de-uso)
- [Troubleshooting](#troubleshooting)

---

## O que é o Gemini API

O **Google Gemini** é um modelo de linguagem de IA que permite gerar texto e explicações baseadas em contexto. No BrainBudy, ele é usado para:

- Gerar resumos automáticos de conteúdo
- Gerar explicações de conceitos de forma didática

---

## Pré-requisitos

- Conta Google (Gmail)
- Acesso à internet
- Backend do BrainBudy configurado e rodando

---

## Como Obter a API Key

### Passo 1: Acessar o Google AI Studio

1. Acesse: https://makersuite.google.com/app/apikey
   - Ou vá em: https://aistudio.google.com/app/apikey

2. Faça login com sua conta Google

### Passo 2: Criar uma API Key

1. Clique em **"Create API Key"** ou **"Get API Key"**
2. Selecione um projeto Google Cloud (ou crie um novo)
3. Copie a API Key gerada

### Passo 3: Verificar Limites e Quotas

- A API Key gratuita tem limites de requisições
- Verifique os limites em: https://ai.google.dev/pricing
- Para produção, considere configurar billing no Google Cloud

---

## ⚙️ Configuração

### Opção 1: Variável de Ambiente (Recomendado)

#### Linux/macOS:

```bash
# Adicionar ao ~/.bashrc ou ~/.zshrc
export GEMINI_API_KEY="sua-api-key-aqui"
```

Ou criar um arquivo `.env` na pasta `backend/`:

```bash
cd backend
echo "GEMINI_API_KEY=sua-api-key-aqui" > .env
```

#### Windows:

```cmd
# No PowerShell
$env:GEMINI_API_KEY="sua-api-key-aqui"

# Ou criar arquivo .env
echo GEMINI_API_KEY=sua-api-key-aqui > .env
```

### Opção 2: Docker Compose

Se estiver usando Docker, adicione no `docker-compose.yml`:

```yaml
services:
  backend:
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
```

E crie um arquivo `.env` na raiz do projeto:

```env
GEMINI_API_KEY=sua-api-key-aqui
```

---

## Endpoints Disponíveis

A API do Gemini está disponível em: `http://localhost:8000/api/gemini`

### 1. **POST** `/api/gemini/generate`

Gera uma resposta baseada em um prompt.

**Request Body:**
```json
{
  "prompt": "Explique o que são vetores",
  "topic_id": "topic123",
  "slide_id": "slide456",
  "context": "Estamos estudando álgebra linear"
}
```

**Response:**
```json
{
  "response": "Vetores são objetos matemáticos...",
  "prompt": "Explique o que são vetores",
  "topic_id": "topic123",
  "slide_id": "slide456"
}
```

### 2. **POST** `/api/gemini/summarize`

Gera um resumo conciso de um conteúdo.

**Request Body:**
```json
{
  "content": "Texto longo para resumir...",
  "topic_id": "topic123"
}
```

**Response:**
```json
{
  "response": "Resumo do conteúdo...",
  "prompt": "Por favor, crie um resumo...",
  "topic_id": "topic123",
  "slide_id": null
}
```

---

## 💡 Exemplos de Uso

### Exemplo 1: Usando cURL

```bash
# Gerar resposta
curl -X POST "http://localhost:8000/api/gemini/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explique o conceito de derivadas",
    "topic_id": "math_topic_1"
  }'

# Gerar resumo
curl -X POST "http://localhost:8000/api/gemini/summarize" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Texto longo aqui...",
    "topic_id": "topic123"
  }'
```

### Exemplo 2: Usando Python

```python
import httpx

async def test_gemini():
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://localhost:8000/api/gemini/generate",
            json={
                "prompt": "O que é Python?",
                "topic_id": "programming_1"
            }
        )
        print(response.json())
```

### Exemplo 3: Usando a Interface Swagger

1. Inicie o servidor: `uvicorn main:app --reload`
2. Acesse: http://localhost:8000/docs
3. Encontre a seção **"Gemini"**
4. Teste os endpoints diretamente na interface

### Exemplo 4: Integração com Frontend

```javascript
// Exemplo em JavaScript/TypeScript
const response = await fetch('http://localhost:8000/api/gemini/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: 'Explique o conceito de fotossíntese',
    topic_id: 'biology_topic_1',
    context: 'Estamos estudando biologia celular'
  })
});

const data = await response.json();
console.log(data.response);
```

---

## 🔧 Troubleshooting

### Erro: "GEMINI_API_KEY não configurado"

**Causa:** A variável de ambiente não está definida.

**Solução:**
1. Verifique se a variável está definida:
   ```bash
   echo $GEMINI_API_KEY  # Linux/macOS
   echo %GEMINI_API_KEY%  # Windows
   ```

2. Se não estiver, defina-a e reinicie o servidor:
   ```bash
   export GEMINI_API_KEY="sua-chave"
   uvicorn main:app --reload
   ```

### Erro: "Erro ao gerar resposta: 400 Bad Request"

**Causa:** API Key inválida ou prompt muito longo.

**Solução:**
1. Verifique se a API Key está correta
2. Reduza o tamanho do prompt
3. Verifique se a API Key não expirou

### Erro: "Erro ao gerar resposta: 429 Too Many Requests"

**Causa:** Limite de requisições excedido.

**Solução:**
1. Aguarde alguns minutos antes de tentar novamente
2. Verifique seus limites em: https://ai.google.dev/pricing
3. Considere implementar rate limiting no backend

### Erro: "Resposta vazia do Gemini"

**Causa:** O modelo não retornou conteúdo válido.

**Solução:**
1. Tente reformular o prompt
2. Verifique se o conteúdo não viola políticas do Google
3. Adicione mais contexto ao prompt

### A API Key não funciona no Docker

**Solução:**
1. Certifique-se de que o `.env` está na raiz do projeto
2. Verifique se o `docker-compose.yml` está carregando as variáveis:
   ```yaml
   services:
     backend:
       env_file:
         - .env
   ```
3. Reinicie os containers: `docker-compose restart`

---

## Recursos Adicionais

- **Documentação Oficial:** https://ai.google.dev/docs
- **API Reference:** https://ai.google.dev/api
- **Pricing:** https://ai.google.dev/pricing
- **Google AI Studio:** https://aistudio.google.com

---

## Segurança

⚠️ **IMPORTANTE:**

1. **NUNCA** commite a API Key no Git
2. Adicione `.env` ao `.gitignore`
3. Use variáveis de ambiente em produção
4. Rotacione a API Key periodicamente
5. Monitore o uso para detectar abusos

---

## Verificação

Para verificar se está tudo configurado corretamente:

```bash
# 1. Verificar se a variável está definida
echo $GEMINI_API_KEY

# 2. Testar o endpoint
curl -X POST "http://localhost:8000/api/gemini/generate" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Teste"}'
```

Se retornar uma resposta JSON com `"response"`, está funcionando

---

## 📝 Notas

- O modelo usado é `gemini-pro`
- As respostas são geradas de forma assíncrona
- O contexto pode melhorar a qualidade das respostas
- Para produção, considere implementar cache de respostas

---

**Última atualização:** 

