from pymongo import MongoClient
from datetime import datetime

# Conectar ao MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['deepfake']  # Nome do seu banco

# Exemplo: acessar a coleção "startup_log" que você tem
startup_log = db['startup_log']

# Testar conexão
def testar_conexao():
    try:
        # Buscar um documento
        doc = startup_log.find_one()
        print("✅ Conexão bem-sucedida!")
        print(doc)
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    testar_conexao()