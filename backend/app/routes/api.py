from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import desc
from ..extensions import db
from ..models.processing_queue import ProcessingQueue
import os
from werkzeug.utils import secure_filename
from datetime import datetime

api_bp = Blueprint('api', __name__, url_prefix='/api')

UPLOAD_FOLDER = 'backend/app/videos/uploads'
PROCESSING_FOLDER = 'backend/app/videos/processed'
ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv'}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)  # Ensure the folder exists
os.makedirs(PROCESSING_FOLDER, exist_ok=True)  # Ensure the folder exists

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Route to test insert a row into the processing_queue
@api_bp.route('/upload', methods=['POST'])
def add_processing_queue():
    if 'video' not in request.files:
        return jsonify(message="No file part in the request"), 400

    file = request.files['video']

    if file.filename == '':
        return jsonify(message="No file selected for uploading"), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)
        print(f"File saved to {file_path}")

        # You may later extract metadata like duration, size, etc. using ffmpeg or similar
        try:
            processing_queue = ProcessingQueue(
                file_name=filename,
                status="QUEUED",
                format=filename.rsplit('.', 1)[1].lower(),
                upload_timestamp=datetime.utcnow(),
                size=os.path.getsize(file_path) / (1024 * 1024),  # in MB
                resolution=None,  # to be filled during processing
                duration_seconds=None,    # to be filled during processing
            )
            db.session.add(processing_queue)
            db.session.commit()

            return jsonify(message="File uploaded and task queued", task_id=processing_queue.id), 201

        except SQLAlchemyError as e:
            db.session.rollback()
            return jsonify(message=f"Database error: {str(e)}"), 500
    else:
        return jsonify(message="Unsupported file type"), 400

# Route to retrieve rows from the processing_queue
@api_bp.route('/processing_queue', methods=['GET'])
def get_processing_queue():
    try:
        # Query the processing_queue table for all rows, ordered by upload_timestamp (newest first)
        processing_queue = ProcessingQueue.query.order_by(desc(ProcessingQueue.upload_timestamp)).all()

        # Convert the rows to a list of dictionaries
        result = []
        for task in processing_queue:
            result.append({
                'id': task.id,
                'file_name': task.file_name,
                'upload_timestamp': task.upload_timestamp,
                'status': task.status,
                'format': task.format,
                'duration_seconds': task.duration_seconds,
                'size': task.size,
                'resolution': task.resolution,
                'progress_percentage': task.progress_percentage,
                'processing_time': task.processing_time,
                'processed_frames': task.processed_frames,
                'detected_objects': task.detected_objects,
                'average_confidence': task.average_confidence
            })

        return jsonify(result=result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route('/analysis', methods=['GET'])
def get_analysis_from_task():
    task_id = request.args.get('task_id')

    if not task_id:
        return jsonify({'error': 'Missing task_id parameter'}), 400

    # Query the completed task
    processing_result = ProcessingQueue.query.filter_by(id=task_id, status='COMPLETED').first()

    if not processing_result:
        return jsonify({'error': 'No completed task found with that ID'}), 404

    response_data = {
                'id': processing_result.id,
                'file_name': processing_result.file_name,
                'upload_timestamp': processing_result.upload_timestamp,
                'status': processing_result.status,
                'format': processing_result.format,
                'duration_seconds': processing_result.duration_seconds,
                'size': processing_result.size,
                'resolution': processing_result.resolution,
                'progress_percentage': processing_result.progress_percentage,
                'processing_time': processing_result.processing_time,
                'processed_frames': processing_result.processed_frames,
                'detected_objects': processing_result.detected_objects,
                'average_confidence': processing_result.average_confidence
            }

    return jsonify(response_data), 200
