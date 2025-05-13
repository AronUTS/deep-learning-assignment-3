from datetime import datetime
from enum import Enum
from ..extensions import db

class StatusEnum(Enum):
    QUEUED = "QUEUED"
    PROCESSING = "PROCESSING"
    COMPLETE = "COMPLETE"

class ProcessingQueue(db.Model):
    __tablename__ = 'processing_queue'
    __table_args__ = {'schema': 'agritrack_app'}

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    file_name = db.Column(db.String, nullable=False)
    upload_timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    status = db.Column(db.String, nullable=False)  # Replaced SqlEnum with String
    format = db.Column(db.String, nullable=False)  # e.g., ".mp4"
    duration_seconds = db.Column(db.Integer, nullable=True)  # in seconds
    size = db.Column(db.Float, nullable=True)  # in megabytes
    resolution = db.Column(db.String, nullable=True)  # e.g., "1920x1080"
    progress_percentage = db.Column(db.Integer, nullable=True) #Int reflecting proocessing progress, update by the worker job
    processing_time = db.Column(db.Integer, nullable=True)  # in seconds
    processed_frames = db.Column(db.Integer, nullable=True) # number of frames
    detected_objects = db.Column(db.Integer, nullable=True)
    average_confidence = db.Column(db.Float, nullable=True)
