<div align="center">

# 🧠 BrainBuddy

**Empower safer browsing with transparent, explainable URL analysis**

[![Last commit](https://img.shields.io/github/last-commit/beatrizzfcosta/BrainBuddy?style=for-the-badge)](https://github.com/beatrizzfcosta/BrainBuddy/commits)
[![Top language](https://img.shields.io/github/languages/top/beatrizzfcosta/BrainBuddy?style=for-the-badge)](https://github.com/beatrizzfcosta/BrainBuddy)
[![Languages](https://img.shields.io/github/languages/count/beatrizzfcosta/BrainBuddy?style=for-the-badge)](https://github.com/beatrizzfcosta/BrainBuddy)
[![License](https://img.shields.io/github/license/beatrizzfcosta/BrainBdudy?style=for-the-badge)](LICENSE)
[![Issues](https://img.shields.io/github/issues/beatrizzfcosta/BrainBuddy?style=for-the-badge)](https://github.com/beatrizzfcosta/BrainBuddy/issues)
[![Stars](https://img.shields.io/github/stars/beatrizzfcosta/BrainBuddy?style=for-the-badge)](https://github.com/beatrizzfcosta/BrainBuddy/stargazers)

<br/>

**Built with the tools and technologies:**

<img alt="API Integration" src="https://img.shields.io/badge/API_Integration-FF6F00?logo=api&logoColor=white&style=for-the-badge">
<img alt="YouTube API" src="https://img.shields.io/badge/YouTube_API-FF0000?logo=youtube&logoColor=white&style=for-the-badge">
<img alt="Gemini API" src="https://img.shields.io/badge/Gemini_API-4285F4?logo=google&logoColor=white&style=for-the-badge">
<img alt="Google Calendar API" src="https://img.shields.io/badge/Google_Calendar_API-4285F4?logo=googlecalendar&logoColor=white&style=for-the-badge">
<img alt="Google Cloud" src="https://img.shields.io/badge/Google_Cloud-4285F4?logo=googlecloud&logoColor=white&style=for-the-badge">
<img alt="OAuth 2.0" src="https://img.shields.io/badge/OAuth_2.0-3C3C3D?logo=oauth&logoColor=white&style=for-the-badge">
<img alt="JSON" src="https://img.shields.io/badge/JSON-000000?logo=json&logoColor=white&style=for-the-badge">
<img alt="HTTP Requests" src="https://img.shields.io/badge/HTTP_Requests-005571?logo=httpie&logoColor=white&style=for-the-badge">
<img alt="REST API" src="https://img.shields.io/badge/REST_API-02569B?logo=rest&logoColor=white&style=for-the-badge">


</div>

---

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Getting Started](#getting-started)
- [Conceitos e Tecnologias](#conceitos-e-tecnologias)
- [API](#api)
- [Risk Score](#risk-score)
- [License](#license)

---

## Getting Started

### Frontend (Next.js)

1. **Instalar dependências:**
```bash
cd frontend
npm install
```

2. **Rodar em modo desenvolvimento:**
```bash
npm run dev
```

O frontend estará disponível em: **http://localhost:3000**

### Backend (FastAPI)

1. **Criar ambiente virtual:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate
```

2. **Instalar dependências:**
```bash
pip install -r requirements.txt
```

3. **Rodar o servidor:**
```bash
uvicorn main:app --reload
```

O backend estará disponível em: **http://localhost:8000**

**Documentação da API:** http://localhost:8000/docs

---

## Conceitos e Tecnologias

Esta secção explica os conceitos e tecnologias utilizadas no projeto, que serão adicionados ao longo do desenvolvimento.

### Uvicorn

O **Uvicorn** é um servidor ASGI (Asynchronous Server Gateway Interface) para aplicações Python. Ele é responsável por executar a aplicação FastAPI, recebendo pedidos HTTP e enviando respostas. O parâmetro `--reload` permite recarregar automaticamente o servidor quando há alterações no código, facilitando o desenvolvimento.

