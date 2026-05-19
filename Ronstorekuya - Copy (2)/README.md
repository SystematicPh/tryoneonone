# Kuya Ron's Store Rewards

Vercel-ready Next.js + Supabase store points rewards system for **Kuya Ron's Store**.

## Setup

1. Create a Supabase project.
2. Open the SQL editor and paste the contents of `supabase/schema.sql`.
3. In Supabase Auth, create your first admin account through the website signup flow or manually.
4. Run this SQL once to promote the admin:

```sql
update public.profiles
set role = 'admin'
where username = 'youradminusername';
```

5. Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Local run

```bash
npm install
npm run dev
```

## Deploy to Vercel

1. Push this project to GitHub.
2. Import the repo into Vercel.
3. Add the same environment variables from `.env.local`.
4. Deploy.

## Main pages

- `/` Landing page
- `/login` Login
- `/signup` Signup
- `/dashboard` Customer dashboard
- `/rewards` Customer rewards page
- `/admin` Admin dashboard
- `/admin/users` User management
- `/admin/points` Points management
- `/admin/rewards` Rewards management
- `/admin/user/[username]` Admin-only user page
