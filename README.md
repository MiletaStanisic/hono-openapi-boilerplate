# Event Production Control API

OpenAPI-first backend for managing live events — built on **Hono + Zod + TypeScript** with strict lint/test/build and agent governance.

Pairs with the event planner frontend. All endpoints are fully documented at `/docs`.

## Quick start

```bash
npm install
npm run skills:sync
npm run skills:verify
npm run dev        # starts on PORT (default 4200)
```

Open `http://localhost:4200/docs` for the interactive Swagger UI.

## API Overview

### System
| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Service liveness check |
| GET | `/openapi.json` | OpenAPI 3.1 spec |
| GET | `/docs` | Swagger UI |

### Events
| Method | Path | Description |
|--------|------|-------------|
| GET | `/events` | List events (filter by `status`, `name`; sort; paginate) |
| POST | `/events` | Create event |
| GET | `/events/{id}` | Get event |
| PUT | `/events/{id}` | Update event |
| DELETE | `/events/{id}` | Delete event |

### Vendors
| Method | Path | Description |
|--------|------|-------------|
| GET | `/events/{id}/vendors` | List vendors (filter by `status`, `category`) |
| POST | `/events/{id}/vendors` | Add vendor |
| GET | `/events/{id}/vendors/{vendorId}` | Get vendor |
| PUT | `/events/{id}/vendors/{vendorId}` | Update vendor |
| DELETE | `/events/{id}/vendors/{vendorId}` | Remove vendor |

### Run of Show
| Method | Path | Description |
|--------|------|-------------|
| GET | `/events/{id}/run-of-show` | List items (sorted by `scheduledAt` by default) |
| POST | `/events/{id}/run-of-show` | Add item |
| GET | `/events/{id}/run-of-show/{itemId}` | Get item |
| PUT | `/events/{id}/run-of-show/{itemId}` | Update item (e.g. set `status: "completed"`) |
| DELETE | `/events/{id}/run-of-show/{itemId}` | Remove item |

### Budget Items
| Method | Path | Description |
|--------|------|-------------|
| GET | `/events/{id}/budget-items` | List items (filter by `status`, `category`) |
| POST | `/events/{id}/budget-items` | Add budget item |
| GET | `/events/{id}/budget-items/{itemId}` | Get budget item |
| PUT | `/events/{id}/budget-items/{itemId}` | Update budget item |
| DELETE | `/events/{id}/budget-items/{itemId}` | Remove budget item |

### Risks
| Method | Path | Description |
|--------|------|-------------|
| GET | `/events/{id}/risks` | List risks (filter by `status`, `likelihood`, `impact`) |
| POST | `/events/{id}/risks` | Add risk |
| GET | `/events/{id}/risks/{riskId}` | Get risk |
| PUT | `/events/{id}/risks/{riskId}` | Update risk |
| DELETE | `/events/{id}/risks/{riskId}` | Remove risk |

### Analytics
| Method | Path | Description |
|--------|------|-------------|
| GET | `/events/{id}/health-score` | Composite score (0–100): budget burn + schedule drift + open risks |
| GET | `/dashboard/summary` | All-events summary: status breakdown, upcoming, total spend, open risks |

## Demo day flow

1. **Start server** — `npm run dev`
2. **Open docs** — `http://localhost:4200/docs`
3. **Create an event** — `POST /events` with name, dates, venue, totalBudget
4. **Add vendors** — `POST /events/{id}/vendors` (categories: catering, av, photography, …)
5. **Build the run of show** — `POST /events/{id}/run-of-show` for each time block
6. **Track the budget** — `POST /events/{id}/budget-items`, update `actualAmount` as invoices come in
7. **Log risks** — `POST /events/{id}/risks`, update `status` to `mitigated` when resolved
8. **Check health** — `GET /events/{id}/health-score` to see budget burn %, schedule drift %, and open risk count
9. **Dashboard view** — `GET /dashboard/summary` for a cross-event overview

### Health score formula

The score (0–100) is a weighted sum:

| Signal | Weight | Worst case |
|--------|--------|------------|
| Budget burn (actual ÷ totalBudget) | 40 pts | Over budget → 0 pts |
| Schedule drift (skipped items ÷ total run-of-show) | 35 pts | All skipped → 0 pts |
| Open risks (high impact = −8, medium = −4, low = −1 each) | 25 pts | Many high risks → 0 pts |

## Filtering & pagination

All collection endpoints accept:

| Param | Default | Notes |
|-------|---------|-------|
| `page` | `1` | 1-based |
| `pageSize` | `20` | Max 100 |
| `sortBy` | — | Any field name |
| `sortOrder` | `asc` | `asc` or `desc` |

Domain-specific filters (e.g. `status`, `category`, `name`) are listed per-endpoint in the Swagger UI.

## Environment variables

| Variable | Default | Notes |
|----------|---------|-------|
| `PORT` | `4200` | HTTP listen port |
| `NODE_ENV` | `development` | `development` \| `test` \| `production` |
| `DATABASE_URL` | `postgresql://app:app@localhost:5436/app?schema=public` | Local database URL |
| `REDIS_URL` | `redis://localhost:6382` | Local Redis URL |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Watch mode with tsx |
| `npm run build` | Emit `dist/` via tsc |
| `npm run lint` | ESLint |
| `npm run format:check` | Prettier |
| `npm run test` | Vitest (66 tests) |
| `npm run skills:sync` | Sync optional vendor skills |
| `npm run skills:verify` | Verify required local backend skills (and optional vendor skills) |
| `npm run docker:up` | Start API + Postgres + Redis with Docker Compose |
| `npm run docker:down` | Stop Docker Compose services |
| `npm run docker:logs` | Tail Docker app logs |
| `npm run docker:validate` | Validate compose syntax |

## Required checks before merge

```bash
npm run skills:verify
npm run lint
npm run test
npm run build
```

## Docker local dev

```bash
cp .env.example .env
npm run docker:up
```

Default containerized stack:

- API: `http://localhost:4200`
- Postgres: `localhost:5436`
- Redis: `localhost:6382`
