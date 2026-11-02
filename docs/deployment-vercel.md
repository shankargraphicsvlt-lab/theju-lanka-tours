# Deploying to Vercel

The project is a standard Next.js app and needs no Vercel-specific configuration (`vercel.json` is not required). It can also run on any Node.js host with `npm run build` then `npm start`.

## 1. Prerequisites

- A Git repository on GitHub, GitLab or Bitbucket (Vercel deploys from Git). Git was **not installed** on the development machine at the time of Phase B. Install it from https://git-scm.com/download/win, then:

  ```powershell
  cd "F:\Theju Lanka Tours"
  git init
  git add .
  git status            # confirm no .env.local or other secrets are listed
  git commit -m "Phase B: visual foundation and public pages"
  ```

  `.gitignore` already excludes `.env*` (except `.env.example`), `node_modules`, build output and keys.

- A Vercel account (https://vercel.com).

## 2. Create the project

1. In Vercel, choose **Add New → Project** and import the repository.
2. Framework preset: **Next.js** (detected automatically). Leave build and output settings at their defaults.
3. Node.js version: 20.x or newer (Project → Settings → General).

## 3. Environment variables

Add these under **Settings → Environment Variables** (Production, and Preview if wanted). See `.env.example` and [content-and-contact-details.md](content-and-contact-details.md).

- `NEXT_PUBLIC_SITE_URL`: set this to the final production domain once it's known (e.g. `https://www.yourdomain.com`). Until then, either leave it unset or set it to the `*.vercel.app` URL. **Canonical URLs, the sitemap and Open Graph tags use this value**, so set it correctly before the site is indexed.
- Contact and legal variables, as they become available.

Never add secrets to `NEXT_PUBLIC_*` variables. They are visible in the browser.

## 4. Domain (when purchased)

1. Vercel → Project → **Settings → Domains → Add**, then enter the domain.
2. Follow Vercel's DNS instructions at your registrar (typically an `A` record for the apex domain and a `CNAME` for `www`).
3. Choose a primary domain (e.g. redirect apex → `www`).
4. Update `NEXT_PUBLIC_SITE_URL` to the primary domain and **redeploy**.
5. HTTPS certificates are issued automatically.

## 5. Before going live

- [ ] Real contact details and legal entity name configured
- [ ] Legal pages reviewed by a qualified professional; placeholders removed
- [ ] Daily rate and discount in `src/config/pricing.ts` re-confirmed; what the rate includes confirmed (or kept clearly undisclosed)
- [ ] Sample itineraries confirmed or clearly kept as samples
- [ ] `NEXT_PUBLIC_SITE_URL` matches the production domain
- [ ] Booking, email and payment phases completed and tested (Phases D–E), or forms left in their clearly labelled "not active" state
- [ ] Run `npm run check` and `npm run build` locally with no errors

## Security headers

`next.config.ts` sends `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: DENY`, `Permissions-Policy` and `Strict-Transport-Security` on every response, and disables the `X-Powered-By` header. A Content-Security-Policy is planned for Phase G, once third-party scripts (payments) are known.
