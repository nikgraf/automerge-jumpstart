## Setup and Run the Apps

```sh
pnpm install
docker-compose up
# in another tab
cd apps/backend
cp .env.example .env
pnpm prisma migrate dev
pnpm dev
```

```sh
# in another tab
cd apps/frontend
pnpm dev
```

## Connect to the Database

```sh
fly postgres connect -a automerge-packing-list-db
```

```sh
# list dbs
\list;
# connect to a db
\c automerge_packing_list;
# list tables
\dt
# query a table
SELECT * FROM "Repository";
```
