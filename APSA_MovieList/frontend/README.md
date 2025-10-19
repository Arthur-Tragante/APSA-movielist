# 🎬 Moicanos Toolkit - Frontend

Frontend em React + TypeScript para gerenciador colaborativo de filmes.

## 🚀 Início Rápido

```bash
# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env
# Edite .env com suas credenciais

# Executar em desenvolvimento
npm run dev
```

Acesse: http://localhost:5173

## 📋 Configuração

Edite o arquivo `.env` com suas credenciais:

- **Firebase**: Web SDK do console Firebase
- **TMDB**: Bearer Token de themoviedb.org
- **OMDB**: API Key de omdbapi.com

## 📚 Documentação Completa

Veja a [documentação principal](../../README.md) na raiz do projeto.

## 🏗️ Estrutura

```
src/
├── components/     # Componentes reutilizáveis
├── config/         # Configurações (Firebase)
├── constants/      # Constantes
├── hooks/          # Hooks customizados
├── pages/          # Páginas da aplicação
├── repositories/   # Acesso ao Firestore
├── services/       # Lógica de negócio
├── types/          # Tipos TypeScript
└── utils/          # Utilitários
```

## 📡 Scripts

- `npm run dev` - Desenvolvimento
- `npm run build` - Build produção
- `npm run preview` - Preview do build
- `npm run lint` - Verificar código

