# 🚀 Guia de Deploy - Moicanos Backend

Instruções detalhadas para deploy em diferentes plataformas.

---

## 📋 Pré-Deploy Checklist

- [ ] Variáveis de ambiente configuradas
- [ ] Firebase Admin SDK configurado
- [ ] Chaves de API obtidas (TMDB, OMDB)
- [ ] Build testado localmente
- [ ] Testes passando
- [ ] Redis configurado (ou desabilitado)
- [ ] CORS_ORIGIN atualizado para domínio de produção

---

## 🌐 Opções de Deploy

### 1. Railway (Recomendado - Mais Fácil)

**Vantagens:**
- Deploy automático via GitHub
- Redis incluído gratuitamente
- SSL automático
- $5/mês de crédito grátis

**Passos:**

1. **Conecte seu repositório:**
   - Acesse [railway.app](https://railway.app)
   - Clique em "New Project" → "Deploy from GitHub"
   - Selecione o repositório

2. **Adicione Redis:**
   - No projeto, clique em "New" → "Database" → "Redis"

3. **Configure Variáveis de Ambiente:**
   ```
   NODE_ENV=production
   PORT=3001
   FIREBASE_PROJECT_ID=...
   FIREBASE_CLIENT_EMAIL=...
   FIREBASE_PRIVATE_KEY=...
   TMDB_API_KEY=...
   OMDB_API_KEY=...
   REDIS_ENABLED=true
   REDIS_URL=${{Redis.REDIS_URL}}
   CORS_ORIGIN=https://seu-frontend.vercel.app
   ```

4. **Deploy:**
   - Railway faz deploy automático
   - URL gerada: `https://seu-app.up.railway.app`

---

### 2. Render

**Vantagens:**
- Free tier generoso
- Deploy fácil
- SSL automático

**Passos:**

1. **Crie Web Service:**
   - Acesse [render.com](https://render.com)
   - New → Web Service
   - Conecte repositório GitHub

2. **Configurações:**
   ```
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

3. **Adicione Redis:**
   - New → Redis
   - Copie a URL interna

4. **Variáveis de Ambiente:**
   (mesmas do Railway)

---

### 3. DigitalOcean App Platform

**Vantagens:**
- Controle total
- Escalabilidade
- $5-10/mês

**Passos:**

1. **Criar App:**
   - Painel → Apps → Create App
   - Conecte GitHub

2. **Configure:**
   ```
   Type: Web Service
   Build Command: npm install && npm run build
   Run Command: npm start
   HTTP Port: 3001
   ```

3. **Adicione Redis:**
   - Dev Database → Redis

4. **Variáveis de Ambiente:**
   (mesmas anteriores)

---

### 4. Docker + VPS (AWS, GCP, Azure)

**Vantagens:**
- Controle total
- Mais barato em escala
- Customização completa

#### 4.1. AWS EC2

1. **Criar Instância EC2:**
   ```bash
   # t2.micro (free tier)
   Ubuntu 22.04 LTS
   ```

2. **Conectar via SSH:**
   ```bash
   ssh -i sua-chave.pem ubuntu@ip-publico
   ```

3. **Instalar Docker:**
   ```bash
   sudo apt update
   sudo apt install docker.io docker-compose
   sudo usermod -aG docker ubuntu
   ```

4. **Clonar Repositório:**
   ```bash
   git clone seu-repositorio
   cd moicanos-backend
   ```

5. **Configurar .env:**
   ```bash
   nano .env
   # Cole suas variáveis
   ```

6. **Subir com Docker:**
   ```bash
   docker-compose up -d
   ```

7. **Configurar Nginx (opcional):**
   ```nginx
   server {
       listen 80;
       server_name api.seudominio.com;
       
       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

8. **SSL com Certbot:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.seudominio.com
   ```

#### 4.2. Google Cloud Run

1. **Instalar gcloud CLI:**
   ```bash
   curl https://sdk.cloud.google.com | bash
   gcloud init
   ```

2. **Build e Push:**
   ```bash
   gcloud builds submit --tag gcr.io/SEU_PROJETO/moicanos-backend
   ```

3. **Deploy:**
   ```bash
   gcloud run deploy moicanos-backend \
     --image gcr.io/SEU_PROJETO/moicanos-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

4. **Variáveis de Ambiente:**
   - Console GCP → Cloud Run → Edit & Deploy → Variables

---

## 🔐 Segurança em Produção

### 1. Variáveis de Ambiente

**NUNCA** commite `.env` para o Git!

Use secrets da plataforma:

```bash
# Railway
railway variables set FIREBASE_PRIVATE_KEY="..."

# Render
# Via dashboard → Environment

# Docker
docker secret create firebase_key firebase_key.json
```

### 2. HTTPS Obrigatório

Em produção, SEMPRE use HTTPS:

```typescript
// src/app.ts (adicionar em produção)
if (env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(`https://${req.header('host')}${req.url}`);
    }
    next();
  });
}
```

### 3. Rate Limiting Mais Agressivo

```typescript
// Produção
RATE_LIMIT_WINDOW_MS=600000  // 10 minutos
RATE_LIMIT_MAX_REQUESTS=50    // 50 requisições
```

---

## 📊 Monitoramento

### 1. Logs

#### Railway
```bash
railway logs
```

#### Render
Dashboard → Logs

#### Docker
```bash
docker-compose logs -f --tail=100
```

### 2. Uptime Monitoring

Configurar em:
- [UptimeRobot](https://uptimerobot.com) (grátis)
- [Pingdom](https://www.pingdom.com)
- [StatusCake](https://www.statuscake.com)

Endpoint para monitorar:
```
https://sua-api.com/api/health
```

### 3. Error Tracking

Integrar Sentry:

```bash
npm install @sentry/node
```

```typescript
// src/server.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: env.NODE_ENV,
});
```

---

## 🔄 CI/CD

### GitHub Actions

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy Backend

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: cd backend && npm ci
      - run: cd backend && npm run lint
      - run: cd backend && npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          npm install -g @railway/cli
          railway up
```

