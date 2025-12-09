from services.conexao import conn
from datetime import datetime


def criar_usuario(usuario):
    # usuário = (username, email, telefone, senha)
    # 1. Obtenha a conexão (conn) e o cursor (cursor_obj)
    cursor_obj = conn.cursor()
    sql_query = """
        INSERT INTO usuarios (nome, email, telefone, senha)
        VALUES(%s, %s, %s, %s)
    """

    cursor_obj.execute(sql_query, usuario)

    # 3. Confirma a transação
    conn.commit()

    # Adicionando um retorno para indicar sucesso (opcional, mas boa prática)
    return True


def verificar_login(usuario, senha_digitada):
    cursor_obj = conn.cursor()

    cursor_obj.execute(
        """
            SELECT id, nome, email, telefone, senha FROM usuarios WHERE nome = %s
        """,
        (usuario,),
    )
    dados_usuario_bd = cursor_obj.fetchone()

    if dados_usuario_bd:
        id_morador_bd, nome_bd, email_bd, telefone_bd, senha_bd = dados_usuario_bd

        if nome_bd is None:
            cursor_obj.close()
            return False
        elif senha_digitada != senha_bd:
            cursor_obj.close()
            return False
        else:
            cursor_obj.close()
            return dados_usuario_bd
    return False
