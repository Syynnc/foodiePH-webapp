# 🍱 Foodie.ph Web App

> Premium corporate concierge food delivery for Metro Manila and Metro Cebu.

Foodie.ph is a modern, high-performance web application built to handle corporate food delivery, group catering, and "eat-now-pay-later" services for businesses. It connects users with over 100+ partner restaurants through a seamless, fast, and beautifully designed interface.

## ✨ Features

*   **🏪 Restaurant Discovery:** Browse, search, and filter through 100+ local partner restaurants.
*   **🛒 Global Cart System:** Persistent shopping cart experience managed via React Context.
*   **🔐 Authentication:** Secure user login and dashboard access powered by Supabase.
*   **⚡ Real-time UI:** Live order tickers and dynamic delivery badges for an engaging user experience.
*   **📱 Responsive Design:** Fully optimized for mobile, tablet, and desktop screens.
*   **🎨 Custom Typography & Theming:** Utilizes *Playfair Display* and *Plus Jakarta Sans* with a warm, custom color palette.

## 🛠️ Tech Stack

This project is built with modern web technologies:

*   **Framework:** [Next.js](https://nextjs.org/) (App Router)
*   **Language:** [TypeScript](https://www.typescriptlang.org/) (97% of the codebase)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Backend & Auth:** [Supabase](https://supabase.com/)
*   **Deployment:** Vercel (Recommended)

## 🚀 Getting Started

To run this project locally, follow these steps:

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (v18 or higher) installed on your machine.

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/Syynnc/foodiePH-webapp.git
cd foodiePH-webapp
\`\`\`

### 2. Install dependencies
Using npm, yarn, or pnpm:
\`\`\`bash
npm install
# or
yarn install
# or
pnpm install
\`\`\`

### 3. Set up Environment Variables
Create a \`.env.local\` file in the root directory and add your Supabase credentials:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
\`\`\`
*(Note: If your Supabase project pauses due to inactivity, local requests will fail with a `ConnectTimeoutError` until you restore it from the Supabase dashboard).*

### 4. Run the development server
\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## 📂 Project Structure

A quick look at the core structure of the application:

\`\`\`text
foodiePH-webapp/
├── app/
│   ├── auth/              # Authentication pages and actions
│   ├── components/        # Reusable UI components (Navbar, Shell, ScrollReveal)
│   ├── context/           # React Context providers (CartContext)
│   ├── dashboard/         # Protected user dashboard routes
│   ├── restaurants/       # Restaurant listing and filtering pages
│   ├── layout.tsx         # Root layout and font configuration
│   └── page.tsx           # Landing page
├── lib/
│   └── supabase/          # Supabase client utilities
├── public/                # Static assets (images, icons)
└── tailwind.config.ts     # Tailwind CSS configuration
\`\`\`

## 📝 Scripts

*   \`npm run dev\` - Starts the local development server.
*   \`npm run build\` - Creates an optimized production build.
*   \`npm run start\` - Starts the production server.
*   \`npm run lint\` - Runs ESLint to check for code issues.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 
Feel free to check the [issues page](https://github.com/Syynnc/foodiePH-webapp/issues) if you want to contribute.

## 📄 License

This project is proprietary. All rights reserved. 