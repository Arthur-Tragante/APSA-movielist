# 🔒 Como Configurar SSL no Backend

## ✅ Passo a Passo

### 1. Coloque os Certificados na Pasta `ssl`

Os certificados devem estar em:
```
APSA_MovieList/backend/ssl/
  ├── key.pem   (chave privada)
  └── cert.pem  (certificado)
```

---

### 2. Formas de Obter Certificados

#### **Opção A: Certificado Auto-Assinado (Desenvolvimento/Teste)**

```bash
cd APSA_MovieList/backend
mkdir -p ssl
cd ssl

# Gerar certificado auto-assinado válido por 365 dias
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

**Preenchimento:**
- Country Name: BR
- State: Seu Estado
- Locality: Sua Cidade
- Organization: Seu Nome/Empresa
- Common Name: Seu IP ou domínio (ex: 186.224.3.59)

⚠️ **Nota**: Certificados auto-assinados funcionam, mas browsers mostrarão aviso de "não seguro".

---

#### **Opção B: Let's Encrypt (Produção - Gratuito)**

**Requer um domínio apontando para seu servidor!**

```bash
# Instalar certbot
sudo apt-get update
sudo apt-get install certbot

# Gerar certificado (substitua pelo seu domínio)
sudo certbot certonly --standalone -d api.ourhorrorstory.com.br

# Copiar certificados para pasta do projeto
sudo cp /etc/letsencrypt/live/api.ourhorrorstory.com.br/privkey.pem ~/APSA_MovieList/backend/ssl/key.pem
sudo cp /etc/letsencrypt/live/api.ourhorrorstory.com.br/fullchain.pem ~/APSA_MovieList/backend/ssl/cert.pem

# Ajustar permissões
sudo chown $USER:$USER ~/APSA_MovieList/backend/ssl/*.pem
chmod 600 ~/APSA_MovieList/backend/ssl/key.pem
```

---

#### **Opção C: Certificado de Provedor (Produção Pago)**

Se você comprou um certificado SSL:

1. Baixe os arquivos do provedor:
   - Chave privada (geralmente `.key`)
   - Certificado (geralmente `.crt` ou `.pem`)

2. Renomeie e copie:
```bash
cp sua-chave-privada.key APSA_MovieList/backend/ssl/key.pem
cp seu-certificado.crt APSA_MovieList/backend/ssl/cert.pem
```

---

### 3. Verificar Certificados

```bash
cd APSA_MovieList/backend/ssl

# Verificar chave privada
openssl rsa -in key.pem -check

# Verificar certificado
openssl x509 -in cert.pem -text -noout

# Verificar se chave e certificado combinam
openssl x509 -noout -modulus -in cert.pem | openssl md5
openssl rsa -noout -modulus -in key.pem | openssl md5
# Os dois MD5 devem ser idênticos!
```

---

### 4. Reiniciar Backend

```bash
cd APSA_MovieList/backend
npm run dev
```

**Output esperado:**
```
🚀 Servidor HTTPS iniciado com sucesso!
🔒 Rodando em: https://0.0.0.0:3001
🌍 Ambiente: development
🔗 Health check: https://localhost:3001/api/health
✅ SSL/TLS habilitado
```

---

### 5. Atualizar Frontend

**Arquivo: `APSA_MovieList/frontend/.env.production`**

```env
VITE_API_URL=https://186.224.3.59:3001/api
```

**Rebuild e deploy:**
```bash
cd APSA_MovieList/frontend
Remove-Item -Recurse -Force dist
npm run build
firebase deploy
```

---

### 6. Testar

```bash
# Testar health check
curl -k https://186.224.3.59:3001/api/health

# Testar do frontend
# Abra: https://ourhorrorstory.com.br/adicionar
# Busque por um filme
```

---

## 🔧 Troubleshooting

### Erro: "ENOENT: no such file or directory"
- **Causa**: Certificados não estão na pasta `ssl/`
- **Solução**: Verifique se os arquivos estão em `APSA_MovieList/backend/ssl/key.pem` e `cert.pem`

### Erro: "error:0906D06C:PEM routines"
- **Causa**: Formato do certificado inválido
- **Solução**: Certifique-se que os arquivos são `.pem` válidos

### Browser mostra "Não seguro" mesmo com HTTPS
- **Causa**: Certificado auto-assinado
- **Solução Normal**: Isso é esperado para certificados auto-assinados
- **Solução Produção**: Use Let's Encrypt ou certificado válido

### Erro: "Mixed Content" ainda aparece
- **Causa**: Frontend ainda está usando HTTP no `.env.production`
- **Solução**: Confirme que o URL no `.env.production` começa com `https://`

---

## 📝 Checklist Final

- [ ] Certificados em `APSA_MovieList/backend/ssl/`
- [ ] Backend rodando com mensagem "SSL/TLS habilitado"
- [ ] `.env.production` com `https://` (não `http://`)
- [ ] Frontend rebuil e deployed
- [ ] Teste funcional no site em produção

---

## 🎯 Estrutura Final

```
APSA_MovieList/backend/
├── ssl/
│   ├── .gitkeep
│   ├── key.pem      ← Sua chave privada
│   └── cert.pem     ← Seu certificado
├── src/
│   └── server.ts    ← Ajustado para HTTPS
└── ...
```

---

## 💡 Dica

O código agora detecta automaticamente:
- ✅ **Se houver certificados**: Usa HTTPS
- ⚠️ **Se NÃO houver certificados**: Usa HTTP (com aviso)

Então basta adicionar os certificados e reiniciar!



