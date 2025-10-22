# 🔒 Configurar HTTPS no Backend

## Problema
O frontend está em HTTPS (`ourhorrorstory.com.br`) mas o backend está em HTTP, causando erro de **Mixed Content**.

## Soluções

### ✅ Solução 1: Usar Ngrok (Mais Fácil)

Ngrok fornece HTTPS automaticamente:

```bash
# No servidor onde o backend está rodando
ngrok http 3001
```

Copie a URL HTTPS gerada (ex: `https://abc123.ngrok-free.app`) e use no `.env.production`.

**Vantagens:**
- ✅ HTTPS automático
- ✅ Sem configuração de certificado
- ✅ Funciona imediatamente

**Desvantagens:**
- ❌ URL muda toda vez que reinicia (use domínio fixo do ngrok)

---

### ✅ Solução 2: Configurar SSL/HTTPS no Backend

Se quiser usar o IP direto (`http://186.224.3.59:3001`), precisa adicionar SSL.

#### Passo 1: Obter Certificado SSL

**Opção A: Let's Encrypt (Gratuito)**
```bash
# Instalar certbot
sudo apt-get update
sudo apt-get install certbot

# Gerar certificado para seu domínio
sudo certbot certonly --standalone -d api.ourhorrorstory.com.br
```

**Opção B: Certificado Auto-Assinado (Desenvolvimento)**
```bash
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

#### Passo 2: Configurar Backend para HTTPS

**Arquivo: `APSA_MovieList/backend/src/server.ts`**

```typescript
import https from 'https';
import fs from 'fs';
import path from 'path';

// Configuração HTTPS
const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, '../ssl/key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../ssl/cert.pem'))
};

// Criar servidor HTTPS
const startServer = () => {
  const PORT = parseInt(env.PORT, 10) || 3001;
  
  https.createServer(httpsOptions, app).listen(PORT, '0.0.0.0', () => {
    console.log(`🔒 Servidor HTTPS rodando na porta ${PORT}`);
  });
};

startServer();
```

#### Passo 3: Atualizar `.env.production`

```env
VITE_API_URL=https://186.224.3.59:3001/api
```

---

### ✅ Solução 3: Usar Reverse Proxy com Nginx (Produção)

Configure Nginx como proxy reverso com SSL:

**Arquivo: `/etc/nginx/sites-available/api`**

```nginx
server {
    listen 443 ssl;
    server_name api.ourhorrorstory.com.br;

    ssl_certificate /etc/letsencrypt/live/api.ourhorrorstory.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.ourhorrorstory.com.br/privkey.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Ativar configuração:**
```bash
sudo ln -s /etc/nginx/sites-available/api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**Atualizar `.env.production`:**
```env
VITE_API_URL=https://api.ourhorrorstory.com.br/api
```

---

## 🎯 Recomendação

Para **desenvolvimento/teste rápido**: Use **ngrok** (Solução 1)

Para **produção**: Use **Nginx + Let's Encrypt** (Solução 3)

---

## 🔧 Checklist

- [ ] Backend rodando localmente na porta 3001
- [ ] Escolhi uma solução (ngrok, SSL direto, ou Nginx)
- [ ] Configurei certificado SSL (se aplicável)
- [ ] Atualizei `.env.production` com URL HTTPS
- [ ] Fiz rebuild do frontend (`npm run build`)
- [ ] Fiz deploy (`firebase deploy`)
- [ ] Testei no site em produção


