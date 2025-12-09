# Quick Start - ThermoVisionIA

Scripts prontos para rodar o projeto localmente!

## Scripts Disponíveis

### 1. `setup.sh` - Configuração Inicial
Configura o ambiente completo (venv + dependências)

```bash
./setup.sh
```

**O que faz:**
- Verifica instalação do Python 3.12+
- Cria ambiente virtual `venv/`
- Instala todas as dependências do `requirement.txt`
- Verifica PostgreSQL instalado

---

### 2. `setup_database.sh` - Configurar Banco de Dados
Cria o banco de dados e tabela de usuários

```bash
./setup_database.sh
```

**O que faz:**
- Cria banco de dados `ThermoVision`
- Cria tabela `usuarios` com todos os campos necessários
- Solicita credenciais do PostgreSQL interativamente

**Importante:** Após executar, verifique se as credenciais em `services/conexao.py` estão corretas!

---

### 3. `start_postgres.sh` - Iniciar PostgreSQL
Inicia o serviço PostgreSQL (necessário no WSL2)

```bash
./start_postgres.sh
```

**O que faz:**
- Inicia o serviço PostgreSQL com sudo
- Verifica se o serviço está rodando

**Nota:** No WSL2, o PostgreSQL precisa ser iniciado manualmente a cada boot.

---

### 4. `run.sh` - Executar Aplicação
Inicia o servidor Flask

```bash
./run.sh
```

**O que faz:**
- Ativa o ambiente virtual automaticamente
- Verifica se PostgreSQL está rodando
- Executa `python app.py`
- Servidor disponível em: http://localhost:5000

---

## Passo a Passo Rápido

### Primeira vez (setup completo):

```bash
# 1. Configurar ambiente
./setup.sh

# 2. Iniciar PostgreSQL
./start_postgres.sh

# 3. Configurar banco de dados
./setup_database.sh

# 4. Verificar credenciais do banco
nano services/conexao.py  # ou use seu editor preferido

# 5. Rodar aplicação
./run.sh
```

### Execuções posteriores:

```bash
# 1. Iniciar PostgreSQL (necessário a cada boot no WSL2)
./start_postgres.sh

# 2. Rodar aplicação
./run.sh
```

---

## Requisitos Pré-instalados

Certifique-se de ter instalado:

- **Python 3.12+**
  ```bash
  python3 --version
  ```

- **PostgreSQL 12+**
  ```bash
  psql --version
  ```

  Se não tiver PostgreSQL:
  ```bash
  sudo apt update
  sudo apt install postgresql postgresql-contrib
  ```

---

## Configuração do Banco de Dados

O arquivo `services/conexao.py` contém as credenciais:

```python
conn = psycopg2.connect(
    database="ThermoVision",
    user="postgres",
    password="password",  # ← ALTERE AQUI
    host="localhost",
    port="5432",
)
```

**Importante:** Altere a senha para a senha do seu usuário PostgreSQL!

---

## Solução de Problemas

### Erro: "Permission denied"
```bash
chmod +x setup.sh run.sh setup_database.sh
```

### Erro: PostgreSQL não conecta
```bash
# Verificar se está rodando
sudo systemctl status postgresql

# Iniciar se necessário
sudo systemctl start postgresql
```

### Erro: Módulo não encontrado
```bash
# Execute o setup novamente
./setup.sh
```

### Erro: Banco de dados já existe
O script `setup_database.sh` verifica automaticamente. Se já existe, apenas cria a tabela.

---

## Estrutura Criada

```
ThermoVisionIA-project/
├── venv/                    # Ambiente virtual (criado por setup.sh)
├── setup.sh                 # Script de configuração inicial
├── setup_database.sh        # Script de configuração do banco
├── run.sh                   # Script para rodar a aplicação
├── app.py                   # Aplicação Flask principal
├── requirement.txt          # Dependências Python
├── services/
│   ├── conexao.py          # Configuração do banco
│   └── manipular_database.py
└── ...
```

---

## Comandos Úteis

```bash
# Ver logs do PostgreSQL
sudo journalctl -u postgresql -f

# Conectar ao banco manualmente
psql -U postgres -h localhost -d ThermoVision

# Desativar ambiente virtual
deactivate

# Ativar ambiente virtual manualmente
source venv/bin/activate

# Ver dependências instaladas
pip list
```

---

## Próximos Passos

Após rodar a aplicação:

1. Acesse: **http://localhost:5000**
2. Clique em **"Cadastrar"** para criar uma conta
3. Faça **login** com suas credenciais
4. No dashboard, conecte uma câmera

---

**Dúvidas?** Consulte o [README.md](README.md) completo!
