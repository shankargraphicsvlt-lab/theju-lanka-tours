# Supabase project setup (Windows PowerShell)

**Do these steps yourself.** Keys and passwords go into your password manager and `.env.local`. Never paste them into chat, issues or commits. Claude will not run any command that connects to Supabase until you explicitly approve it.

Steps 1–3 and 6–9 are done in the browser. Steps 4–5 use the Supabase CLI and change the remote database, so they wait for your approval.

## 1. Create the project

1. Sign up at https://supabase.com and create an organisation.
2. **New project**:
   - Name: `theju-lanka-tours` (or similar).
   - Database password: generate a strong one and store it in your password manager.
   - Region: choose one close to your visitors and staff (for example Mumbai or Singapore for Sri Lanka).
3. Wait for the project to finish provisioning.
4. Note the **project ref**: the part of the dashboard URL after `/project/`, e.g. `https://supabase.com/dashboard/project/<project-ref>`. It is not secret.

## 2. Get the API keys

Dashboard → **Project Settings → API Keys**.

| Value | Where it goes | Secret? |
| --- | --- | --- |
| Project URL (`https://<ref>.supabase.co`) | `NEXT_PUBLIC_SUPABASE_URL` | No |
| Publishable key (`sb_publishable_…`) | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | No: safe in the browser |
| Secret key (`sb_secret_…`), create one named e.g. `nextjs-server` | `SUPABASE_SECRET_KEY` | **Yes: server only** |

Create the local env file and paste values in a text editor (not in chat):

```powershell
cd "F:\Theju Lanka Tours"
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
notepad .env.local
```

Also set `SUBMITTER_HASH_SALT` to a random value:

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

`.env.local` is ignored by Git. Supabase rejects secret keys sent from a browser, but treat a leaked secret key as compromised regardless: delete it in the dashboard and create a new one.

## 3. Configure authentication

Dashboard → **Authentication**:

1. **Sign In / Providers → Email**: keep enabled. **Turn off "Allow new users to sign up"**: staff are invited, never self-registered.
2. **URL Configuration**:
   - Site URL: `http://localhost:3000` for now, then your production domain.
   - Redirect URLs: add `http://localhost:3000/**` and later `https://<your-domain>/**`.
3. Recommended: enable **Multi-Factor Authentication (TOTP)**.
4. Custom SMTP for auth emails comes in Phase E. The built-in sender is rate-limited and only suitable for testing.

## 4. Install the CLI and link the project (requires approval)

```powershell
npm install supabase --save-dev
npx supabase --version
npx supabase login                               # opens the browser; creates a personal access token
npx supabase link --project-ref <project-ref>    # asks for the database password
```

## 5. Apply the migrations (requires approval)

Preview first, then apply:

```powershell
npx supabase db push --help        # confirm the available flags for your CLI version
npx supabase db push --dry-run     # lists the migrations that would run, changes nothing
npx supabase db push               # applies supabase/migrations/*.sql
```

Load the editorial content and pricing:

```powershell
npm run db:seed:generate           # rebuilds supabase/seed.sql from src/content
npx supabase db push --include-seed
```

Alternatively, paste `supabase/seed.sql` into **SQL Editor** and run it. It is safe to run more than once.

## 6. Check the security advisor

Dashboard → **Advisors → Security Advisor**. Expect no "RLS disabled" or "policy exists RLS disabled" findings. Review any warnings before continuing.

Also confirm under **Project Settings → Data API → Exposed schemas** that only `public` (and the default `graphql_public`) are exposed, **not** `private`.

## 7. Create the first admin

1. Dashboard → **Authentication → Users → Add user → Send invitation** (or create user) with the owner's email.
2. Dashboard → **SQL Editor**, replacing the email:

   ```sql
   insert into public.admin_profiles (user_id, role, display_name)
   select id, 'admin', 'Owner'
   from auth.users
   where email = 'owner@your-domain.com';

   select user_id, role, is_active from public.admin_profiles;
   ```

3. Add further staff the same way with `role = 'staff'` (bookings and enquiries) or `'admin'` (also content, pricing, payment events and audit log).
4. To remove access: `update public.admin_profiles set is_active = false where user_id = '…';`

There is intentionally no way to grant admin rights from the website or API.

## 8. Optional: scheduled clean-up

Enable the `pg_cron` extension (Database → Extensions), then in the SQL Editor:

```sql
select cron.schedule('purge-rate-limits', '0 3 * * *', $$select public.purge_expired_rate_limits()$$);
```

## 9. Vercel

When deploying, add the same variables under **Vercel → Project → Settings → Environment Variables**. Mark `SUPABASE_SECRET_KEY` and `SUBMITTER_HASH_SALT` as **Sensitive**, and never prefix them with `NEXT_PUBLIC_`.

## Local database without Supabase

The full schema and security tests run locally with no account and no Docker:

```powershell
npm test     # includes tests/db/*: runs every migration in an in-process Postgres
```

A full local Supabase stack (`npx supabase start`) needs Docker Desktop and isn't required.
