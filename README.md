## Setup and Run the Apps

```sh
pnpm install
docker-compose up
# in another tab
cd apps/backend
pnpm prisma migrate dev
pnpm dev
```

```sh
# in another tab
cd apps/frontend
pnpm dev
```
