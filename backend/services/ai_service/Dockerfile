FROM python:3.12-slim AS builder

WORKDIR /app

# Optional: install system dependencies for native builds (like if numpy, pandas, etc.)
RUN apt-get update && apt-get install -y gcc && rm -rf /var/lib/apt/lists/*

# 1️⃣ Copy just the needed requirements files
COPY requirements/common.txt ./common.txt
COPY requirements/ai_service.txt ./ai_service.txt

# 2️⃣ Install all dependencies for ai_service (which includes `-r common.txt`)
RUN pip install --no-cache-dir -r ai_service.txt

# 3️⃣ Copy only what’s needed
COPY services/ai_service ./services/ai_service
COPY common ./common

# 4️⃣ Env vars (use Docker secrets/compose in production)
ENV OPENAI_API_KEY="sk-..."

# 5️⃣ Launch app
CMD ["uvicorn", "services.ai_service.main:app", "--host", "0.0.0.0", "--port", "8006"]
