# Job Hunt Tracker

A personal static website for tracking job applications, interview stages, follow-ups, contacts, notes, and outcomes.

## Features

- Add, edit, delete, search, filter, and sort job applications
- Track stages from saved roles through offers and rejections
- See summary metrics for applications, interviews, follow-ups, and offer rate
- Save data privately in your browser with `localStorage`
- Export and import a JSON backup
- Deploy directly to GitHub Pages

## Run locally

Open `index.html` in a browser, or run a local server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploy to GitHub Pages

1. Push these files to `https://github.com/heryndra86/job_application`.
3. In GitHub, open `Settings > Pages`.
4. Set the source to `Deploy from a branch`, branch `main`, folder `/root`.
5. Visit `https://heryndra86.github.io/job_application/`.

Your tracker data is stored in the browser you use to access the site. Use `Export` regularly if you want a backup you can move between devices.
