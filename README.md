# ProtiTaka

ProtiTaka is a modern personal finance dashboard built with React, TypeScript, Vite, Tailwind CSS, and Supabase. It helps users log transactions, manage custom categories, monitor daily spending, and view simple analytics for their financial habits.

> Mobile-friendly by design: the app layout is optimized for phones first, then scales up for tablet and desktop screens.

## Features

- Secure authentication with Supabase
- Add, edit, and delete transactions
- Create and manage custom income/expense categories
- Daily overview with daily budget progress
- Dashboard analytics for:
  - monthly spend total
  - category breakdown
  - pie-style category distribution
  - monthly trend view
- Responsive layout for mobile, tablet, and desktop

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Supabase
- React Router

## Project Structure

- src/pages — app pages such as transactions, dashboard, categories, profile, and overview
- src/components — reusable app UI components
- src/services — Supabase data access helpers
- src/routes — application routing

## Getting Started

### 1. Install dependencies

Run this in the project root:

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root and add:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run locally

```bash
npm run dev
```

### 4. Build for production

Use this when you are ready to deploy:

```bash
npm run build
```

## Deployment

This app is designed to be deployed on Vercel.

For mobile-friendly production use, make sure the deployed version is tested on a real phone viewport as well as desktop.

Recommended deployment steps:

1. Push the repository to GitHub
2. Import the project in Vercel
3. Set the same environment variables used in `.env.local`
4. Use the build command:

```bash
npm run build
```

5. Set the output directory to `dist`

## Notes

- Supabase Row Level Security (RLS) must be configured for transactions, categories, and profiles for full production behavior.
- The dashboard and analytics views are intended to help turn raw spending data into simple financial insights.

## Demo

Add your Vercel live URL here once deployed.

## Screenshots

Add screenshots of the dashboard, transactions page, and daily overview here to make the project portfolio-ready.

## Mobile Notes

- Keep buttons large enough for finger tapping
- Ensure tables and forms wrap cleanly on smaller screens
- Test the dashboard and overview pages on real mobile widths before sharing the app
