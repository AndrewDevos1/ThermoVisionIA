# SQLite Quick Start - ThermoVisionIA

Versão rápida usando SQLite (sem precisar configurar PostgreSQL)!

## Executar AGORA (Modo Rápido)

```bash
./run_quick.sh
```

Pronto! Acesse: **http://localhost:5000**

---

## O que foi feito?

- Trocado PostgreSQL por **SQLite**
- Banco de dados local em arquivo: `thermovision.db`
- Não precisa instalar/configurar PostgreSQL
- Tudo funciona out-of-the-box!

---

## Diferenças

### Antes (PostgreSQL):
```bash
./start_postgres.sh  # Iniciar PostgreSQL
./setup_database.sh  # Configurar banco
./run.sh             # Rodar app
```

### Agora (SQLite):
```bash
./run_quick.sh       # Tudo em um comando!
```

---

## Estrutura SQLite

**Banco:** `thermovision.db` (arquivo local)

**Tabela:** `usuarios`
- id (INTEGER PRIMARY KEY AUTOINCREMENT)
- nome (TEXT NOT NULL UNIQUE)
- email (TEXT NOT NULL UNIQUE)
- telefone (TEXT NOT NULL)
- senha (TEXT NOT NULL)
- data_criacao (TIMESTAMP)

---

## Arquivos Criados

```
ThermoVisionIA-project/
├── thermovision.db                      # Banco SQLite (criado automaticamente)
├── services/
│   ├── conexao_sqlite.py               # Conexão SQLite
│   └── manipular_database_sqlite.py    # Operações CRUD SQLite
├── run_quick.sh                         # Script rápido
└── app.py                               # Atualizado para usar SQLite
```

---

## Comandos Úteis

### Ver dados do banco
```bash
sqlite3 thermovision.db "SELECT * FROM usuarios;"
```

### Ver estrutura da tabela
```bash
sqlite3 thermovision.db ".schema usuarios"
```

### Apagar banco e recriar
```bash
rm thermovision.db
./run_quick.sh
```

### Ver todos os usuários
```bash
sqlite3 thermovision.db "SELECT id, nome, email FROM usuarios;"
```

---

## Vantagens do SQLite

- **Rápido**: Sem configuração necessária
- **Simples**: Um único arquivo
- **Portátil**: Pode copiar o arquivo .db
- **Leve**: Perfeito para desenvolvimento
- **Zero setup**: Não precisa instalar servidor

---

## Migrar para PostgreSQL depois

Quando quiser usar PostgreSQL em produção:

1. Volte o import no `app.py`:
   ```python
   # De:
   from services.manipular_database_sqlite import criar_usuario, verificar_login

   # Para:
   from services.manipular_database import criar_usuario, verificar_login
   ```

2. Configure PostgreSQL:
   ```bash
   ./start_postgres.sh
   ./setup_database.sh
   ```

3. Use o script normal:
   ```bash
   ./run.sh
   ```

---

## Troubleshooting

### Erro: "table usuarios already exists"
Isso é normal, o banco já foi criado. Só rode `./run_quick.sh`

### Resetar banco de dados
```bash
rm thermovision.db
./run_quick.sh  # Recria automaticamente
```

### Ver erros do banco
```bash
sqlite3 thermovision.db
# Depois execute comandos SQL interativamente
```

---

**Pronto para usar! Execute `./run_quick.sh` e comece a desenvolver!**
