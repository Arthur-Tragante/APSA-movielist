# 🎬 APSA MovieList

Sistema completo de gerenciamento de filmes com avaliações de usuários e integração com APIs externas (TMDB e OMDB).

## 📋 Sobre o Projeto

Aplicação full-stack para cadastro, listagem e avaliação de filmes, com:
- 🔐 Autenticação via JWT + MongoDB
- 🎥 Busca automática de filmes (TMDB)
- ⭐ Sistema de avaliação (0-10 com meio ponto)
- 📊 Ratings externos (IMDb, Rotten Tomatoes, Metacritic)
- 💬 Comentários em avaliações
- 👥 Visualização de avaliações de todos os usuários

## 🏗️ Arquitetura

```
APSA_MovieList/
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── types/
│   └── package.json
│
├── backend/           # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── middlewares/
│   │   └── types/
│   └── package.json
│
└── README.md
```

## 🚀 Tecnologias

### Frontend
- **React 18** + **TypeScript**
- **Vite** (Build tool)
- **React Router** (Navegação)
- **Axios** (HTTP client)

### Backend
- **Node.js** + **Express**
- **TypeScript**
- **MongoDB** + **Mongoose** (Database)
- **JWT** (Autenticação)
- **Axios** (APIs externas)
- **Redis** (Cache - opcional)
- **Joi** (Validação)
- **Helmet** + **CORS** (Segurança)

### APIs Externas
- **TMDB** - The Movie Database (busca e detalhes)
- **OMDB** - Open Movie Database (ratings)

## ⚙️ Configuração

### 1. Pré-requisitos

- Node.js 18+
- MongoDB 7+
- npm ou yarn
- Chaves de API (TMDB e OMDB)

### 2. Clonar o repositório

```bash
git clone <url-do-repositorio>
cd APSA_MovieList
```

### 3. Configurar Backend

```bash
cd backend
npm install
```

Crie o arquivo `.env`:

```env
# Servidor
PORT=3001
NODE_ENV=development

# MongoDB
MONGODB_ENABLED=true
MONGODB_URI=mongodb://localhost:27017/apsa-movielist

# JWT
JWT_SECRET=sua-chave-secreta-aqui

# APIs Externas
TMDB_API_KEY=seu_bearer_token_tmdb
OMDB_API_KEY=sua_chave_omdb

# Redis (opcional)
REDIS_ENABLED=false

# CORS
CORS_ORIGIN=http://localhost:5173
```

### 4. Configurar Frontend

```bash
cd ../frontend
npm install
```

Crie o arquivo `.env`:

```env
# Backend API
VITE_API_URL=http://localhost:3001/api
```

## 🎯 Executar o Projeto

### Backend

```bash
cd backend
npm run dev
```

Servidor rodando em: `http://localhost:3001`

### Frontend

```bash
cd frontend
npm run dev
```

Aplicação rodando em: `http://localhost:5173`

## 📱 Funcionalidades

### Autenticação
- ✅ Login com email/senha
- ✅ Cadastro de usuários
- ✅ Recuperação de senha
- ✅ Logout

### Filmes
- ✅ Busca automática (TMDB)
- ✅ Cadastro com preenchimento automático
- ✅ Edição de filmes
- ✅ Exclusão de filmes
- ✅ Listagem com filtros

### Avaliações
- ✅ Sistema de estrelas (0-10, meio ponto)
- ✅ Comentários opcionais
- ✅ Visualização de avaliações de todos os usuários
- ✅ Média de avaliações
- ✅ Ratings externos (IMDb, Rotten Tomatoes, Metacritic)

## 🔒 Segurança

- ✅ Chaves de API no backend (não expostas no frontend)
- ✅ Autenticação JWT
- ✅ Rate limiting
- ✅ CORS configurado
- ✅ Helmet (security headers)
- ✅ Validação de dados (Joi)

## 📦 Build para Produção

### Backend

```bash
cd backend
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm run build
```

Os arquivos de produção estarão em `frontend/dist/`

## 🐳 Docker (Opcional)

```bash
cd backend
docker-compose up -d
```

## 📄 Documentação Adicional

- `COMO_OBTER_CHAVES_API.md` - Como obter chaves TMDB/OMDB
- `backend/README.md` - Documentação detalhada da API
- `backend/DEPLOY.md` - Guia de deploy do backend

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Autor

**Arthur Tragante**

---

⭐ Se este projeto foi útil, deixe uma estrela!
