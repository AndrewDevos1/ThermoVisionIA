from services.conexao_sqlite import get_connection
from datetime import datetime


def criar_usuario(usuario):
    # usuário = (username, email, telefone, senha)
    conn = get_connection()
    cursor_obj = conn.cursor()

    sql_query = """
        INSERT INTO usuarios (nome, email, telefone, senha)
        VALUES(?, ?, ?, ?)
    """

    cursor_obj.execute(sql_query, usuario)
    conn.commit()
    conn.close()

    return True


def listar_usuarios(limit=20):
    """Retorna lista de usuarios cadastrados (nome, email, senha)."""
    conn = get_connection()
    cursor_obj = conn.cursor()
    cursor_obj.execute(
        """
        SELECT nome, email, senha
        FROM usuarios
        ORDER BY id DESC
        LIMIT ?
        """,
        (limit,),
    )
    rows = cursor_obj.fetchall()
    cursor_obj.close()
    conn.close()
    usuarios = [
        {"nome": r[0], "email": r[1], "senha": r[2]}
        for r in rows
        if r and r[0] is not None
    ]
    # Fallback para facilitar login rápido em ambientes sem usuários
    fallback = [
        {"nome": "AndrewDevos", "email": "andrewhurtado.dev@gmail.com", "senha": "Kaiser@210891"}
    ]
    for user in fallback:
        if not any(u["nome"] == user["nome"] for u in usuarios):
            usuarios.append(user)
    return usuarios[:limit]


def verificar_login(usuario, senha_digitada):
    conn = get_connection()
    cursor_obj = conn.cursor()

    cursor_obj.execute(
        """
            SELECT id, nome, email, telefone, senha FROM usuarios WHERE nome = ?
        """,
        (usuario,),
    )
    dados_usuario_bd = cursor_obj.fetchone()

    if dados_usuario_bd:
        id_morador_bd = dados_usuario_bd[0]
        nome_bd = dados_usuario_bd[1]
        email_bd = dados_usuario_bd[2]
        telefone_bd = dados_usuario_bd[3]
        senha_bd = dados_usuario_bd[4]

        if nome_bd is None:
            cursor_obj.close()
            conn.close()
            return False
        elif senha_digitada != senha_bd:
            cursor_obj.close()
            conn.close()
            return False
        else:
            cursor_obj.close()
            conn.close()
            # Retorna tupla ao invés de Row para ser JSON serializável
            return (id_morador_bd, nome_bd, email_bd, telefone_bd, senha_bd)

    conn.close()
    return False
