from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError
from ..extensions import db
from ..models.processing_queue import ProcessingQueue

api_bp = Blueprint('api', __name__, url_prefix='/api')

# Route to test insert a row into the processing_queue
@api_bp.route('/upload', methods=['GET'])
def add_processing_queue():
    try:
        # Dummy data to insert into the processing_queue table
        dummy_data = {
            "file_name": "video_02.mp4",
            "status": "QUEUED",
            "format": "mp4",
            "duration": 150,
            "size": 120.5,
            "resolution": "1280x720"
        }
        
        # Create a new row in the processing_queue table using dummy data
        processing_queue = ProcessingQueue(
            file_name=dummy_data["file_name"],
            status=dummy_data["status"],
            format=dummy_data["format"],
            duration=dummy_data["duration"],
            size=dummy_data["size"],
            resolution=dummy_data["resolution"]
        )

        # Add the new row to the session and commit to the database
        db.session.add(processing_queue)
        db.session.commit()

        return jsonify(message="Dummy row added to processing_queue"), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify(message=f"Error: {str(e)}"), 500

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
