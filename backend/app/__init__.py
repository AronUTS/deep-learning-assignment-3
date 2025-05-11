import os
from flask import Flask, send_from_directory
from .extensions import db
from .routes.api import api_bp
from .config import Config
from flask_migrate import Migrate
import threading
from .models.processing_queue import ProcessingQueue
from .workers.video_worker import process_video_worker_loop 

def create_app():
    app = Flask(__name__, static_folder='../static', static_url_path='')
    app.config.from_object(Config)

    db.init_app(app)

    # Initialize Flask-Migrate
    Migrate(app, db)

    with app.app_context():
        db.engine.execute('CREATE SCHEMA IF NOT EXISTS agritrack_app') # Create agritrack schema to store app tables
        db.create_all()

    app.register_blueprint(api_bp)

    # Start background worker thread
    if app.config.get("START_WORKER", True):
        def run_worker():
            with app.app_context():
                process_video_worker_loop()
        threading.Thread(target=run_worker, daemon=True).start()

    # Serve frontend static files
    @app.route('/')
    @app.route('/<path:path>')
    def serve_frontend(path=''):
        file_path = os.path.join(app.static_folder, path)
        if path != "" and os.path.exists(file_path):
            return send_from_directory(app.static_folder, path)
        return send_from_directory(app.static_folder, 'index.html')

    return app
