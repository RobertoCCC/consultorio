# Consultorio

> Practice management SaaS for small clinics, law offices, and professional consultancies in Portugal.

**Live demo:** [consultorio-theta.vercel.app](https://consultorio-theta.vercel.app)
**Demo login:** `demo@consultorio.pt` / `demo1234`

A complete SaaS demonstrating a modern Next.js 16 stack applied to a real PME (small/medium business) problem: managing appointments, clients, services, and invoices in one place. Built as a portfolio piece by a Portuguese software development company.

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

**Dashboard.** Real-time KPIs computed from the database in a single batched query: appointments today (with pending count), total patients, monthly paid revenue, pending invoices, and the next six upcoming appointments with cross-links to patient, service, and staff.

**Patients.** List with case-insensitive search by name, email, or NIF. Detail view with personal info, the five most recent appointments (status-badged), and the five most recent invoices. Full create / edit / delete with Zod validation, NIF format check, and confirmation dialog.

**Services.** Catalog with five KPIs per service including total revenue (sum of paid invoice lines linked to it). Create / edit / delete with an active toggle (inactive services are excluded from new appointments). Foreign-key constraint failures on delete are caught and surfaced as a toast suggesting deactivation instead.

**Appointments.** List with combined filters (period: future / today / this week / past / all; status: scheduled / completed / cancelled / no-show), plus a weekly / monthly / daily calendar view powered by FullCalendar. Form with controlled selects for patient / service / staff and auto-fill of duration from the chosen service. Contextual status workflow on the detail page (mark completed, mark no-show, cancel, re-schedule).

**Invoicing.** List with status filter and three aggregate summary cards (issued / paid / void totals via `prisma.invoice.groupBy`). Detail page with line items, IVA at 23%, and totals. Status workflow (draft / issued / paid / void). On-demand A4 PDF generation using `@react-pdf/renderer` served via `/api/faturas/[id]/pdf`.

**Auth & infrastructure.** Auth.js v5 with credentials provider, bcrypt-hashed passwords, JWT sessions. Route protection via Next.js 16 `proxy.ts` (Node runtime). DAL pattern (`verifySession()` cached per render) called by every page and server action. Realistic seed: 5 staff, 8 services, 80 patients (Portuguese names + NIFs), 40 appointments, 15 historical invoices.

## Not in scope (deliberately)

- **Multi-tenancy.** Current scope is one practice per deployment; the schema would need an `Organization` model to scope reads.
- **SAF-T export** and other Portuguese tax compliance specifics.
- **Manual invoice creation** UI. The seed populates 15 invoices and the demo focuses on the read / PDF / status flow; invoice generation would normally be triggered by appointment completion in production.

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
| Validation | Zod 4                                      | Server-side form validation in every server action        |
| PDF      | `@react-pdf/renderer`                        | JSX-style API rendered to a buffer in a route handler     |
| Hosting  | Vercel (frontend + serverless functions)     | Always-on free tier, EU edge, GitHub-integrated CI        |

## Architecture decisions worth flagging

- **Prisma 7 + driver adapter.** No native binaries; the Neon adapter uses the serverless WebSocket driver for fast cold starts on Vercel.
- **`proxy.ts` instead of `middleware.ts`.** Next.js 16 renamed middleware to `proxy.ts` with a Node-only runtime, removing the edge-runtime constraints that complicated Auth.js + bcrypt in earlier setups.
- **JWT session strategy.** Required by Auth.js v5 Credentials provider. Sessions live in the cookie, not the database, which simplifies the schema and keeps reads cheap.
- **Auth checks in DAL, not layouts.** Layouts do not re-render on intra-segment navigation, so they cannot be the sole auth gate. The proxy handles route protection; pages and server actions re-verify the session through a `cache()`-wrapped `verifySession()` before reading data.
- **Money in cents (`Int`).** Prices are stored as integer cents EUR to avoid floating-point errors when generating invoices.
- **Abstract domain naming.** `Staff`, `Patient`, `Service`, `Appointment` rather than `Doctor`, `Patient`, `Treatment` &mdash; the same schema serves multiple verticals.
- **Server Actions everywhere.** Every mutation (CRUD across all four feature areas plus status transitions) goes through a `'use server'` action with Zod validation and explicit `revalidatePath` invalidation. No client-side mutation logic.
- **PDF as a route handler.** `/api/faturas/[id]/pdf` is `.tsx` so JSX can be used directly with `renderToBuffer`. The response is `application/pdf` inline so browsers preview rather than force-download.

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
    (app)/                  authenticated routes (sidebar layout)
      dashboard/            real KPIs from the database
      pacientes/            list + [id] + [id]/editar + novo
      servicos/             list + [id] + [id]/editar + novo
      marcacoes/            list (filtered) + [id] + [id]/editar + nova
      faturacao/            list (filtered) + [id]
    api/
      auth/[...nextauth]/   Auth.js handlers
      faturas/[id]/pdf/     on-demand PDF route handler
    login/                  public login page
    layout.tsx              root layout
    page.tsx                redirects to /dashboard
  components/
    ui/                     shadcn primitives
    app-sidebar.tsx         collapsible nav
    patient-form.tsx        shared create / edit form
    service-form.tsx        shared create / edit form
    appointment-form.tsx    selects + auto-fill of duration
    appointment-status-actions.tsx
    invoice-status-actions.tsx
    delete-*-button.tsx     AlertDialog confirmations
    login-form.tsx          client component with useActionState
  lib/
    prisma.ts               Prisma singleton with Neon adapter
    auth.ts                 Auth.js v5 configuration
    dal.ts                  verifySession() cached per render
    formatters.ts           PT currency, dates, NIF, phone, initials, age
    actions/                'use server' mutations per feature area
    validations/            Zod schemas per feature area
    pdf/invoice-pdf.tsx     react-pdf component
  proxy.ts                  route protection (Next.js 16)
prisma/
  schema.prisma             6 models, 13 indexes
  seed.ts                   idempotent realistic seed
```

## License

MIT.
