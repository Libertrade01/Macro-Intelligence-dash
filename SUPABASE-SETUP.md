# Supabase setup (separate from Trade Desk)

Briefing Studio uses its **own** Supabase project. Do not reuse Trade Desk (`uzbsuyknfnzqwdpzspfs`).

## 1. Create project

**Automated** (needs fresh access token):

```bash
# 1. Create token: https://supabase.com/dashboard/account/tokens
# 2. Add to .env.local: SUPABASE_ACCESS_TOKEN=sbp_...
npm run create:project
```

This creates `briefing-studio`, writes `.env.local`, and applies `supabase/schema.sql`.

**Manual:**

1. [database.new](https://database.new) or [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Name: `briefing-studio`
3. Save the DB password

## 2. Configure `.env.local`

```bash
cp .env.example .env.local
```

From **Project Settings → API**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_PROJECT_REF` (subdomain from URL)

Generate `BRIEFING_INGEST_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Optional: `SUPABASE_ACCESS_TOKEN` from [Account → Access Tokens](https://supabase.com/dashboard/account/tokens)

## 3. Apply schema

**SQL editor:** paste `supabase/schema.sql` → Run

**Or:** `npm run setup:db` (needs access token)

## 4. Verify

```bash
npm run verify:db
```

## Hermes VPS

```
BRIEFING_STUDIO_URL=https://your-app.vercel.app
BRIEFING_INGEST_SECRET=same-as-env-local
```

X tokens stay on VPS only.
