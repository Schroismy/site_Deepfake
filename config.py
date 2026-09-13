import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
    DB_NAME = os.getenv('DB_NAME', 'deepfake_detection')
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev_key_123')
    MAX_CONTENT_LENGTH = 500 * 1024 * 1024  # 500MB