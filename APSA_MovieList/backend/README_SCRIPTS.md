# 🛠️ Scripts de Manutenção

## 📷 Adicionar Capas aos Filmes Existentes

Este script busca todos os filmes na collection `movies` do Firestore e adiciona capas (posters) automaticamente buscando no TMDB.

### Como Usar:

```bash
cd APSA_MovieList/backend
npm run script:capas
```

### O que o script faz:

1. ✅ Lista todos os filmes no Firestore
2. 🔍 Para cada filme **sem capa**:
   - Busca no TMDB pelo título
   - Pega a URL do poster (alta qualidade)
   - Salva no campo `poster` do Firestore
3. ⏱️ Aguarda 250ms entre cada requisição (evita rate limit)
4. 📊 Mostra relatório final

### Exemplo de Output:

```
🎬 Iniciando busca de capas para filmes existentes...

📊 Total de filmes encontrados: 25

🎬 [1/25] A Freira / The Nun
   ✅ Já tem capa: https://image.tmdb.org/t/p/w500/...

🎬 [2/25] Annabelle / Annabelle
   🔍 Buscando: "Annabelle" (2014)
   ✅ Capa encontrada: https://image.tmdb.org/t/p/w500/...
   💾 Poster salvo no Firestore

🎬 [3/25] O Exorcista / The Exorcist
   🔍 Buscando: "O Exorcista" (1973)
   ✅ Capa encontrada: https://image.tmdb.org/t/p/w500/...
   💾 Poster salvo no Firestore

...

============================================================
📊 RESUMO FINAL:
============================================================
✅ Total processados: 25
📷 Já tinham capa: 3
➕ Capas adicionadas: 20
❌ Erros/não encontrados: 2
============================================================

🎉 Script concluído!
```

### Requisitos:

- ✅ `TMDB_API_KEY` configurada no `.env`
- ✅ Firebase Admin SDK configurado
- ✅ Backend instalado (`npm install`)

### Notas:

- 🔒 **Seguro**: Não sobrescreve capas já existentes
- ⚡ **Rápido**: Processa ~4 filmes por segundo
- 🎯 **Inteligente**: Remove " / Nome Original" do título ao buscar
- 🔄 **Idempotente**: Pode executar múltiplas vezes sem problemas

### Troubleshooting:

**Erro: TMDB_API_KEY não configurada**
- Solução: Configure a chave no arquivo `.env` do backend

**Erro: Filme não encontrado no TMDB**
- Solução: O título pode estar diferente no TMDB
- Edite manualmente o filme e busque novamente

**Rate Limit (429)**
- Solução: O script já tem delay de 250ms
- Se persistir, aumente o delay no código (linha com `aguardar(250)`)


