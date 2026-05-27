# Consultorio

> Practice management SaaS for small clinics, law offices, and professional consultancies in Portugal.

**Live demo:** [consultorio-theta.vercel.app](https://consultorio-theta.vercel.app)
**Demo login:** `demo@consultorio.pt` / `demo1234`

A foundational SaaS demonstrating a modern Next.js 16 stack applied to a real PME (small/medium business) problem: managing appointments, clients, services, and invoices in one place. Built as a portfolio piece by a Portuguese software development company.

> **Scope honesty:** this repository is the foundation (auth + database + protected routes + UI shell). Feature CRUDs are scheduled for the next iterations &mdash; see the [roadmap](#roadmap).

## The problem it solves

Most Portuguese clinics, law offices, and accounting practices still juggle:

- A paper appointment book or a generic shared calendar
- An Excel sheet for client records
- A separate invoicing tool that does not talk to anything else

The result is double-booked slots, lost client history, manual invoice reconciliation, and zero visibility on the business.

## The solution

A single-tenant SaaS where the entire practice lives in one place. The data model is intentionally abstract (`Staff`, `Patient`, `Service`, `Appointment`, `Invoice`) so the same codebase serves:

- Medical clinics (patient &rarr; appointment &rarr; invoice)
- Legal practices (client &rarr; meeting &rarr; invoice)
- Accounting offices (client &rarr; service &rarr; invoice)

Only UI strings change between verticals.

## What is built

- Authentication with bcrypt-hashed passwords and JWT sessions (Auth.js v5)
- Protected route guards via Next.js 16 `proxy.ts` (Node runtime)
- Database schema with 6 models and indexed foreign keys
- Realistic seed: 5 staff, 8 services, 80 patients (Portuguese names + NIFs), 40 appointments, 15 historical invoices
- Responsive sidebar layout with collapsible nav and mobile drawer
- Dashboard skeleton with KPI cards

## What is not yet built

- Patient CRUD (list, create, edit, delete)
- Appointment calendar (FullCalendar integration)
- Service catalog management
- Invoice PDF generation
- Real dashboard metrics (cards currently show placeholders)
- Multi-tenancy &mdash; current scope is one practice per deployment
- SAF-T export for Portuguese tax compliance

## Tech stack

| Layer    | Choice                                       | Reasoning                                                 |
| -------- | -------------------------------------------- | --------------------------------------------------------- |
| Runtime  | Node.js 22                                   | Required by Next.js 16                                    |
| Framework| Next.js 16 (App Router, Turbopack)           | Full-stack in one project, Server Components, Server Actions |
| Language | TypeScript 5                                 | Type safety end-to-end                                    |
| UI       | Tailwind v4 + shadcn/ui (Base UI render API) | Professional components with minimal design work          |
| Database | PostgreSQL (Neon serverless)                 | Scales to zero, EU region (Frankfurt), generous free tier |
| ORM      | Prisma 7 with `@prisma/adapter-neon`         | Type-safe queries, WebSocket-pooled serverless driver     |
| Auth     | Auth.js v5 (`next-auth@beta`) with Credentials provider | Email/password + JWT strategy                  |
| Hosting  | Vercel (frontend + serverless functions)     | Always-on free tier, EU edge, GitHub-integrated CI        |

## Architecture decisions worth flagging

- **Prisma 7 + driver adapter.** No native binaries; the Neon adapter uses the serverless WebSocket driver, which means fast cold starts on Vercel.
- **`proxy.ts` instead of `middleware.ts`.** Next.js 16 renamed middleware to `proxy.ts`, with a Node-only runtime. This removed all the edge-runtime compatibility constraints that complicated Auth.js + bcrypt in earlier setups.
- **JWT session strategy.** Required by Auth.js v5 Credentials provider. Sessions live in the cookie, not the database, which simplifies the schema and keeps reads cheap.
- **Auth checks in DAL, not layouts.** Layouts do not re-render on intra-segment navigation, so they cannot be the sole auth gate. The proxy handles route protection; pages and server actions re-verify the session before reading data.
- **Money in cents (`Int`).** Prices are stored as integer cents EUR to avoid floating-point errors when generating invoices.
- **Abstract domain naming.** `Staff`, `Patient`, `Service`, `Appointment` rather than `Doctor`, `Patient`, `Treatment` &mdash; the same schema serves multiple verticals.

## Local development

Prerequisites: Node.js 22, a Neon Postgres connection string (or any Postgres URL with the WebSocket driver).

```bash
git clone https://github.com/RobertoCCC/consultorio.git
cd consultorio
npm install
cp .env.example .env
# Edit .env and set DATABASE_URL (Neon) + AUTH_SECRET (openssl rand -base64 32)
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

Open `http://localhost:3000` and log in with the demo credentials at the top of this README.

## Project layout

```
src/
  app/
    (app)/              authenticated routes (sidebar layout)
      dashboard/
      pacientes/
      marcacoes/
      servicos/
      faturacao/
    api/auth/[...nextauth]/   Auth.js handlers
    login/                public login page
    layout.tsx            root layout
    page.tsx              redirects to /dashboard
  components/
    ui/                   shadcn primitives
    app-sidebar.tsx       collapsible nav
    login-form.tsx        client component with useActionState
  lib/
    prisma.ts             Prisma singleton with Neon adapter
    auth.ts               Auth.js v5 configuration
    actions/auth.ts       loginAction / logoutAction server actions
  proxy.ts                route protection (Next.js 16)
prisma/
  schema.prisma           6 models, 12 indexes
  seed.ts                 idempotent realistic seed
```

## Roadmap

1. Patient CRUD with NIF validation
2. Appointment calendar (FullCalendar.io) with create/edit/cancel
3. Service catalog management
4. Invoice generation with PDF export (`react-pdf`)
5. Dashboard wired to real metrics
6. Optional: SAF-T export, multi-tenancy, payments integration

## License

MIT.
