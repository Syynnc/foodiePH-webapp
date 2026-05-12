# 🍱 Foodie.ph Web App

> A premium corporate concierge food delivery platform for Metro Manila and Metro Cebu.

Foodie.ph is a modern web application built to simulate a high-end food delivery and group catering service. It allows users to browse partner restaurants, track live orders, and add items to a persistent cart. Built with cutting-edge React 19, Next.js App Router, and a Supabase backend.

## 🚀 Tech Stack & Core Technologies

This repository uses a modern, strictly typed TypeScript stack (99.3% TS codebase):

*   **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
*   **UI Library:** [React 19](https://react.dev/)
*   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
*   **Authentication & Backend:** [Supabase](https://supabase.com/) & `@supabase/ssr`
*   **Database ORM:** [Drizzle ORM](https://orm.drizzle.team/) & Drizzle Kit
*   **Database Engine:** PostgreSQL (via `postgres` package)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)

## ✨ Key Features

*   **Restaurant Discovery:** Beautifully designed listing grid to browse 100+ local partner restaurants with animated category filters.
*   **Shopping Cart State:** Fully functional, custom global shopping cart managed through React Context (`CartContext`).
*   **User Dashboard:** Secure dashboard shell with protected routes enforcing user authentication before checkout.
*   **Authentication Flow:** Email-based signup and login system securely connected to Supabase.
*   **Live Order Tickers & Badges:** Engaging floating UI components showcasing real-time order tracking and delivery estimates.
*   **Polished UI/UX:** Scroll reveal animations, marquee partner strips, and custom typography integrations (*Playfair Display* & *Plus Jakarta Sans*).

## 🛠️ Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

*   Node.js v18 or later
*   A [Supabase](https://supabase.com) account & project

### 1. Clone the repository

\`\`\`bash
git clone https://github.com/Syynnc/foodiePH-webapp.git
cd foodiePH-webapp
\`\`\`

### 2. Install dependencies

\`\`\`bash
npm install
# or
yarn install
# or
pnpm install
\`\`\`

### 3. Set up Environment Variables

Copy the example environment file or create a `.env.local` file in the root directory:

\`\`\`env
# Supabase keys for frontend auth/fetching
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Database URL for Drizzle ORM
DATABASE_URL=postgres://postgres.[project-id]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
\`\`\`

### 4. Database Setup (Drizzle ORM)

Push the database schema to your Supabase PostgreSQL instance using Drizzle Kit:

\`\`\`bash
npx drizzle-kit push
# or to generate/apply migrations:
npx drizzle-kit generate
npx drizzle-kit migrate
\`\`\`

### 5. Run the Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser. The page will auto-reload as you make edits to the code.

## 📂 Repository Structure

*   `/app` - Next.js App Router root (Pages, Layouts, API routes).
    *   `/components` - Reusable UI components (Navbar, Shell, ScrollReveal).
    *   `/context` - React Context providers (CartContext).
    *   `/dashboard` - Protected routes requiring Supabase authentication.
    *   `/restaurants` - Public restaurant discovery routes.
    *   `/auth` - Sign up / Sign in pages and server actions.
*   `/db` - Drizzle ORM schema definitions and database connection setup.
*   `/drizzle` - Generated SQL migration files.
*   `/lib` - Utility functions (e.g., Supabase client creation).
*   `/public` - Static assets, images, and backgrounds.

## 🤝 Contributing

Contributions, bug reports, and feature requests are welcome! If you're planning to contribute, please open an issue first to discuss what you would like to change.

## 📄 License

This project is proprietary. All rights reserved.
