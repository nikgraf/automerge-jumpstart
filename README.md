# Automerge Jumpstart

A comprehensive boilerplate for building real-time
collaborative editing applications with Automerge, React,
tRPC, and more.

Website incl. explanation videos: [https://www.automerge-jumpstart.com/](https://www.automerge-jumpstart.com/)

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
pnpm prisma generate
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
fly postgres connect -a automerge-jumpstart-db
```

```sh
# list dbs
\list;
# connect to a db
\c automerge_jumpstart;
# list tables
\dt
# query a table
SELECT * FROM "Document";
```

## Upgrading Dependencies

Note: Automerge version is pinned in the root `package.json` file to avoid issues arising from different automerge versions.

```sh
pnpm up --interactive
cd apps/app
pnpm up --interactive
cd apps/server
pnpm up --interactive
```

## Architecture

### Authentication

Users use OPAQUE to authenticate with the server. After Login the server creates a session in the database which includes Opaque's `sessionKey`. The `sessionKey` is used as `bearer` token to authenticate the user for authenticated requests and also to connect to the Websocket.
