import re
from email_validator import validate_email, EmailNotValidError


def validar_email(email):
    """Valida o formato do e-mail usando a biblioteca email_validator."""
    try:
        validate_email(email)
        return True
    except EmailNotValidError:
        return False


# Validação de Senha: Sugestão para uma senha mais forte (mínimo de 8 caracteres, com letra, número e especial)
def validar_senha(password):
    """
    Valida se a senha tem:
    - Mínimo de 8 caracteres.
    - Pelo menos uma letra maiúscula.
    - Pelo menos uma letra minúscula.
    - Pelo menos um dígito.
    - Pelo menos um caractere especial (símbolo).
    """
    regex = re.compile(
        r"^(?=.*[a-z])"  # Pelo menos uma minúscula
        r"(?=.*[A-Z])"  # Pelo menos uma maiúscula
        r"(?=.*\d)"  # Pelo menos um dígito
        r"(?=.*[@$!%*?&._-])"  # Pelo menos um símbolo
        r"[A-Za-z\d@$!%*?&._-]{6,}$"  # Mínimo de 6 caracteres
    )
    return regex.fullmatch(password) is not None


# Validação de Usuário: Permite letras, números e underscore.
def validar_username(username):
    """
    Valida se o nome de usuário:
    - Tem entre 3 e 20 caracteres.
    - Contém apenas letras, números ou underscore (_).
    """
    # Seu RegEx original está bom para um nome de usuário simples:
    return re.fullmatch(r"^[a-zA-Z0-9_]{3,20}$", username) is not None


# Validação de Telefone (Exemplo)
def validar_telefone(telefone):
    """Valida um formato de telefone comum no Brasil (XX) XXXXX-XXXX ou (XX) XXXX-XXXX."""
    # Remove tudo que não for dígito antes de validar
    apenas_digitos = re.sub(r"[\D]", "", telefone)
    # Verifica 10 (fixo) ou 11 (móvel) dígitos
    return re.fullmatch(r"^\d{10,11}$", apenas_digitos) is not None
