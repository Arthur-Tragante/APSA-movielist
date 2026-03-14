# 🚀 Deploy Completo - Our Horror Story

## ✅ Sistema Migrado

O sistema foi migrado do Firebase para uma infraestrutura self-hosted:

- **Autenticação:** JWT próprio (sem Firebase Auth)
- **Banco de dados:** MongoDB local (sem Firestore)
- **Hospedagem:** Docker + Nginx Proxy Manager (sem Firebase Hosting)

## 📋 Arquitetura Atual

```
Internet
    │
    ▼ porta 8000
┌─────────────────────────────────┐
│     Nginx Proxy Manager         │
│  (SSL termination + routing)    │
├─────────────────────────────────┤
│ ourhorrorstory.com.br → frontend│
│ home.ourhorrorstory.com.br → API│
└─────────────────────────────────┘
    │                 │
    ▼                 ▼
┌─────────┐     ┌─────────┐
│Frontend │     │ Backend │
│ (nginx) │     │ (Node)  │
│ :80     │     │ :3001   │
└─────────┘     └─────────┘
                    │
                    ▼
              ┌───────────┐
              │  MongoDB  │
              │  :27017   │
              └───────────┘
```

## 🚀 Deploy

### 1. Pré-requisitos

- Docker Desktop instalado
- MongoDB rodando localmente
- Domínios apontando para seu IP público
- Porta 8000 aberta no router

### 2. Subir os Containers

```bash
cd C:\Users\Arthur\reverse-proxy\npm
docker-compose up -d
```

### 3. Configurar Nginx Proxy Manager

Acesse http://localhost:8081 e configure os Proxy Hosts:

**Frontend:**
- Domain: `ourhorrorstory.com.br`
- Forward: `apsa_frontend:80`
- SSL: Certificado customizado

**Backend:**
- Domain: `home.ourhorrorstory.com.br`
- Forward: `apsa_backend:3001`
- SSL: Certificado customizado

## 🔄 Rebuild após Mudanças

```bash
# Frontend
docker-compose build --no-cache apsa-frontend
docker-compose up -d apsa-frontend

# Backend
docker-compose build --no-cache apsa-backend
docker-compose up -d apsa-backend
```

## 📊 URLs

| Serviço | URL |
|---------|-----|
| Frontend | https://ourhorrorstory.com.br:8000 |
| Backend API | https://home.ourhorrorstory.com.br:8000/api |
| NPM Admin | http://localhost:8081 |

## 📦 Backup

Backup automático diário às 6h para Google Drive.
Veja [../../BACKUP.md](../../BACKUP.md) para detalhes.

## 🧪 Testar

1. Acesse https://ourhorrorstory.com.br:8000
2. Faça login
3. Adicione/edite filmes
4. Verifique logs: `docker-compose logs -f apsa-backend`

---

**Status:** ✅ Funcionando

**Última atualização:** 2026-03-13
