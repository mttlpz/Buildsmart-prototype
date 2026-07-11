# BuildSmart — AI-Assisted Construction Quotation Platform

BuildSmart is a prototype platform that helps Philippine construction SMEs turn blueprints and pricelists into accurate, defensible project quotations.

## What It Does

- **Blueprint Upload & Segmentation** — Upload a blueprint (or use Quick Measurement for a fast manual entry path), let BuildSmart scan and break it into segments, then review and reclassify those segments before scoping.
- **Quotation Generation** — Assign scope and work items to each segment, then generate tiered cost estimates (Practical / Standard / Premium) with a full cost breakdown, in Philippine Pesos.
- **Pricelist Management** — Upload or fetch supplier pricelists (including a DPWH CMPD reference source), map fields, and maintain a live material price catalog per company.
- **Company Rules & Preferences** — Configure the business logic behind every quotation: material preference rules, scope templates, labor rates, pricing strategies (markup, contingency, overhead, profit margin), unit conversions, and supplier discount rules.
- **Market Intelligence** — Analyze historical material price trends over time and by region.
- **Supplier Benchmarking** — Compare and rank suppliers based on pricing and discount terms.

New accounts step through a short onboarding flow — upload a pricelist, then add at least one company rule — before the rest of the app unlocks.

## The Story: Figma → Replit → Next.js

This repository is the **prototype** stage of BuildSmart:

1. **Figma** — The UI/UX was designed first in Figma, screen by screen.
2. **Replit AI** — The Figma design was handed to Replit's AI to scaffold and wire up into a working, clickable full-stack prototype (this repo) — useful for validating the product flow end-to-end before investing in a production build.
3. **Next.js (production)** — The validated design and flow were later rebuilt from scratch as a production application on Next.js, in a separate repository, with real persistence and hardening the prototype doesn't have.

Treat this repo as a **design-validation artifact**, not the production codebase.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vite, React, Wouter (routing), TanStack Query, Tailwind CSS, Radix UI |
| Backend | Express, TypeScript, express-session |
| Data layer | `MemStorage` — a hand-rolled **in-memory** store (no database is actually connected) |
| Schema | Drizzle ORM schema (`shared/schema.ts`, PostgreSQL dialect) — defines the intended production shape but isn't backed by a live database in this prototype |
| Runtime | Node.js, `tsx` |

## Running Locally

```bash
npm install
npx cross-env NODE_ENV=development tsx server/index.ts
```

Then open **http://localhost:5000**.

You can also use the npm script, which wraps the same command:

```bash
npm run dev
```

### Windows Notes

- If PowerShell blocks `npm` from running (execution policy errors), run the command from **Command Prompt** (`cmd.exe`) instead, or launch PowerShell as Administrator and run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.
- `NODE_ENV=development tsx server/index.ts` is Unix shell syntax and will fail on Windows with `'NODE_ENV' is not recognized...`. Always set it via **`cross-env`** on Windows (as shown above, and as already wired into `npm run dev`) rather than typing `NODE_ENV=...` directly.

## Login Credentials

Storage is in-memory (see [Known Limitations](#known-limitations)), but a demo admin account is **seeded automatically every time the server starts** (`server/storage.ts`):

| Field | Value |
|---|---|
| Email / Username | `admin@buildsmart.com` |
| Password | `admin123` |

This account starts at onboarding step 0, so after logging in you'll walk through the same setup flow (upload a pricelist, add a company rule) that a real new account would.

You can also register a brand-new account from `/signup` at any time — just be aware it only exists until the server restarts (see below).

## Known Limitations

- **No persistent database.** All data — users, companies, pricelists, quotations, rules — lives in an in-memory `Map`/array (`server/storage.ts`). **Restarting the server wipes everything**, including the seeded admin account's onboarding progress and any accounts you register. A Drizzle/PostgreSQL schema exists (`shared/schema.ts`, `drizzle.config.ts`) but is not wired up to a live database in this prototype.
- **Prototype only.** This build exists to validate UX and product flow, not for production use — expect rough edges, mocked/sample data (e.g. DPWH pricelist rows), and simplified business logic.
- **No external API keys included.** Any feature intended to call a real third-party service (e.g. live market data, blueprint OCR/AI scanning) uses local mock logic in this repo rather than a real integration, since no API keys are provisioned here.
- **Single deployable, dev-oriented.** Session secret and other config default to hardcoded dev values (`server/index.ts`) and are not meant to be used as-is in production.
