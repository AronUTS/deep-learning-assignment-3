from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError
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
                duration=None,    # to be filled during processing
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
        # Query the processing_queue table for all rows
        processing_queues = ProcessingQueue.query.all()

        # Convert the rows to a list of dictionaries
        result = []
        for queue in processing_queues:
            result.append({
                'id': queue.id,
                'file_name': queue.file_name,
                'upload_timestamp': queue.upload_timestamp,
                'status': queue.status,
                'format': queue.format,
                'duration': queue.duration,
                'size': queue.size,
                'resolution': queue.resolution,
                'processing_time': queue.processing_time,
                'processed_frames': queue.processed_frames,
                'thumbnail_path': queue.thumbnail_path,
                'detected_objects': queue.detected_objects,
                'average_precision': queue.average_precision
            })

        return jsonify(result=result), 200

    except SQLAlchemyError as e:
        return jsonify(message=f"Error: {str(e)}"), 500


@api_bp.route('/analysis', methods=['GET'])
def get_analysis_from_task():
    task_id = request.args.get('task_id')

    if not task_id:
        return jsonify({'error': 'Missing task_id parameter'}), 400

    # Query the completed task
    processing_result = ProcessingQueue.query.filter_by(id=task_id, status='COMPLETE').first()

    if not processing_result:
        return jsonify({'error': 'No completed task found with that ID'}), 404

    response_data = {
        'video_name': processing_result.file_name,
        'object_counts': processing_result.detected_objects,  # e.g. {"car": 12, "person": 5}
        'processing_time': processing_result.processing_time,  # e.g. "00:01:23"
        'thumbnail_path': processing_result.thumbnail_path,
        'status': processing_result.status,
        'processed_frames': processing_result.processed_frames,             # Optional
        'average_precision': processing_result.average_precision,                             # Optional
        'upload_time': processing_result.upload_timestamp.isoformat(),  # Updated to use upload_timestamp
    }

    return jsonify(response_data), 200
