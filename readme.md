# Subway Ride Visualizer

A dashboard for personal NYC MTA subway ridership data logged in Airtable —
car number, line, and timestamp per ride.

## Running locally

```bash
npm install
npm run dev
```

## Adding your data

The site reads `public/data/rides.csv` at runtime. It isn't checked in yet,
so the dashboard currently shows generated sample data (a banner on the
Overview page says so).

To use your real rides: export your Airtable base to CSV and save it as
`public/data/rides.csv`. See `public/data/rides.example.csv` for the
expected columns — headers are matched case-insensitively and a few common
aliases are accepted (e.g. "Car #" or "Car Number", "Date and Time Logged"
or "Date/Time").

Note: this is a static site — anything in `public/data/rides.csv` ships in
the deployed build and is publicly visible at the GitHub Pages URL.

## Deploying

Pushing to `main` builds and deploys to GitHub Pages via
`.github/workflows/deploy.yml`. One-time setup: in the repo's Settings →
Pages, set the source to "GitHub Actions".
