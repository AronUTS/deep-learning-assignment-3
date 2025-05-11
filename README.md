# 42028 Deep Learning & CNN - Assignment 3 Project - Agritrack (Group 35)

This project is created to build a livestock monitoring and tracking app that runs object detection and classification tasks on drone footage of livestock animals.

## Project Structure
```
├── backend/                # Flask backend (serves static frontend + API)
│   └── app/
├── frontend/               # React frontend (Vite)
│   └── src/
├── model_training/         # Python jupyter notebook for model training in cloud GPUs
│   └── agritrack_frcnn_model_training.ipynb
├── requirements.txt        # Python dependencies
├── Dockerfile              # Multi-stage build
├── docker-compose.yml
└── README.md
```


## 🧪 Run Project Locally (Without Docker)

### 🔹 1. Run Flask Backend
### Outdated, additional commands required to setup database.. coming soon

```
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r ../requirements.txt
python wsygi.py
```

### 🔹 2. Run React Frontend

```
cd frontend
npm install
npm run dev
```

## 🧪 Run In Docker Container

For local development, please download this trained model checkpoint and
store `in backend/app/ml_models` folder - https://drive.google.com/uc?id=1msshCMWch0CuzKc4uo_s2F4h4yVHHU4y
This will mean you container will startup faster as it does not have to download the model every time.

```
docker-compose build
docker-compose up
```

### Access database 

To access the postgres database in the docker container run the below.

```
docker exec -it deep-learning-assignment-3-db-1 /bin/bash
psql -U flask_user -d flask_db
*Run any sql statement*
SELECT 1 FROM agritrack_app.processing_queue
```

### Clear local docker environment

To drop containers and volumes, doing this will restore database

```
docker compose down -v
```