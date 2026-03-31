# Loyalty Club

Loyalty Club is a dual-interface web app for loyalty networks:

- Business owner interface:
  - Program setup
  - Purchase capture by member QR/code
  - Special menus
  - Metrics dashboard with chart visuals
  - Newsletter draft workflow
- Customer interface:
  - Wallet for multiple businesses in the network
  - Separate membership card per business
  - Points and visit progress per business
  - QR code per membership

## Tech Stack

- Next.js 16 App Router + React 19 + TypeScript
- Tailwind CSS + shadcn UI
- PostgreSQL + Prisma ORM
- NextAuth (magic-link, Google OAuth, local demo fallback)
- Docker Compose for local database

## Prerequisites

- Node.js 20+
- npm 10+
- Docker Desktop (or Docker Engine)

## 1. Install Dependencies

```bash
npm install
```

## 2. Configure Environment

Copy the environment template and update values if needed:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Important env values:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `EMAIL_SERVER` and `EMAIL_FROM` for magic links
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` for Google sign-in

If email and Google are not configured, local demo credentials auth is available for development.

## 3. Start PostgreSQL (Docker)

```bash
npm run db:up
```

Stop database container:

```bash
npm run db:down
```

View database logs:

```bash
npm run db:logs
```

## 4. Run Prisma Migration + Seed

```bash
npm run prisma:migrate -- --name init
npm run prisma:seed
```

Optional Prisma commands:

```bash
npm run prisma:generate
npm run prisma:studio
```

## 5. Run the App

```bash
npm run dev
```

Open:

- `http://localhost:3000`

## Demo Data Notes

Seed creates:

- Owner user:
  - `owner@precisionconcierge.dev`
- Customer user:
  - `sara@precisionconcierge.dev`
- Two businesses:
  - Artisan Bakery
  - Indigo Roasters

This allows testing the customer multi-business network wallet immediately.

## Routes

- Landing:
  - `/`
- Auth:
  - `/auth/sign-in`
- Owner:
  - `/owner/dashboard`
  - `/owner/program`
  - `/owner/menus`
- Customer:
  - `/user/wallet`

## Quality Checks

```bash
npm run lint
npm run build
```
