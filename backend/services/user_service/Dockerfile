FROM python:3.12-slim AS builder
WORKDIR /build

# 1️⃣ Copy only the needed requirements files
COPY requirements/common.txt ./common.txt
COPY requirements/user_service.txt ./user_service.txt

# 2️⃣ Install wheels from combined service-specific and common requirements
RUN pip install --no-cache-dir --upgrade pip \
 && pip wheel --no-cache-dir --wheel-dir /wheels -r user_service.txt

# 3️⃣ Runtime stage
FROM python:3.12-slim
ENV PYTHONUNBUFFERED=1 PYTHONPATH=/app
WORKDIR /app

# 4️⃣ Install from wheels
COPY --from=builder /wheels /wheels
RUN pip install --no-cache-dir /wheels/*

# 5️⃣ Copy code
COPY common ./common
COPY services ./services

# 6️⃣ Expose and run
EXPOSE 8001
CMD ["uvicorn", "services.user_service.main:app", "--host", "0.0.0.0", "--port", "8001"]
