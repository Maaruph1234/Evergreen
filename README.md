# Evergreen Lifecare Support Foundation — Website

Website for Evergreen Lifecare Support Foundation.

## Stack

- Vite (multi-page build, one entry per HTML file)
- TypeScript
- Supabase (donor portal auth + data, program application submissions)

## Development

```bash
npm install
npm run dev       # local dev server with hot reload
npm run build     # typecheck, then build static site into dist/
npm run preview   # serve the production build locally
```

## Project layout

```
index.html, about.html, programs.html, events.html, contact.html,
volunteer.html, blog.html, apply.html, admin.html   # page entry points

public/            # static assets served as-is (images, favicon, sitemap)

src/
  lib/
    menu.ts             # mobile nav toggle
    reveal.ts           # scroll-triggered fade-in animation
    scrollTop.ts        # back-to-top button visibility
    counters.ts         # animated stat counters
    countdown.ts        # event countdown timer
    viewportHeight.ts   # real viewport height fallback for mobile
    chatbot.ts          # FAQ chatbot widget
    faq-data.ts         # chatbot knowledge base
    site-config.ts      # WhatsApp number + link helper
    supabase.ts         # Supabase client
    donor-auth.ts        # Supabase data access (auth, allocations, applications)
    donor-portal.ts      # donor login/dashboard UI
  styles/            # one CSS file per page, plus chatbot.css
  pages/             # one TS entry per page
```

## Environment variables

Copy `.env.example` to `.env` and fill in your Supabase project values (Supabase dashboard → Settings → API):

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Without these, the donor portal and admin panel render a "not configured yet" message instead of the live features — the rest of the site works normally.

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run the contents of `supabase/schema.sql`. This creates the `profiles`, `donor_allocations`, and `applications` tables with row-level security so donors only see their own records and only admins can manage allocations and applications. Applicants also get a unique status code they can use to check their application stage without an account.
3. Copy the Project URL and anon public key into `.env` as above.
4. To grant admin access, sign up for a donor account through the homepage, then run:
   ```sql
   update public.profiles set is_admin = true where email = 'you@example.com';
   ```
   That account can then log into `/admin.html` to manage donor allocations and review program applications.

## Deployment

The build step (`npm run build`) is required — this is not a plain static-HTML site. Point your host's build command at `npm run build` and the output directory at `dist/`. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables in your hosting platform's dashboard (`.env` is gitignored and never pushed).

## Editing the chatbot's answers

Open `src/lib/faq-data.ts`. Each entry has a `question` (for reference), `keywords` (phrases matched against visitor input), and an `answer`. Add a new object to the array to teach it something new.
