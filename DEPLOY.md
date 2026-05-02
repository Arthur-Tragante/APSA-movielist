# Deploy via Portainer

Estrutura: 3 stacks separadas no Portainer.

```
mongo-stack/        -> MongoDB compartilhado (rede externa shared-mongo-net)
  docker-compose.yml
  docker-compose.restore.yml
  .env.example

APSA_MovieList/     -> backend + frontend + redis (consome o Mongo via rede externa)
  docker-compose.yml
  .env.example
```

Outro projeto que precisar do Mongo só anexa na rede `shared-mongo-net` e usa a hostname `shared-mongo:27017`.

---

## 1) Stack `shared-mongo`

No Portainer -> Stacks -> Add stack -> nome `shared-mongo`.

- **Web editor**: cole o conteúdo de `mongo-stack/docker-compose.yml`.
- **Environment variables**: defina ao menos:
  - `MONGO_ROOT_USER` (ex: `root`)
  - `MONGO_ROOT_PASSWORD` (senha forte; **evite `@ : / # ?`** pra não ter que URL-encode na URI dos apps)
  - `MONGO_PORT` (default `27017`; mude se já tiver outro Mongo no host)
- Deploy.

A rede `shared-mongo-net` e o volume `shared-mongo-data` são criados automaticamente com esses nomes (definidos como `name:` no compose), então outros stacks vão achar como `external: true`.

Verifique nos logs do container `shared-mongo` que apareceu `Waiting for connections`.

---

## 2) Restaurar o dump (executa uma vez)

O dump em `APSA_MovieList/mongodump_apsa-movielist_20260502_022908/apsa-movielist/` precisa estar **acessível pelo daemon Docker do host do Portainer**.

### 2.1 Subir o dump pro host

Se o Portainer está em outra máquina:

```bash
scp -r APSA_MovieList/mongodump_apsa-movielist_20260502_022908 \
    USER@HOST:/opt/mongo-restore/
```

Se está no mesmo host, copie pra um caminho estável:

```bash
sudo mkdir -p /opt/mongo-restore
sudo cp -r APSA_MovieList/mongodump_apsa-movielist_20260502_022908 /opt/mongo-restore/
```

Caminho final que vamos usar — **pasta PAI** (contém o subdiretório `apsa-movielist/`, NÃO a pasta com os .bson direto):
```
/opt/mongo-restore/mongodump_apsa-movielist_20260502_022908
```

### 2.2 Subir o stack de restore

No Portainer -> Stacks -> Add stack -> nome `mongo-restore`.

- **Web editor**: cole `mongo-stack/docker-compose.restore.yml`.
- **Environment variables**:
  - `MONGO_ROOT_USER` = mesmo do stack `shared-mongo`
  - `MONGO_ROOT_PASSWORD` = mesmo do stack `shared-mongo`
  - `DUMP_PATH` = caminho absoluto **no host** da pasta PAI (que contém o subdiretório `apsa-movielist/`). Ex.: `/opt/mongo-restore/mongodump_apsa-movielist_20260502_022908`
  - `DUMP_DB_NAME` = `apsa-movielist`
  - `TARGET_DB_NAME` = `apsa-movielist`
  - `DROP_BEFORE_RESTORE` = `false` (use `true` só se quiser apagar dados existentes antes)
- Deploy.

O container `shared-mongo-restore` vai rodar uma vez, restaurar e sair com status 0. Confira o log: deve terminar com `Restore concluído.`

Depois pode **apagar essa stack**, ela não precisa ficar rodando.

---

## 3) Stack `apsa-movielist`

Pré-requisito: o stack `shared-mongo` precisa estar rodando (a rede `shared-mongo-net` precisa existir).

No Portainer -> Stacks -> Add stack -> nome `apsa-movielist`.

- **Build context**: o Portainer precisa ter acesso ao código (os Dockerfiles do backend e frontend estão em `APSA_MovieList/backend/` e `APSA_MovieList/frontend/`). Opções:
  1. **Git deploy**: aponta o stack pro repositório, branch e caminho `docker-compose.yml`. Mais simples.
  2. **Upload**: empacota a pasta `APSA_MovieList/` e faz upload no Portainer.
- **Environment variables**: copie tudo de `.env.example` e preencha:
  - `MONGO_ROOT_USER` / `MONGO_ROOT_PASSWORD` -> mesmos do `shared-mongo`
  - `MONGO_DB_NAME` = `apsa-movielist`
  - `JWT_SECRET` -> gere com `openssl rand -hex 32`
  - `TMDB_API_KEY`, `OMDB_API_KEY`
  - `CORS_ORIGIN` e `FRONTEND_URL` -> URL pública do frontend (ex.: `http://SEU_HOST:8080`)
  - `VITE_API_URL` -> URL pública do backend (ex.: `http://SEU_HOST:3001/api`). **Importante:** isso é build-time, é embutido no bundle. Se mudar depois, é preciso rebuild.
  - SMTP/Discord -> opcionais
- Deploy.

Acesse:
- Frontend: `http://SEU_HOST:8080`
- Backend health: `http://SEU_HOST:3001/api/health`

---

## 4) Outro projeto usando o mesmo Mongo

No `docker-compose.yml` do outro projeto:

```yaml
services:
  app:
    # ...
    environment:
      MONGODB_URI: mongodb://USER:PASS@shared-mongo:27017/NOME_DA_DB?authSource=admin
    networks:
      - app-net
      - shared-mongo-net

networks:
  app-net:
    driver: bridge
  shared-mongo-net:
    name: shared-mongo-net
    external: true
```

Recomendado: criar um usuário dedicado para esse outro projeto (não usar root). Conecte no Mongo e rode:

```js
use outroProjetoDb
db.createUser({
  user: "outro_app",
  pwd: "senha-forte",
  roles: [ { role: "readWrite", db: "outroProjetoDb" } ]
})
```

E aí esse projeto usa `mongodb://outro_app:senha-forte@shared-mongo:27017/outroProjetoDb?authSource=outroProjetoDb`.

---

## Testando localmente antes do Portainer

Na sua máquina, do diretório `mongo-stack/`:

```bash
cp .env.example .env
# edite .env e ajuste DUMP_PATH para o caminho real do dump
docker compose up -d
docker compose -f docker-compose.restore.yml --env-file .env up
```

Depois, do diretório `APSA_MovieList/`:

```bash
cp .env.example .env
# edite com os mesmos MONGO_ROOT_USER/PASSWORD
docker compose up -d --build
```

Acesse `http://localhost:8080`.
