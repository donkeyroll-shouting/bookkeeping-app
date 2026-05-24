# Bookkeeping App

A small private bookkeeping dashboard built with Next.js. It tracks income and expenses from a local CSV file, displays summary metrics and charts, and supports manual entry, CSV import, batch deletion, and year-partitioned CSV export.

## Features

- Credentials-protected dashboard
- Income, expense, and net balance KPI cards
- Year filter for analytics and transaction review
- Asset growth line chart
- Expense breakdown pie chart with top-category grouping
- Add single transactions from the UI
- Import transactions from CSV with an editable preview table
- Select and delete multiple transactions
- Export transactions into `exports/{year}.csv`
- Docker and Makefile workflow for local container runs

## Tech Stack

- Next.js App Router
- React and TypeScript
- NextAuth credentials provider
- Tailwind CSS
- Radix UI primitives
- Recharts
- PapaParse
- Local CSV file storage

## Project Layout

```text
app/
  actions.ts                    Server actions for transaction mutations and export
  dashboard/                    Protected dashboard route
  login/                        Login route
  api/auth/[...nextauth]/       NextAuth route handlers
components/
  dashboard/                    Dashboard charts, table, and modals
  ui/                           Shared UI primitives
lib/
  csvStore.ts                   CSV-backed transaction service
data/
  transactions.csv              Local transaction data
exports/                        Generated CSV exports, created at runtime
```

## Local Development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Default demo credentials:

```text
Username: admin
Password: admin
```

## Environment

The app can run locally without an environment file because `auth.ts` has a development fallback secret. For anything beyond local development, set a real secret:

```bash
AUTH_SECRET="replace-with-a-long-random-secret"
```

If you run behind a hosted URL, also set the public auth URL expected by your deployment environment.

```bash
NEXTAUTH_URL="https://your-app.example.com"
```

## CSV Data

The app stores transactions in:

```text
data/transactions.csv
```

Expected columns:

```csv
id,date,type,amount,category,description
```

`type` should be either `Income` or `Expense`.

When the file does not exist, the app creates it with only headers. Imports may preserve an `id` column if present; otherwise the server generates UUIDs.

## Docker

Build the image:

```bash
make build
```

Run the container:

```bash
make run
```

Open:

```text
http://localhost:3000
```

If a container with the same name already exists, restart it instead:

```bash
make restart
```

Run on a different host port:

```bash
make HOST_PORT=3102 run
```

Stop and remove the container:

```bash
make stop
```

Run the full container smoke test:

```bash
make test
```

The smoke test builds the image, restarts the container, checks `/`, `/login`, and `/dashboard`, then leaves the container running for inspection.

## Make Targets

```text
make help      Show available targets
make build     Build the Docker image
make run       Start the container
make restart   Stop any existing container and start a fresh one
make stop      Stop and remove the container
make logs      Follow container logs
make shell     Open a shell in the running container
make smoke     Check HTTP responses from a running container
make test      Build, restart, and smoke-test the container
make clean     Stop the container and remove the image
```

## Container Persistence

The container runs as a non-root user and has writable `data/` and `exports/` directories.

By default, those directories live inside the container filesystem. That means transaction changes and exports are ephemeral: they disappear when the container is removed or replaced. For persistent data, mount a volume:

```bash
docker run -d \
  --name bookkeeping-app-container \
  -p 3000:3000 \
  -e PORT=3000 \
  -e AUTH_SECRET="replace-with-a-long-random-secret" \
  -v "$(pwd)/data:/app/data" \
  -v "$(pwd)/exports:/app/exports" \
  bookkeeping-app
```

## Production Notes

- Replace the hardcoded demo credentials before using this with real financial data.
- Set `AUTH_SECRET` to a strong secret.
- Mount persistent storage or replace the CSV store with an external database if data must survive deployments.
- `npm install` currently reports security advisories for the installed dependency tree; review and upgrade dependencies before production use.
