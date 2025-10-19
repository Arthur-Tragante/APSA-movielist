# 🚀 Deploy Completo - Our Horror Story

## 🔧 CORREÇÕES APLICADAS

### 1. **CORS do Backend** ✅
Adicionado suporte para o domínio `ourhorrorstory.com.br`

### 2. **Passos para Deploy:**

---

## 📋 **Passo a Passo:**

### **1. Criar `.env.production` no Frontend**

Na pasta `APSA_MovieList/frontend/`, crie o arquivo `.env.production`:

```bash
# Backend API - Usar URL do Ngrok ou servidor
VITE_API_URL=https://6418c07d8c9b.ngrok-free.app/api

# Firebase Web SDK
VITE_FIREBASE_API_KEY=AIzaSyB8TcV_bvIgPa3mHmM6RkQzc8jRbVQ6HQE
VITE_FIREBASE_AUTH_DOMAIN=apsa-movielist.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=apsa-movielist
VITE_FIREBASE_STORAGE_BUCKET=apsa-movielist.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=115154298569
VITE_FIREBASE_APP_ID=1:115154298569:web:e0354e11fa9a86b10cec9d
```

### **2. Reiniciar o Backend com CORS Corrigido**

```bash
cd APSA_MovieList/backend
npm run dev
```

Verifique no terminal se aparece:
```
✅ CORS permitido para: https://ourhorrorstory.com.br
```

### **3. Atualizar URL do Ngrok (se mudou)**

Se a URL do ngrok mudou, atualize no `.env.production`:
```bash
VITE_API_URL=https://SUA_NOVA_URL.ngrok-free.app/api
```

### **4. Build e Deploy do Frontend**

```bash
cd APSA_MovieList/frontend

# Build com .env.production
npm run build

# Deploy no Firebase
firebase deploy
```

---

## ⚙️ **Configuração Firestore Rules**

Se ainda não configurou, acesse:
https://console.firebase.google.com/project/apsa-movielist/firestore/rules

Cole estas regras:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    match /movies/{movieId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null;
    }
    
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if false;
    }
  }
}
```

Clique em **"Publicar"**.

---

## 🧪 **Teste Completo**

1. **Backend rodando:**
   - Terminal mostra: `🚀 Servidor iniciado em http://localhost:3001`
   - Ngrok expondo: `https://SUA_URL.ngrok-free.app`

2. **Acesse o site:**
   - https://ourhorrorstory.com.br

3. **Faça login**

4. **Teste adicionar filme:**
   - Digite nome de um filme
   - Deve aparecer os cards com posters
   - Selecione um filme
   - Preencha detalhes
   - Salve

5. **Verifique logs do backend:**
   - Deve aparecer: `✅ CORS permitido para: https://ourhorrorstory.com.br`
   - Requisições de `/api/buscar/filme`, `/api/filmes`, etc.

---

## 🐛 **Troubleshooting**

### **Erro: CORS blocked**
- ✅ Backend foi reiniciado com as novas configurações?
- ✅ URL do ngrok está correta no `.env.production`?
- ✅ Fez novo build após atualizar `.env.production`?

### **Erro: Network Error**
- ✅ Backend está rodando?
- ✅ Ngrok está ativo?
- ✅ URL do ngrok está correta?

### **Erro: Missing or insufficient permissions**
- ✅ Configurou as regras do Firestore?
- ✅ Fez login no app?

---

## 📊 **Checklist Final**

- [ ] `.env.production` criado com URL do ngrok
- [ ] Backend reiniciado com CORS corrigido
- [ ] Frontend buildado com `npm run build`
- [ ] Frontend deployado com `firebase deploy`
- [ ] Firestore Rules configuradas
- [ ] Backend rodando localmente
- [ ] Ngrok expondo o backend
- [ ] Site acessível em https://ourhorrorstory.com.br
- [ ] Login funcionando
- [ ] Busca de filmes funcionando
- [ ] Salvamento de filmes funcionando

---

## 🎯 **Próximos Passos (Opcional)**

Para não depender do ngrok e do computador ligado:

1. **Deploy do Backend em Servidor:**
   - Railway: https://railway.app/
   - Render: https://render.com/
   - Heroku: https://heroku.com/
   - VPS/Cloud: DigitalOcean, AWS, Google Cloud

2. **Atualizar `.env.production`:**
   ```bash
   VITE_API_URL=https://seu-backend-producao.com/api
   ```

3. **Novo build e deploy:**
   ```bash
   npm run build
   firebase deploy
   ```

---

**Status:** 🟡 Pendente - Aguardando execução dos passos acima

**Última atualização:** 2025-10-19

