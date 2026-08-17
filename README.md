# Job Hunt Tracker

A personal static website for tracking job applications, interview stages, follow-ups, contacts, notes, and outcomes.

## Features

- Add, edit, delete, search, filter, and sort job applications
- Track stages from saved roles through offers and rejections
- See summary metrics for applications, interviews, follow-ups, and offer rate
- Sync data across devices with Supabase Auth and Postgres
- Fall back to browser-only `localStorage` before Supabase is configured
- Export and import a JSON backup
- Deploy directly to GitHub Pages

## Supabase setup

1. Create a Supabase project.
2. Open `SQL Editor` in Supabase and run the contents of `supabase-schema.sql`.
3. Open `Project Settings > Data API` and copy:
   - Project URL
   - Project API keys > anon public key
4. Paste those values into `supabase-config.js`:

```js
window.JOB_TRACKER_SUPABASE = {
  url: "https://your-project.supabase.co",
  anonKey: "your-anon-public-key",
};
```

5. Open `Authentication > URL Configuration` and add this site URL as an allowed redirect URL:

```text
https://heryndra86.github.io/job_application/
```

The app uses email magic-link sign-in. Each signed-in user can only read and change their own applications.

## Run locally

Open `index.html` in a browser, or run a local server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploy to GitHub Pages

1. Push these files to `https://github.com/heryndra86/job_application`.
2. In GitHub, open `Settings > Pages`.
3. Set the source to `Deploy from a branch`, branch `gh-pages`, folder `/root`.
4. Visit `https://heryndra86.github.io/job_application/` after GitHub finishes publishing.

Before Supabase is configured, tracker data is stored in the browser you use to access the site. After Supabase sign-in, the tracker syncs through the cloud database. Use `Export` regularly if you want a separate backup.
