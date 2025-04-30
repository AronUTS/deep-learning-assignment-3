from flask import Flask

# Initialize the Flask application
def create_app():
    app = Flask(__name__)

    # Configure the app from environment variables or config file
    app.config.from_object('config.Config')

    # Register Blueprints (if you use them)
    from .main import main_bp
    app.register_blueprint(main_bp)

    # Initialize extensions (e.g., SQLAlchemy, CORS, etc.)
    # db.init_app(app)
    # migrate.init_app(app, db)

    return app