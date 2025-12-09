from flask import request


def obter_dados_cadastro(form_data):
    c_usuario = form_data.get("c_usuario").strip()
    c_email = form_data.get("c_email").strip()
    c_telefone = form_data.get("c_telefone").strip()
    c_senha = form_data.get("c_senha").strip()

    return (c_usuario, c_email, c_telefone, c_senha)


def obter_dados_login(form_data):
    usuario = form_data.get("usuario").strip()
    senha = form_data.get("senha").strip()

    return (usuario, senha)
