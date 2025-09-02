# Sistema de Gestão de Documentos com Fluxo de Aprovação

## 📋 Visão Geral

Sistema completo de gestão de documentos com fluxo de aprovação em 3 estágios:
- **Autor** → Cria e envia documentos
- **Revisor** → Revisa e aprova/rejeita
- **Aprovador** → Aprovação final

## 🚀 Tecnologias

### Frontend
- React 18 + Vite
- Material-UI v5
- React Router v6
- PDF.js para visualização de PDFs
- Axios para requisições HTTP

### Backend
- Python 3.10+ com FastAPI
- SQLAlchemy 2.0 ORM
- PostgreSQL 14+
- JWT para autenticação
- Pydantic v2 para validação

### Infraestrutura
- Docker & Docker Compose
- Nginx (produção)
- Volumes para persistência

## 🛠️ Instalação e Execução

### Pré-requisitos
- Docker e Docker Compose instalados
- Git

### Passos para Execução

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/document-management-system.git
cd document-management-system
```

2. **Configure as variáveis de ambiente**
```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

3. **Inicie os containers**
```bash
docker-compose up --build
```

4. **Acesse a aplicação**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Documentação API: http://localhost:8000/docs
- PgAdmin: http://localhost:5050

## 👤 Credenciais Padrão

| Usuário | Senha | Perfil |
|---------|-------|--------|
| admin | admin123 | Administrador |
| author1 | author123 | Autor |
| reviewer1 | reviewer123 | Revisor |
| approver1 | approver123 | Aprovador |

## 📁 Estrutura do Projeto

```
document-management-system/
├── frontend/           # Aplicação React
├── backend/           # API FastAPI
├── docker-compose.yml # Orquestração
└── README.md         # Documentação
```

## 🔒 Segurança

- Autenticação JWT com expiração configurável
- Criptografia de dados sensíveis com Fernet
- Validação de tipos MIME para uploads
- Limite de tamanho de arquivo (10MB)
- Auditoria completa de ações

## 📊 Funcionalidades

### Para Autores
- Upload de documentos PDF
- Edição de documentos em rascunho
- Submissão para revisão
- Visualização de feedback

### Para Revisores
- Lista de documentos pendentes
- Aprovação/rejeição com comentários
- Histórico de revisões

### Para Aprovadores
- Aprovação final de documentos
- Visualização do fluxo completo
- Comentários finais

### Para Administradores
- Gerenciamento de usuários
- Logs de auditoria
- Relatórios do sistema

## 🔄 Fluxo de Trabalho

1. **Criação**: Autor faz upload do PDF
2. **Submissão**: Documento enviado para revisão
3. **Revisão**: Revisor aprova ou rejeita
4. **Aprovação**: Se aprovado, vai para aprovador final
5. **Finalização**: Documento aprovado ou rejeitado

## 📝 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Usuário atual

### Documentos
- `POST /api/documents/upload` - Upload de documento
- `GET /api/documents` - Listar documentos
- `PUT /api/documents/{id}/submit` - Submeter para revisão
- `POST /api/documents/{id}/review` - Revisar documento
- `GET /api/documents/{id}/history` - Histórico

### Auditoria
- `GET /api/audit/logs` - Logs de auditoria

## 🐛 Troubleshooting

### Erro de conexão com banco
```bash
docker-compose down -v
docker-compose up --build
```

### Limpar volumes
```bash
docker-compose down -v
docker volume prune
```

## 📄 Licença

MIT License

## 👥 Suporte

Para suporte, abra uma issue no GitHub ou entre em contato.