---

## 🚨 Rollback

### Railway
```bash
railway rollback
```

### Render
Dashboard → Deployments → Redeploy anterior

### Docker
```bash
# Voltar para versão anterior
docker-compose down
git checkout HEAD~1
docker-compose up -d --build
```

---

## 📈 Escalabilidade

### Horizontal Scaling

#### Railway/Render
- Dashboard → Scale → Aumentar replicas

#### Docker Swarm
```bash
docker service scale moicanos-backend=3
```

#### Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: moicanos-backend
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: backend
        image: moicanos-backend:latest
```

### Load Balancer

Nginx upstream:

```nginx
upstream backend {
    server backend1:3001;
    server backend2:3001;
    server backend3:3001;
}

server {
    location / {
        proxy_pass http://backend;
    }
}
```

---

## 💰 Custos Estimados

### Opção 1: Railway (Hobby)
- **Backend**: $5/mês
- **Redis**: Incluído
- **Total**: **$5/mês**

### Opção 2: Render (Starter)
- **Backend**: $7/mês
- **Redis**: $10/mês
- **Total**: **$17/mês**

### Opção 3: DigitalOcean
- **Droplet**: $4-6/mês
- **Redis**: $15/mês
- **Total**: **$19-21/mês**

### Opção 4: AWS (Free Tier)
- **EC2 t2.micro**: Grátis 1 ano
- **ElastiCache**: $15/mês
- **Total**: **$0-15/mês**

---

## ✅ Checklist Pós-Deploy

- [ ] API responde em `/api/health`
- [ ] Autenticação funcionando
- [ ] CRUD de filmes funcionando
- [ ] APIs externas (TMDB/OMDB) funcionando
- [ ] Cache Redis funcionando
- [ ] Rate limiting ativo
- [ ] Logs sendo gerados
- [ ] Monitoring configurado
- [ ] Frontend conectado ao backend
- [ ] CORS configurado corretamente
- [ ] SSL/HTTPS ativo
- [ ] Backup automático (Firestore)

---

## 🆘 Suporte

Se encontrar problemas:

1. Verifique logs: `docker-compose logs -f`
2. Teste health check: `curl https://sua-api.com/api/health`
3. Valide variáveis de ambiente
4. Verifique conectividade Firebase
5. Teste autenticação manualmente

---

**Deploy realizado com sucesso!** 🎉

