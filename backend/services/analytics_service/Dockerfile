#/service/analytics_service/Dockerfile
FROM python:3.12-slim AS builder

WORKDIR /build

# 1️⃣ Copy only the needed requirements files
COPY requirements/common.txt ./common.txt
COPY requirements/analytics_service.txt ./analytics_service.txt

# 2️⃣ Install wheels from combined service-specific and common requirements
RUN pip install --no-cache-dir --upgrade pip \
 && pip wheel --no-cache-dir --wheel-dir /wheels -r analytics_service.txt

# 2) runtime image
FROM python:3.12-slim
ENV PYTHONUNBUFFERED=1 PYTHONPATH=/app
WORKDIR /app

# install our prebuilt wheels
COPY --from=builder /wheels /wheels
RUN pip install --no-cache-dir /wheels/*

# 3) copy shared code + this service
COPY common ./common
COPY services ./services
# 4) container listens on its own port
EXPOSE 8003

# 5) launch with uvicorn pointing at this service’s main:app
CMD ["uvicorn","services.analytics_service.main:app","--host","0.0.0.0","--port","8003"]