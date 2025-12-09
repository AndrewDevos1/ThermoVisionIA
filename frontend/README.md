# 🌡️ ThermoVisionIA

Sistema de Monitoramento Industrial com Visão Computacional para Análise Térmica em Tempo Real.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Como Executar](#como-executar)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API Endpoints](#api-endpoints)
- [Interface do Usuário](#interface-do-usuário)
- [Segurança](#segurança)
- [Solução de Problemas](#solução-de-problemas)
- [Roadmap](#roadmap)
- [Contribuição](#contribuição)
- [Licença](#licença)

## 🎯 Sobre o Projeto

O ThermoVisionIA é uma aplicação web moderna desenvolvida para monitoramento industrial com visão computacional. O sistema oferece uma solução completa para análise térmica em tempo real, permitindo:

- **Streaming de vídeo em tempo real** com interface moderna e responsiva
- **Detecção automática de câmeras** disponíveis no sistema
- **Sistema de autenticação robusto** com validações avançadas
- **Interface intuitiva** construída com Tailwind CSS
- **Controle dinâmico de câmeras** com conexão/desconexão em tempo real
- **API REST completa** para integração com outros sistemas
- **Monitoramento de status** em tempo real

## ✨ Funcionalidades

### 🔐 Sistema de Autenticação Avançado
- **Login seguro** com validação de credenciais
- **Registro de usuários** com validações robustas
- **Validação de email** usando biblioteca especializada
- **Validação de senha forte** (maiúscula, minúscula, número, símbolo)
- **Validação de telefone** no formato brasileiro
- **Proteção de rotas** com decorators personalizados
- **Gerenciamento de sessões** seguro
- **Página de acesso negado** para usuários não autorizados

### 📹 Sistema de Câmeras Inteligente
- **Detecção automática** de até 10 câmeras disponíveis
- **Streaming de vídeo em tempo real** (30 FPS)
- **Seleção dinâmica** de câmeras via interface
- **Controle de conexão/desconexão** em tempo real
- **Verificação de status** automática a cada 5 segundos
- **Tratamento de erros** robusto com mensagens informativas
- **Suporte a múltiplas resoluções** de câmera
- **Interface de refresh** para detectar novas câmeras

### 📊 Dashboard Moderno
- **Interface responsiva** construída com Tailwind CSS
- **Design moderno** com sombras e animações
- **Controles intuitivos** para gerenciamento de câmeras
- **Status em tempo real** com indicadores visuais
- **Seletor de câmeras** com informações detalhadas
- **Área de streaming** otimizada para diferentes dispositivos
- **Botões de ação** preparados para futuras funcionalidades

## 🛠️ Tecnologias Utilizadas

### Backend
- **Python 3.12+** - Linguagem principal
- **Flask 3.1.2** - Framework web moderno
- **OpenCV 4.12.0** - Processamento de imagens e streaming de vídeo
- **PostgreSQL** - Banco de dados relacional
- **Psycopg2 2.9.10** - Driver PostgreSQL para Python
- **Email-validator 2.3.0** - Validação robusta de emails

### Frontend
- **HTML5** - Estrutura semântica
- **Tailwind CSS** - Framework CSS utilitário moderno
- **JavaScript ES6+** - Interatividade e comunicação AJAX
- **Design Responsivo** - Adaptação automática para mobile/desktop
- **Inter Font** - Tipografia moderna e legível

### Validações e Segurança
- **Regex avançado** - Validação de senhas e telefones
- **Email validation** - Validação de formato de email
- **Session management** - Gerenciamento seguro de sessões
- **SQL injection protection** - Prevenção com prepared statements

### Ferramentas de Desenvolvimento
- **Virtual Environment** - Isolamento de dependências
- **Git** - Controle de versão
- **Flask Debug Mode** - Desenvolvimento com hot-reload

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Python 3.12+**
- **PostgreSQL 12+**
- **Git**
- **Câmera web** (para testes)

### Instalação do PostgreSQL (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

### Instalação do PostgreSQL (Windows)

Baixe o instalador oficial do [PostgreSQL](https://www.postgresql.org/download/windows/)

## 🚀 Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/Renan86-pro/ThermoVisionIA-project.git
cd ThermoVisionIA-project
```

2. **Crie um ambiente virtual**
```bash
python -m venv venv
```

3. **Ative o ambiente virtual**

**Linux/Mac:**
```bash
source venv/bin/activate
```

**Windows:**
```bash
venv\Scripts\activate
```

4. **Instale as dependências**
```bash
pip install -r requirement.txt
```

**Nota:** O arquivo `requirement.txt` contém as dependências principais. Para instalar o OpenCV (necessário para streaming de vídeo), execute:
```bash
pip install opencv-python
```

## ⚙️ Configuração

### 1. Configuração do Banco de Dados

1. **Acesse o PostgreSQL**
```bash
sudo -u postgres psql
```

2. **Crie o banco de dados**
```sql
CREATE DATABASE "ThermoVision";
CREATE USER thermovision_user WITH PASSWORD 'sua_senha_aqui';
GRANT ALL PRIVILEGES ON DATABASE "ThermoVision" TO thermovision_user;
\q
```

3. **Crie a tabela de usuários**
```sql
-- Conecte ao banco ThermoVision
\c "ThermoVision"

-- Crie a tabela de usuários
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefone VARCHAR(20) NOT NULL,
    senha VARCHAR(100) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

4. **Configure a conexão** no arquivo `services/conexao.py`
```python
conn = psycopg2.connect(
    database="ThermoVision",
    user="postgres",  # ou thermovision_user
    password="sua_senha_aqui",
    host="localhost",
    port="5432",
)
```

### 2. Configuração das Câmeras

O sistema detecta automaticamente as câmeras disponíveis. Para configurar:

1. Conecte suas câmeras USB
2. Execute o sistema e acesse o dashboard
3. Use o seletor de câmeras para escolher a desejada

## ▶️ Como Executar

1. **Ative o ambiente virtual**
```bash
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows
```

2. **Execute a aplicação**
```bash
python app.py
```

3. **Acesse no navegador**
```
http://localhost:5000
```

## 💡 Exemplos de Uso

### Primeiro Acesso
1. **Acesse** `http://localhost:5000`
2. **Clique em "Cadastrar"** para criar uma conta
3. **Preencha os dados** com validações em tempo real
4. **Faça login** com suas credenciais

### Conectando uma Câmera
1. **Acesse o dashboard** após login
2. **Clique em "🔄"** para detectar câmeras
3. **Selecione uma câmera** da lista disponível
4. **Clique em "Conectar Câmera"**
5. **Aguarde o streaming** aparecer na tela

### API - Listando Câmeras
```bash
curl -X GET http://localhost:5000/cameras/list
```

### API - Conectando Câmera
```bash
curl -X POST http://localhost:5000/camera/connect \
  -H "Content-Type: application/json" \
  -d '{"camera_index": 0}'
```

### Validações de Senha
- ✅ `MinhaSenh@123` (válida)
- ❌ `senha123` (sem maiúscula e símbolo)
- ❌ `SENHA123` (sem minúscula)
- ❌ `MinhaSenha` (sem número e símbolo)

## 📁 Estrutura do Projeto

```
ThermoVisionIA-project/
├── 📁 services/
│   ├── conexao.py              # Configuração do banco de dados
│   └── manipular_database.py   # Operações CRUD
├── 📁 templates/
│   ├── index.html              # Página de login
│   ├── cadastro.html           # Página de registro
│   ├── dashboard.html          # Dashboard principal
│   └── unauthorized.html       # Página de acesso negado
├── 📁 static/
│   ├── 📁 css/
│   │   ├── style.css           # Estilos da página de login
│   │   ├── cadastro.css        # Estilos do cadastro
│   │   ├── dashboard.css       # Estilos do dashboard
│   │   └── globals.css         # Estilos globais
│   └── 📁 js/
│       └── dashboard.js        # JavaScript do dashboard
├── 📁 utils/
│   ├── manipular_forms.py      # Manipulação de formulários
│   └── validacoes.py           # Validações de dados
├── app.py                      # Aplicação principal Flask
├── requirement.txt             # Dependências Python
└── README.md                   # Este arquivo
```

## 🔗 API Endpoints

### Autenticação
- `GET /` - Página de login
- `POST /` - Processar login (JSON: usuario, senha)
- `GET /cadastro` - Página de cadastro
- `POST /cadastro` - Processar cadastro (JSON: nome, email, telefone, senha)

### Dashboard
- `GET /dashboard` - Dashboard principal (protegido por sessão)
- `GET /unauthorized` - Página de acesso negado

### Sistema de Câmeras
- `GET /video_feed` - Stream de vídeo em tempo real (MJPEG)
- `GET /cameras/list` - Listar câmeras disponíveis
  ```json
  {
    "success": true,
    "cameras": [
      {
        "index": 0,
        "name": "Câmera 0",
        "resolution": "640x480"
      }
    ],
    "count": 1
  }
  ```
- `GET /camera/status` - Status da câmera atual
  ```json
  {
    "status": "connected",
    "message": "Câmera conectada",
    "camera_index": 0
  }
  ```
- `POST /camera/connect` - Conectar câmera
  ```json
  {
    "camera_index": 0
  }
  ```
- `POST /camera/disconnect` - Desconectar câmera

## 🎨 Interface do Usuário

### Página de Login
- **Design moderno** com Tailwind CSS
- **Validação em tempo real** com feedback visual
- **Mensagens de erro/sucesso** com flash messages
- **Link para cadastro** integrado
- **Responsividade** para mobile e desktop

### Página de Cadastro
- **Validações avançadas** para todos os campos
- **Feedback visual** para validação de email e senha
- **Formatação automática** de telefone brasileiro
- **Prevenção de duplicatas** no banco de dados

### Dashboard Principal
- **Interface centralizada** com layout em grid responsivo
- **Seletor de câmeras** com informações detalhadas
- **Área de streaming** otimizada para diferentes resoluções
- **Controles dinâmicos** de conexão/desconexão
- **Status em tempo real** com indicadores visuais
- **Botões de ação** preparados para funcionalidades futuras
- **Design intuitivo** com animações suaves

### Características Visuais
- **Fonte Inter** para melhor legibilidade
- **Paleta de cores** moderna (cinza, âmbar, azul)
- **Sombras e bordas** para profundidade visual
- **Animações hover** nos botões
- **Layout responsivo** que se adapta a qualquer tela

## 🔒 Segurança

### Autenticação e Autorização
- **Sessões seguras** com chave secreta Flask
- **Proteção de rotas** com decorator `@login_required`
- **Verificação de credenciais** no banco de dados
- **Redirecionamento automático** para página de acesso negado

### Validação de Dados
- **Validação de email** usando biblioteca `email-validator`
- **Validação de senha forte** com regex avançado
- **Validação de telefone** no formato brasileiro
- **Validação de username** com caracteres permitidos
- **Sanitização de inputs** para prevenir SQL injection

### Proteção de Banco de Dados
- **Prepared statements** para todas as consultas SQL
- **Proteção contra SQL injection** com psycopg2
- **Validação de tipos** antes de inserção no banco
- **Transações seguras** com commit/rollback

### Segurança de Streaming
- **Verificação de disponibilidade** de câmeras
- **Tratamento de erros** robusto no streaming
- **Liberação de recursos** automática ao desconectar

## 🐛 Solução de Problemas

### Câmera não detectada
1. **Verifique a conexão física** da câmera USB
2. **Teste em outras aplicações** (como Cheese no Linux ou Camera no Windows)
3. **Verifique permissões** do sistema operacional
4. **Execute como administrador** se necessário
5. **Reinicie o serviço** se usando câmeras IP

### Erro de conexão com banco
1. **Verifique se o PostgreSQL está rodando**
   ```bash
   sudo systemctl status postgresql
   sudo systemctl start postgresql
   ```
2. **Confirme as credenciais** em `services/conexao.py`
3. **Verifique se o banco existe** e se a tabela foi criada
4. **Teste a conexão manualmente**
   ```bash
   psql -h localhost -U postgres -d "ThermoVision"
   ```

### Streaming não funciona
1. **Verifique se a câmera está conectada** via dashboard
2. **Confirme que a câmera não está sendo usada** por outro programa
3. **Teste com diferentes navegadores** (Chrome, Firefox, Edge)
4. **Verifique o console do navegador** para erros JavaScript

### Dependências não instaladas
```bash
# Atualize o pip primeiro
pip install --upgrade pip

# Instale todas as dependências
pip install -r requirement.txt --force-reinstall

# Instale OpenCV separadamente se necessário
pip install opencv-python
```

### Erros de validação
1. **Verifique o formato do email** (deve ser válido)
2. **Confirme a força da senha** (maiúscula, minúscula, número, símbolo)
3. **Formato do telefone** deve seguir padrão brasileiro
4. **Username** deve ter entre 3-20 caracteres (letras, números, _)

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte, entre em contato:

- **Email**: renanhurtado.pro@gmail.com
- **GitHub Issues**: [Criar Issue](https://github.com/Renan86-pro/ThermoVisionIA-project/issues)

## 🔮 Roadmap

### Funcionalidades Planejadas
- [ ] **Análise térmica com IA** - Detecção automática de anomalias de temperatura
- [ ] **Notificações em tempo real** - Alertas via email/SMS
- [ ] **Relatórios automáticos** - Geração de relatórios PDF/Excel
- [ ] **Gravação de vídeos** - Captura e armazenamento de eventos
- [ ] **Histórico de análises** - Banco de dados de eventos térmicos
- [ ] **Multi-câmeras simultâneas** - Suporte a múltiplas câmeras ativas
- [ ] **Configurações avançadas** - Ajustes de qualidade e performance

### Melhorias Técnicas
- [ ] **API REST completa** - Documentação Swagger/OpenAPI
- [ ] **Autenticação JWT** - Tokens seguros para APIs
- [ ] **Docker containerization** - Deploy simplificado
- [ ] **Testes automatizados** - Cobertura de testes unitários
- [ ] **Logging avançado** - Sistema de logs estruturados
- [ ] **Cache Redis** - Melhoria de performance
- [ ] **WebSockets** - Comunicação em tempo real

### Expansões Futuras
- [ ] **Mobile app** - Aplicativo Android/iOS
- [ ] **Integração IoT** - Sensores de temperatura externos
- [ ] **Machine Learning** - Modelos de detecção customizados
- [ ] **Cloud deployment** - AWS/Azure/GCP
- [ ] **Multi-tenant** - Suporte a múltiplos clientes
- [ ] **Dashboard analytics** - Métricas e estatísticas avançadas

---

## 📞 Suporte

Para suporte técnico ou dúvidas sobre o projeto:

- **GitHub Issues**: [Criar Issue](https://github.com/Renan86-pro/ThermoVisionIA-project/issues)
- **Documentação**: Consulte este README e os comentários no código

---

**Desenvolvido com ❤️ para o monitoramento industrial inteligente**
