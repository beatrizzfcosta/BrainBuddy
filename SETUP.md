# Comandos de Setup

## Frontend (Next.js)

```bash
cd frontend
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir
```

## Backend (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate
pip install fastapi uvicorn
```

## Docker

### Pré-requisitos

1. **Instalar Docker Desktop**:
   - macOS: instalar de https://www.docker.com/products/docker-desktop
   - Ou via Homebrew: `brew install --cask docker`
   - Certifique-se de que o Docker Desktop está rodando (verifique na barra de menu)

2. **Verificar instalação**:
   ```bash
   docker --version
   docker-compose --version
   ```

### Setup com Docker

1. **Garantir que o Docker Desktop está rodando**:
   - Abra o Docker Desktop
   - Aguarde até que o status mostre "Docker Desktop is running"

2. **Construir e iniciar os containers**:
   ```bash
   # Na raiz do projeto
   docker-compose up --build
   ```

3. **Executar em background (detached mode)**:
   ```bash
   docker-compose up -d --build
   ```

4. **Parar os containers**:
   ```bash
   docker-compose down
   ```

5. **Ver logs**:
   ```bash
   # Todos os serviços
   docker-compose logs -f
   
   # Apenas backend
   docker-compose logs -f backend
   
   # Apenas frontend
   docker-compose logs -f frontend
   ```

### Acessos após iniciar

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Documentação da API**: http://localhost:8000/docs

### Notas Importantes

- O arquivo `firebase-service-account.json` deve estar presente na pasta `backend/` para o backend funcionar
- Se as portas 3000 ou 8000 estiverem em uso, altere-as no `docker-compose.yml`

