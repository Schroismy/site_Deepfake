from pymongo import MongoClient
from gridfs import GridFS
from bson.objectid import ObjectId
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

class ImageStorage:
    def __init__(self):
        self.mongo_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
        self.db_name = os.getenv('DB_NAME', 'deepfake_detection')
        
        try:
            self.client = MongoClient(self.mongo_uri)
            self.db = self.client[self.db_name]
            self.fs = GridFS(self.db)
            self.results_collection = self.db['analysis_results']
            print("✅ Storage MongoDB inicializado")
        except Exception as e:
            print(f"❌ Erro ao inicializar storage: {e}")
    
    def save_image(self, file, filename, media_type):
        try:
            file_content = file.read()
            file_id = self.fs.put(
                file_content,
                filename=filename,
                content_type=media_type
            )
            print(f"✅ Imagem salva: {filename}")
            return str(file_id)
        except Exception as e:
            print(f"❌ Erro ao salvar imagem: {e}")
            return None
    
    def get_image(self, file_id):
        try:
            grid_out = self.fs.get(ObjectId(file_id))
            return grid_out.read()
        except Exception as e:
            print(f"❌ Erro ao recuperar imagem: {e}")
            return None
    
    def save_analysis_result(self, file_id, filename, media_type, detection_result):
        try:
            analysis_doc = {
                'file_id': file_id,
                'filename': filename,
                'media_type': media_type,
                'detection': detection_result,
                'timestamp': datetime.now(),
                'status': 'completed'
            }
            result = self.results_collection.insert_one(analysis_doc)
            print(f"✅ Análise salva")
            return str(result.inserted_id)
        except Exception as e:
            print(f"❌ Erro ao salvar análise: {e}")
            return None
    
    def get_analysis_history(self, limit=10):
        try:
            history = list(
                self.results_collection
                .find({}, {'detection.scores': 0})
                .sort('timestamp', -1)
                .limit(limit)
            )
            for doc in history:
                doc['_id'] = str(doc['_id'])
                doc['timestamp'] = doc['timestamp'].isoformat()
            return history
        except Exception as e:
            print(f"❌ Erro ao recuperar histórico: {e}")
            return []