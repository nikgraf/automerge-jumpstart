## Setup and Run the Apps

```sh
pnpm install
docker-compose up
```

```sh
# in another tab
cd apps/backend
cp .env.example .env
# create OPAQUE_SERVER_SETUP and update the value in .env
npx @serenity-kit/opaque@latest create-server-setup
pnpm prisma migrate dev
pnpm dev
```

```sh
# in another tab
cd apps/frontend
pnpm dev
```

## Updating the Database Schema

1. Make changes
2. Run `pnpm prisma migrate dev`
3. Run `pnpm prisma generate`
4. Restart the TS server in your editor

## Setup Production Setup

1. Setup the Environment Variables DATABASE_URL & OPAQUE_SERVER_SETUP

## Connect to the Database

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

Currently there is no authorization per repository. If a user knows the ID they can read and write data.

### Todos

- use ephemeral messages to indicate activity
- production setup (websocket and hardcoded localhost for api) and client hardcoded on server (see TODO)
- password complexity
- produce video
