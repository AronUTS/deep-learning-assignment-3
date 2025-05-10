import os
from flask import Flask, send_from_directory
from .extensions import db
from .routes.api import api_bp
from .config import Config
from flask_migrate import Migrate
from .models.processing_queue import ProcessingQueue

def create_app():
    app = Flask(__name__, static_folder='../static', static_url_path='')
    app.config.from_object(Config)

    db.init_app(app)

    # Initialize Flask-Migrate
    migrate = Migrate(app, db)

    with app.app_context():
        db.engine.execute('CREATE SCHEMA IF NOT EXISTS agritrack_app') # Create agritrack schema to store app tables
        db.create_all()

    app.register_blueprint(api_bp)

    # Serve frontend static files
    @app.route('/')
    @app.route('/<path:path>')
    def serve_frontend(path=''):
        file_path = os.path.join(app.static_folder, path)
        if path != "" and os.path.exists(file_path):
            return send_from_directory(app.static_folder, path)
        return send_from_directory(app.static_folder, 'index.html')

    return app
