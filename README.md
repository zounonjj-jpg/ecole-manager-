# School Manager

School Manager is a multi-tenant school management platform for schools, universities, institutes and training centres worldwide.

## Stack
- Next.js App Router + TypeScript
- Supabase Auth + PostgreSQL + Row Level Security
- Vercel deployment

## Setup
1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and set the Supabase project URL and publishable key.
3. Run `npm run dev`.

## Environment
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Never expose a Supabase secret/service-role key in browser code.

## Current scope
The first foundation release includes the public landing page, authentication entry points, responsive workspace shell, and tenant-aware database schema. More academic and finance modules will be added incrementally.
