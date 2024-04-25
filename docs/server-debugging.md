# Server Debugging

To see the logs of the fly.io backend server replace `<app_name>` with the name of the app defined in `apps/server/fly.toml`.

```bash
cd apps/server
fly logs --app=<app_name>
# e.g. fly logs --app=automerge-jumpstart
```
