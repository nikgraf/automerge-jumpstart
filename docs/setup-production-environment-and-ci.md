# Setup Production Environment and CI

## Update API endpoints and CORS settings

- In `app/app/src/constants.ts` update `apiProductionHost` to your API host.
- In `apps/server/src/index.ts` update `https://livelist.vercel.app` to your frontend origin.

## Setup Backend

- Open `fly.toml` and change the app name to the desired name
- Go to `apps/server` and run `fly launch` (tweak the configuration as needed, make sure a Postgres database is added)
- Generate a new OPAQUE server setup and set the `OPAQUE_SERVER_SETUP` secret in your fly.io app
- Get the Fly.io Api token from [https://fly.io/user/personal_access_tokens](https://fly.io/user/personal_access_tokens) and add it to the GitHub repository secrets as `FLY_API_TOKEN`

## Setup Frontend

- Create a new Vercel project (not necessary to connect it to the Repository)
- Get the Vercel project ID and add it to the GitHub repository secrets as `VERCEL_PROJECT_ID`
- Get the Vercel token and add it to the GitHub repository as `VERCEL_TOKEN`
- Get the Vercel organization ID and add it to the GitHub repository as `VERCEL_ORG_ID`

## Why deploy from the CI?

While it is possible to deploy from Vercel at a later stage we want to ensure that the backend with possible API additions is deployed first. This is not the case yet.
