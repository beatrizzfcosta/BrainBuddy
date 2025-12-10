# Configuração do Google OAuth 2.0

Este documento explica como configurar e usar a integração com o Google OAuth 2.0 no backend do BrainBuddy.

## Índice

- [O que é o Google OAuth](#o-que-é-o-google-oauth)
- [Pré-requisitos](#pré-requisitos)
- [Como Criar as Credenciais OAuth](#como-criar-as-credenciais-oauth)
- [Configuração](#configuração)
- [Fluxo de Autenticação](#fluxo-de-autenticação)
- [Endpoints Disponíveis](#endpoints-disponíveis)
- [Exemplos de Uso](#exemplos-de-uso)
- [Troubleshooting](#troubleshooting)

---

## O que é o Google OAuth

O **Google OAuth 2.0** é o sistema de autenticação do Google que permite login seguro e acesso autorizado a APIs como Google Calendar.

No BrainBuddy, ele é usado para:

- Autenticação de utilizadores  
- Integração com Google Calendar  
- Armazenamento de tokens seguros no Firestore  

---

## Pré-requisitos

- Conta Google  
- Projeto configurado no Google Cloud Console  
- Backend do BrainBudy a rodar  
- Variáveis `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`  

---

## Como Criar as Credenciais do OAuth

### Passo 1: Aceder ao Google Cloud Console

1. Link: https://console.cloud.google.com/apis/credentials  
2. Selecione um projeto existente ou crie um novo  

### Passo 2: Criar OAuth Client ID

1. Clique em **Create Credentials**  
2. Selecione **OAuth Client ID**  
3. Tipo: **Web Application** 
4. Adicione as URLs:

**Authorized redirect URIs**  
http://localhost:3000/auth/callback

**Authorized JavaScript origins**  
http://localhost:3000

### Passo 3: Copiar credenciais

- GOOGLE_CLIENT_ID  
- GOOGLE_CLIENT_SECRET  

---

## Configuração

### Opção 1: Arquivo `.env` (Recomendado)

Crie ou edite: 

GOOGLE_CLIENT_ID=seu-client-id
GOOGLE_CLIENT_SECRET=seu-client-secret

### Opção 2: Linux/macOS

export GOOGLE_CLIENT_ID="seu-client-id"
export GOOGLE_CLIENT_SECRET="seu-client-secret"

### Opção 3: Windows

```bash
$env:GOOGLE_CLIENT_ID="seu-client-id"
$env:GOOGLE_CLIENT_SECRET="seu-client-secret"
```

---

## Fluxo de Autenticação

O frontend chama /api/auth/google/login  
O backend gera a URL do Google  
O utilizador seleciona uma conta  
Google redireciona para: http://localhost:3000/auth/callback?code=XYZ  
O backend troca o code por tokens  
Valida o ID Token  
Cria/atualiza utilizador no Firestore  
Retorna com dados do utilizador  

---

## Endpoints Disponíveis

A API do Google OAuth está disponível em:  
http://localhost:8000/api/auth/google

### 1. GET /login

Gera a URL de autenticação Google.
**Exemplo de retorno:**

```bash
{
"url": "https://accounts.google.com/o/oauth2/auth?client_id=..."
}
```

### 2. GET /callback

Recebe o code do Google e autentica o usuário.
**Exemplo de retorno:**

```bash
{
"id": "123",
"user": {
"name": "João",
"email": "joao@gmail.com",
"googleCalendarConnected": true,
"createdAt": "...",
"updatedAt": "...",
"googleTokens": {
"access_token": "...",
"refresh_token": "...",
"expiry": "..."
}

```

---

## Exemplos de Uso

### Exemplo 1: Usando cURL

curl "http://localhost:8000/api/auth/google/login

### Exemplo 2: Frontend

```bash
const login = async () => {
const res = await fetch("http://localhost:8000/api/auth/google/login");
const data = await res.json();
window.location.href = data.url;
};
```

---

## Troubleshooting

### Erro: "invalid_client"  
**Solução:** revise o client_id e client_secret.

### Erro: "redirect_uri_mismatch"  
**Solução:** cadastre exatamente:  
http://localhost:3000/auth/callback

### Refresh token não gerado 
**Causas:**
- Google entrega apenas uma vez  
- Falta de prompt=consent  

Solução:  
Revogar acesso em:  
https://myaccount.google.com/permissions  

### Erro ao validar token  
**Causa:** Token expirado  
**Solução:** Reautenticar  