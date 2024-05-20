## Development

### Setup

```sh
pnpm install
docker-compose up
```

```sh
# in another tab
cd apps/backend
cp .env.example .env
npx @serenity-kit/opaque@latest create-server-setup
# copy the string value as OPAQUE_SERVER_SETUP .env
pnpm prisma migrate dev
pnpm dev
```

```sh
# in another tab
cd apps/frontend
pnpm dev
```

### Updating the Database Schema

1. Make changes
2. Run `pnpm prisma migrate dev`
3. Run `pnpm prisma generate`
4. Restart the TS server in your editor

### DB UI

```bash
cd apps/backend
pnpm prisma studio
```

### Wipe all local data

```bash
cd apps/backend
pnpm prisma migrate reset
```

## Setup Production Environment and CI

see [docs/setup-production-environment-and-ci.md](docs/setup-production-environment-and-ci.md)

## Connect to the Production Database

```sh
fly postgres connect -a automerge-livelist-db
```

```sh
# list dbs
\list;
# connect to a db
\c automerge_livelist;
# list tables
\dt
# query a table
SELECT * FROM "Document";
```

## Architecture

### Authentication

Users use OPAQUE to authenticate with the server. After Login the server creates a session and stores it as HTTP-Only Cookie. The session is used to authenticate the user for authenticated requests and also to connect to the Websocket.
