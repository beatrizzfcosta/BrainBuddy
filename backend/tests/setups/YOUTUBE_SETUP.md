# Configuração da YouTube API

Este documento explica como configurar e usar a integração com a YouTube Data API v3 no backend do BrainBuddy.

## Índice

- [O que é a YouTube API](#o-que-é-a-youtube-api)
- [Pré-requisitos](#pré-requisitos)
- [Como Obter a API Key](#como-obter-a-api-key)
- [Configuração](#configuração)
- [Endpoints Disponíveis](#endpoints-disponíveis)
- [Exemplos de Uso](#exemplos-de-uso)
- [Troubleshooting](#troubleshooting)

---

## O que é a YouTube API

A **YouTube Data API v3** permite buscar vídeos, canais e playlists, além de recuperar detalhes de conteúdos públicos.

No BrainBuddy, ela é usada para:

- Pesquisar vídeos relevantes com base no título do tópico  
- Criar YouTubeSuggestions automaticamente  
- Recomendar conteúdo de estudo ao utilizador  

---

## Pré-requisitos

- Conta Google  
- Projeto criado no Google Cloud  
- YouTube Data API v3 ativada  
- API Key configurada no `.env`  
- Backend do BrainBudy a rodar  

---

## Como Obter a API Key

### Passo 1: Acessar o Google Cloud Console

1. Acesse: https://console.cloud.google.com/apis/credentials  
2. Clique em "Create Credentials"  
3. Escolha "API Key"  
4. Copie a chave gerada  

### Passo 2: Ativar a YouTube Data API v3

1. Vá para: https://console.cloud.google.com/apis/library  
2. Busque por "YouTube Data API v3"  
3. Clique em "Enable"  

---

## Configuração

Crie ou edite o arquivo `.env`:

YOUTUBE_API_KEY=sua-api-key

### Linux/macOS:
export YOUTUBE_API_KEY="sua-api-key"

### Windows:
$env:YOUTUBE_API_KEY="sua-api-key"

---

## Endpoints Disponíveis

A API do YouTube está disponível em:  
http://localhost:8000/api/youtube

### 1. GET /search

Realiza uma busca no YouTube.

Parâmetros:

- query: texto da busca  
- max_results: quantidade de vídeos  

Exemplo de requisição:
/search?query=python&max_results=5

Exemplo de retorno:

```bash
{
"query": "python",
"results": [
{
"title": "Curso de Python",
"url": "https://www.youtube.com/watch?v=XYZ"
}
]
}
```
---

## YouTubeSuggestions

Base:  
http://localhost:8000/api/youtube-suggestions

### 2. GET /suggest?topicId=XYZ

Busca um vídeo relacionado ao título do tópico e salva como sugestão.

Retorno:

```bash
{
"title": "...",
"url": "...",
"topicId": "XYZ"
}
```

### 3. GET /topic/{topic_id}

Lista todas as sugestões de um tópico.

### 4. GET /{suggestion_id}

Busca uma sugestão específica.

### 5. DELETE /{suggestion_id}

Remove uma sugestão salva.

---

## Exemplos de Uso

### Exemplo 1: Usando python

```bash
import httpx
async def run():
async with httpx.AsyncClient() as client:
r = await client.get("http://localhost:8000/api/youtube/search", params={"query": "machine learning"})
print(r.json())
```

### Exemplo 2: Fluxo das sugestões

topic.title → busca no YouTube → salva no Firestore → retorna suggestion  

---

## Troubleshooting

### Erro: "YOUTUBE_API_KEY não configurado"  
**Solução:** verifique o `.env` e reinicie o servidor.

### Erro: "quotaExceeded"  
**Causa:** limite diário da API foi atingido.  
**Solução:** ativar billing ou reduzir requisições.

### Erro: "Erro ao inicializar cliente do YouTube"  
**Causa:** chave inválida.  
**Solução:** regenerar a API Key.

### Nenhum vídeo encontrado  
**Solução:** tente um termo mais específico.




