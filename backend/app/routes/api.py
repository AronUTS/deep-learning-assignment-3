from flask import Blueprint, jsonify
from ..extensions import db

api_bp = Blueprint('api', __name__, url_prefix='/api')

@api_bp.route('/hello')
def hello():
    return jsonify(message="Hello from Flask!")

@api_bp.route('/check_db')
def check_db():
    try:
        db.session.execute('SELECT 1')
        return jsonify(message="Database connection successful"), 200
    except Exception as e:
        return jsonify(message=f"Error: {str(e)}"), 500

