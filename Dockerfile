# Stage 1: Build React frontend
FROM node:18-slim AS frontend-builder

WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Stage 2: Setup Flask backend
FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    python3-dev \
    postgresql-client \
    libgl1 \
    libglib2.0-0 \
    ffmpeg \
    libx264-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY backend/ ./backend/
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy frontend to code to backend image
COPY --from=frontend-builder /app/dist/ ./backend/static/

# Expose port 5000 for flask api
EXPOSE 5001

# Run flask app
CMD ["python", "backend/wsgi.py"]