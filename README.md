# Foodie.ph

A corporate concierge food delivery platform for Metro Manila and Metro Cebu. Users can browse partner restaurants, place orders, track deliveries in real time, and manage their accounts. The platform also includes a restaurant owner portal, a driver dashboard, and an admin panel.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS v4 |
| Auth & Storage | Supabase (`@supabase/ssr`) |
| ORM | Drizzle ORM |
| Database | PostgreSQL (via Supabase) |
| Language | TypeScript |

## Features

- Restaurant discovery with category filters
- Persistent shopping cart (React Context)
- Email-based authentication (sign up / sign in)
- User dashboard with order history
- Restaurant owner portal (menu and profile management)
- Driver dashboard (accept, pick up, and deliver orders)
- Admin panel (users, restaurants, stats)
- Account settings (name, phone, company)

## Local Setup

### Prerequisites

- Node.js v18 or later
- A [Supabase](https://supabase.com) project

### 1. Clone

```bash
git clone https://github.com/Syynnc/foodiePH-webapp.git
cd foodiePH-webapp
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres.[project-id]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
NODE_OPTIONS=--dns-result-order=ipv4first
```

> `SUPABASE_SERVICE_ROLE_KEY` is used server-side only and is never exposed to the browser.

### 4. Push the database schema

```bash
npx drizzle-kit push
```

This creates all tables (`profiles`, `restaurants`, `menu_items`, `orders`, `order_items`, `drivers`, `reviews`, `cart_items`) in your Supabase PostgreSQL instance.

### 5. Run the auth trigger migration

In the **Supabase dashboard → SQL Editor**, run the contents of:

```
supabase/migrations/20260519000000_profiles_trigger.sql
```

This trigger auto-creates a `profiles` row whenever a new user signs up, so email-existence checks and role lookups work immediately after registration.

### 6. (Optional) Seed sample data

```bash
npx tsx db/seed.ts
```

### 7. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment (Vercel)

1. Push the repo to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Add all four environment variables from step 3 above in **Project Settings → Environment Variables**.
4. Deploy. Vercel auto-detects Next.js and runs `npm run build`.

## User Roles

| Role | Access |
|---|---|
| `customer` | Browse, cart, checkout, order history, account settings |
| `driver` | Driver dashboard, accept/pick up/deliver orders |
| `restaurant` | Restaurant portal, menu and profile management |
| `admin` | Admin panel, all users and restaurants |

Roles are stored in the `profiles.role` column and assigned at registration or by an admin.

## Project Structure

```
app/
  auth/          Sign in / sign up pages and server actions
  dashboard/     Protected customer dashboard (orders, cart)
  account/       Account settings
  restaurants/   Public restaurant listing
  restaurant/    Restaurant owner portal
  driver/        Driver dashboard
  admin/         Admin panel
  api/           REST API routes
  components/    Shared UI components
  context/       React Context providers (CartContext)
db/
  schema.ts      Drizzle table definitions
  seed.ts        Sample data seeder
lib/
  supabase/      Supabase client helpers (server, client, admin, middleware)
supabase/
  migrations/    SQL migrations to run in the Supabase dashboard
```
