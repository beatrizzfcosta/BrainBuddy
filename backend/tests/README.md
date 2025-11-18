# Pasta de Testes e Setup

Esta pasta contém arquivos relacionados a testes, setup e documentação do backend.

## Arquivos de Setup

- **GEMINI_SETUP.md** - Guia completo de configuração do Gemini API
- **GOOGLE_CALENDAR_SETUP.md** - Guia completo de configuração do Google Calendar API

## Arquivos de Teste

- **TESTE_CALENDAR.md** - Guia de teste do Google Calendar API
- **TESTE_FIREBASE.md** - Guia de teste do Firebase/Firestore
- **TESTE_GEMINI.md** - Guia de teste do Gemini API
- **test_firebase.py** - Script para testar conexão com Firebase
- **create_sample_data.py** - Script para criar dados de exemplo no Firestore

## Como Usar

### Testar Firebase

```bash
cd backend
source venv/bin/activate
python tests/test_firebase.py
```

### Criar Dados de Exemplo

```bash
cd backend
source venv/bin/activate
python tests/create_sample_data.py
```

### Testar APIs

Consulte os arquivos `TESTE_*.md` para instruções detalhadas sobre como testar cada API.

