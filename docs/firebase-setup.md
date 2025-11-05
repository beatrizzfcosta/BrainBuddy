# Configuração do Firebase - Passo a Passo

Este guia é o passo a passo feito para a configuração do Firebase no projeto BrainBudy, incluindo Firestore e Firebase Storage.

---

## Pré-requisitos

- Conta Google (para acessar o Firebase Console)
- Node.js instalado (para o frontend)
- Python instalado (para o backend)

---

## Passo 1: Criar Projeto no Firebase Console

1. **Acesse o Firebase Console:**
   - Vá para: https://console.firebase.google.com/
   - Fazer login com a conta Google

2. **Criar um novo projeto:**
   - Clicar em "Novo projeto" 
   - Nome do projeto: `brainbudy`
   - Clicar em "Continuar"

3. **Configurar Google Analytics (opcional):**
   - Pode ativar ou desativar o Google Analytics
   - Clicar em "Continuar" e depois em "Criar projeto"

4. **Aguardar a criação:**
   - Aguardar alguns segundos até o projeto ser criado
   - Clicar em "Continuar" quando estiver pronto

---

## Passo 2: Configurar Firestore Database

1. **No menu lateral, clique em "Firestore Database"**
   - clicar em "Criar banco de dados"

2. **Escolher edição**
   - Edição Standard
   - Selecionar uma localização próxima, no `europe-west` 
   - Clicar em ativar

3. **Escolher o modo:**
   - Selecionar "Começar no modo de teste" (para desenvolvimento)
   - **Importante:** Para produção, configurar as regras de segurança adequadas

4. **Regras de segurança (desenvolvimento):**
   - No modo de teste, as regras permitem leitura/escrita por 30 dias
   - Para desenvolvimento, pode usar temporariamente:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.time < timestamp.date(2025, 12, 31);
       }
     }
   }
   ```
   - **Nunca usar essas regras em produção!**

---

## Passo 3: Obter Credenciais do Firebase

### 3.1. Para Frontend (Web App)

1. **No Firebase Console, em "Configurações do projeto" (ícone de engrenagem)**
   - Clicar em "Configurações do projeto"

2. **Rolar até "Seus aplicativos"**
   - Clicar no ícone `</>` (Web) para adicionar um app web

3. **Registrar o app:**
   - Nome do app: `BrainBudy Web`
   - Marcar a opção "Também configure o Firebase Hosting" (opcional)
   - Clicar em "Registrar app"

4. **Copiar as credenciais:**
   -  Objeto JavaScript com suas credenciais:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "brainbudy.firebaseapp.com",
     projectId: "brainbudy",
     storageBucket: "brainbudy.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123..."
   };
   ```
   - **Guardar essas informações!** 

### 3.2. Para Backend (Service Account)

1. **No Firebase Console, vá em "Configurações do projeto"**
   - Clicar na aba "Contas de serviço"

2. **Gerar nova chave privada:**
   - Clicar em "Gerar nova chave privada"
   - Uma confirmação aparecerá, clique em "Gerar chave"
   - Um arquivo JSON será baixado automaticamente
   - **Importante:** Este arquivo contém credenciais sensíveis. **NUNCA** fazer commit dele no Git!

3. **Renomear o arquivo baixado:**
   - Renomear para: `firebase-service-account.json`
   - Mover para a pasta `backend/` (fora do diretório `app/`)

---

## Passo 4: Instalar Dependências

### 4.1. Frontend (Next.js)

```bash
cd frontend
npm install firebase
```

### 4.2. Backend (Python)

```bash
cd backend
source venv/bin/activate  # Se ainda não estiver ativado
pip install firebase-admin
pip freeze > requirements.txt  # Atualizar requirements.txt
```

---

## Passo 5: Configurar Frontend

### 5.1. Criar arquivo de configuração do Firebase

Criar o arquivo `frontend/lib/firebase.ts`:

```typescript
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Inicializar Firebase apenas uma vez
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Inicializar serviços
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export default app;
```

### 5.2. Criar arquivo .env.local

Na pasta `frontend/`, crie o arquivo `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_auth_domain_aqui
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_project_id_aqui
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_storage_bucket_aqui
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id_aqui
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id_aqui
```

