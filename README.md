# Prime X-Press Cleaning

React/Vite website with Supabase Auth and PostgreSQL booking authorization.

## Local development

Use Bun 1.4.2 and Node 22 or newer.

```sh
bun install --frozen-lockfile --ignore-scripts
bun run dev
```

The browser uses a public Supabase publishable key. Override `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for another project. Never put a Supabase secret/service-role key in a `VITE_` variable.

## Checks

```sh
bun test tests
bun run lint
bun run build
bun audit
```

Database authorization tests run against disposable local PGlite PostgreSQL fixtures. They never connect to the production database. GitHub Actions runs these checks and CodeQL on pushes and pull requests; third-party actions are pinned to commit SHAs.

See [authentication and deployment](docs/AUTHENTICATION.md) for components, request flow, token handling, admin access, migration and remaining operational controls.
