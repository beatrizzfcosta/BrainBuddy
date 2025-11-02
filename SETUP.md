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