**Substitua os valores** pelas credenciais que você do Passo 4.1.

### 5.3. Adicionar .env.local ao .gitignore

Certifique-se de que o arquivo `frontend/.gitignore` contém:

```
.env.local
.env*.local
```

---

## Passo 6: Configurar Backend

### 6.1. Criar arquivo de configuração do Firebase

Crie o arquivo `backend/app/services/firebase_service.py`:

```python
import firebase_admin
from firebase_admin import credentials, firestore, storage
import os
from pathlib import Path

# Caminho para o arquivo de credenciais
BASE_DIR = Path(__file__).resolve().parent.parent.parent
CREDENTIALS_PATH = BASE_DIR / "firebase-service-account.json"

# Inicializar Firebase Admin apenas uma vez
if not firebase_admin._apps:
    if CREDENTIALS_PATH.exists():
        cred = credentials.Certificate(str(CREDENTIALS_PATH))
        firebase_admin.initialize_app(cred)
    else:
        raise FileNotFoundError(
            f"Arquivo de credenciais não encontrado em: {CREDENTIALS_PATH}"
        )

# Inicializar serviços
db = firestore.client()
bucket = storage.bucket()
```

### 7.2. Adicionar firebase-service-account.json ao .gitignore

Crie ou edite o arquivo `backend/.gitignore`:

```
venv/
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
firebase-service-account.json
.env
.env.local
```

---

**FEITO ATÉ AQUI**

## Passo 8: Testar a Configuração

### 8.1. Teste no Frontend

Crie um arquivo de teste `frontend/app/test-firebase/page.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function TestFirebase() {
  const [status, setStatus] = useState('Testando...');

  useEffect(() => {
    async function testConnection() {
      try {
        const testCollection = collection(db, 'test');
        await getDocs(testCollection);
        setStatus('Firebase conectado com sucesso!');
      } catch (error) {
        setStatus(`Erro: ${error}`);
      }
    }
    testConnection();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Teste de Conexão Firebase</h1>
      <p>{status}</p>
    </div>
  );
}
```

Acessar: `http://localhost:3000/test-firebase`

### 8.2. Teste no Backend

Crie um arquivo de teste `backend/test_firebase.py`:

```python
from app.services.firebase_service import db

def test_connection():
    try:
        # Tentar acessar uma coleção
        test_ref = db.collection('test')
        test_ref.get()
        print("Firebase conectado com sucesso!")
    except Exception as e:
        print(f"Erro: {e}")

if __name__ == "__main__":
    test_connection()
```

Execute:
```bash
cd backend
source venv/bin/activate
python test_firebase.py
```

---

## Segurança - Importante!

1. **NUNCA fazer commit de:**
   - `firebase-service-account.json`
   - `.env.local` ou qualquer arquivo `.env*`
   
2. **Verificar se estão no .gitignore:**
   ```bash
   # No backend/.gitignore
   firebase-service-account.json
   .env
   
   # No frontend/.gitignore
   .env.local
   .env*.local
   ```

3. **Para produção:**
   - Configurar regras de segurança adequadas no Firestore
   - Usar variáveis de ambiente no servidor de produção
   - Não usar as regras de teste em produção!

---

## Solução de Problemas

### Erro: "FirebaseApp already initialized"
- **Solução:** O Firebase já foi inicializado. Verifique se não está inicializando duas vezes.

### Erro: "Missing or insufficient permissions"
- **Solução:** Verifique as regras de segurança no Firebase Console.

### Erro: "File not found: firebase-service-account.json"
- **Solução:** Certifique-se de que o arquivo está na pasta `backend/` e não dentro de `backend/app/`.

### Variáveis de ambiente não funcionam no Next.js
- **Solução:** Certifique-se de que as variáveis começam com `NEXT_PUBLIC_` e reinicie o servidor de desenvolvimento.

---

## Recursos Adicionais

- [Documentação Firebase](https://firebase.google.com/docs)
- [Firestore Docs](https://firebase.google.com/docs/firestore)
- [Firebase Admin SDK (Python)](https://firebase.google.com/docs/admin/setup)
- [Firebase Web SDK](https://firebase.google.com/docs/web/setup)

---

