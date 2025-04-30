# 42028 Deep Learning & CNN - Assignment 3 Project - Agritrack (Group 35)

This project is created to build a livestock monitoring and tracking app that runs object detection and classification tasks on drone footage of livestock animals.

## Project Structure
```
├── backend/                # Flask backend (serves static frontend + API)
│   └── app.py
├── frontend/               # React frontend (Vite)
│   └── src/
├── requirements.txt        # Python dependencies
├── Dockerfile              # Multi-stage build
├── docker-compose.yml
└── README.md
```


## 🧪 Run Project Locally (Without Docker)

### 🔹 1. Run Flask Backend

```
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r ../requirements.txt
python app.py
```

### 🔹 2. Run React Frontend

```
cd frontend
npm install
npm run dev
```

## 🧪 Run In Docker Container

```
docker-compose build --no-cache
docker-compose up
```