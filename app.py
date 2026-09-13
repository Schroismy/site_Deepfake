from flask import Flask, render_template, request, jsonify
from pymongo import MongoClient
from gridfs import GridFS
from bson.objectid import ObjectId
import os
from dotenv import load_dotenv
import uuid
from werkzeug.utils import secure_filename
from datetime import datetime

# Importar módulos
import sys
sys.path.insert(0, os.path.dirname(__file__))
from modules.storage import ImageStorage
from modules.image_detector import ImageDetector

load_dotenv()

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024

# Inicializar
try:
    storage = ImageStorage()
    image_detector = ImageDetector()
except Exception as e:
    print(f"❌ Erro ao inicializar: {e}")

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'avi', 'wav', 'mp3'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ============ ROTAS BÁSICAS ============

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/site')
def site():
    return render_template('site.html')

@app.route('/funciona')
def funciona():
    return render_template('funciona.html')

@app.route('/sobre')
def sobre():
    return render_template('sobre.html')

@app.route('/verificar')
def verificar():
    return render_template('verificar.html')

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'storage': 'MongoDB GridFS'}), 200

# ============ ROTA DE ANÁLISE (PRINCIPAL) ============

@app.route('/api/analyze', methods=['POST'])
def analyze():
    """Recebe arquivo, salva no MongoDB e analisa"""
    try:
        # Validar arquivo
        if 'file' not in request.files:
            return jsonify({'erro': 'Arquivo não fornecido'}), 400
        
        file = request.files['file']
        media_type = request.form.get('type', 'image')
        
        if file.filename == '':
            return jsonify({'erro': 'Arquivo sem nome'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'erro': 'Tipo de arquivo não permitido'}), 400
        
        # Gerar nome seguro
        original_filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{original_filename}"
        
        # ===== SALVAR NO MONGODB GRIDFS =====
        file_id = storage.save_image(file, unique_filename, media_type)
        
        if not file_id:
            return jsonify({'erro': 'Erro ao salvar arquivo no MongoDB'}), 500
        
        print(f"✅ Arquivo salvo em GridFS: {file_id}")
        
        # ===== ANALISAR IMAGEM =====
        detection_result = {
            'verdict': 'pending',
            'confidence': 0,
            'explanation': 'Análise em progresso...'
        }
        
        if media_type == 'image':
            try:
                # Recuperar imagem do MongoDB
                image_bytes = storage.get_image(file_id)
                
                if image_bytes:
                    # Salvar temporariamente
                    temp_path = f"temp/{unique_filename}"
                    os.makedirs('temp', exist_ok=True)
                    
                    with open(temp_path, 'wb') as f:
                        f.write(image_bytes)
                    
                    print(f"✅ Arquivo temporário criado: {temp_path}")
                    
                    # Executar análise
                    detection_result = image_detector.detect(temp_path)
                    
                    print(f"✅ Análise concluída: {detection_result}")
                    
                    # Limpar temporário
                    if os.path.exists(temp_path):
                        os.remove(temp_path)
            except Exception as e:
                print(f"❌ Erro na análise: {e}")
                detection_result['explanation'] = f"Erro na análise: {str(e)}"
        
        # ===== SALVAR RESULTADO NO MONGODB =====
        analysis_id = storage.save_analysis_result(
            file_id, 
            original_filename, 
            media_type, 
            detection_result
        )
        
        print(f"✅ Resultado salvo: {analysis_id}")
        
        # ===== RETORNAR RESPOSTA =====
        return jsonify({
            'status': 'sucesso',
            'analysis_id': analysis_id,
            'file_id': file_id,
            'filename': original_filename,
            'type': media_type,
            'detection': detection_result,
            'stored_at': 'MongoDB GridFS'
        }), 200
        
    except Exception as e:
        print(f"❌ Erro geral: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'erro': str(e),
            'tipo': type(e).__name__
        }), 500

# ============ ROTA DE HISTÓRICO =============

@app.route('/api/history', methods=['GET'])
def get_history():
    """Retorna histórico de análises"""
    try:
        history = storage.get_analysis_history(limit=20)
        return jsonify(history), 200
    except Exception as e:
        print(f"❌ Erro ao buscar histórico: {e}")
        return jsonify({'erro': str(e)}), 500

# ============ TRATAMENTO DE ERROS =============

@app.errorhandler(404)
def not_found(error):
    return jsonify({'erro': 'Rota não encontrada'}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({'erro': 'Erro interno do servidor'}), 500

if __name__ == '__main__':
    print("🚀 Iniciando Flask...")
    print("✅ MongoDB conectado")
    print("✅ Image Detector inicializado")
    print("🎉 Servidor rodando em http://localhost:5000")
    app.run(debug=True, port=5000)