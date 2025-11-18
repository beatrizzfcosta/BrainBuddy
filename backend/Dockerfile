# Dockerfile para o backend FastAPI
FROM python:3.13-slim

# Definir diretório de trabalho
WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar arquivo de requirements
COPY requirements.txt .

# Instalar dependências Python
RUN pip install --no-cache-dir -r requirements.txt

# Adicionar fastapi e uvicorn se não estiverem no requirements.txt
RUN pip install --no-cache-dir fastapi uvicorn

# Copiar código da aplicação
COPY . .

# Expor porta
EXPOSE 8000

# Comando para rodar a aplicação
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

