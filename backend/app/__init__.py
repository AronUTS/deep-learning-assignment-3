import os
from flask import Flask, request, send_from_directory, Response, abort, send_file
from .extensions import db
from .routes.api import api_bp
from .config import Config
from flask_migrate import Migrate
import threading
from .models.processing_queue import ProcessingQueue
from .workers.video_worker import process_video_worker_loop
from flask_cors import CORS
import io

def create_app():
    app = Flask(__name__, static_folder='../static', static_url_path='')
    app.config.from_object(Config)

    # Initialize CORS to allow cross-origin requests
    CORS(app)

    db.init_app(app)

    # Initialize Flask-Migrate
    Migrate(app, db)

    with app.app_context():
        db.engine.execute('CREATE SCHEMA IF NOT EXISTS agritrack_app')  # Create agritrack schema to store app tables
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

    # Serve video files from processed assets path with range request support
    @app.route('/assets/videos/processed/<filename>')
    def video(filename):
        path = os.path.join(app.static_folder, 'assets/videos/processed', filename)
        if not os.path.isfile(path):
            abort(404)

        range_header = request.headers.get('Range', None)
        file_size = os.path.getsize(path)

        if range_header:
            try:
                byte1, byte2 = range_header.replace('bytes=', '').split('-')
                byte1 = int(byte1)
                byte2 = int(byte2) if byte2 else file_size - 1
            except ValueError:
                abort(400)

            length = byte2 - byte1 + 1

            with open(path, 'rb') as f:
                f.seek(byte1)
                data = f.read(length)

            rv = Response(data,
                        206,
                        mimetype='video/mp4',
                        direct_passthrough=True)
            rv.headers.add('Content-Range', f'bytes {byte1}-{byte2}/{file_size}')
            rv.headers.add('Accept-Ranges', 'bytes')
            rv.headers.add('Content-Length', str(length))
            return rv
        else:
            # No Range header; serve full file
            return send_file(path, mimetype='video/mp4')


    return app
