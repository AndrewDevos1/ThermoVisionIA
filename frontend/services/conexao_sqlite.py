import sqlite3
import os

# Caminho do banco de dados SQLite
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'thermovision.db')

def get_connection():
    """Retorna uma conexão com o banco SQLite"""
    conn = sqlite3.connect(DB_PATH)
    return conn

def init_database():
    """Inicializa o banco de dados criando as tabelas necessárias"""
    conn = get_connection()
    cursor = conn.cursor()

    # Criar tabela de usuários
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            telefone TEXT NOT NULL,
            senha TEXT NOT NULL,
            data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    conn.commit()
    conn.close()
    print(f"✓ Banco de dados SQLite criado em: {DB_PATH}")

# Inicializar banco automaticamente se não existir
if not os.path.exists(DB_PATH):
    init_database()
