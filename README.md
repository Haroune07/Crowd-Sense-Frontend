# Crowd-Sense (frontend)

Phone-first web app to protest safely: a live heat map of the protest, an Urgence report
(location + photo), announcements, quick polls, and an organizer review flow.

React + Vite, React Router, MapLibre GL with free OpenFreeMap tiles (no API key).

## Run it

```bash
npm install
npm run dev
```

Open the link it prints. On a phone on the same Wi-Fi, use the "Network" link.
(Camera and location need `https://` on a real phone, so test those on the Vercel link.)

## Demo mode vs real backend

- **Demo mode** (default): `VITE_API_URL` is empty, the app uses fake data from
  `src/lib/mock.js`. Everything works without a backend. Demo protest code: `K7P2QX`.
- **Real backend**: copy `.env.example` to `.env` and set
  `VITE_API_URL=https://your-nest-backend` (without `/api`). Restart `npm run dev`.

## Deploy (Vercel)

Import the repo in Vercel, framework "Vite". Add `VITE_API_URL` in the project's
environment variables. `vercel.json` makes page links like `/map` work after a refresh.

## Files

```
src/
  main.jsx              starts React and the router
  App.jsx               all the screens (routes) and who can open them
  styles.css            the whole look: colors, glass, buttons, animations
  lib/
    api.js              every call to the backend (one place)
    mock.js             fake backend for demo mode
    demoPoints.js       demo reports along real Montréal streets
    session.js          keeps the login and the protest on the phone
    levels.js           the 4 heat levels and announcement importance
    usePolling.js       reloads data every few seconds (live screens)
    util.js             time ago, shrink photo, get location
  components/
    HeatMap.jsx         the live map with the 4 heat layers
    PickMap.jsx         small map to tap a spot
    Nav.jsx, TopBar.jsx, Icon.jsx, LevelChip.jsx
  pages/                one file per screen
```

## What the frontend expects from the backend (all under `/api`)

Auth: send `Authorization: Bearer <token>`.

| Call | Body | Answer |
|---|---|---|
| POST /auth/register | displayName, email, password | `{ accessToken }` |
| POST /auth/login | email, password | `{ accessToken }` |
| GET /auth/me | | `{ id, displayName, email, role }` |
| POST /manifestations | name, description, startsAt, meetingLat, meetingLng | `{ manifestation, accessToken }` |
| POST /manifestations/join | code | `{ manifestation, accessToken }` |
| POST /manifestations/leave | | anything |
| GET /reports/heatmap | | `[{ lat, lng, dangerLevel }]` verified, last 20 min |
| POST /reports | multipart: lat, lng, dangerLevel (1 to 4), description?, photo? | anything |
| GET /reports/pending | | zones: `[{ zoneKey, place?, lat, lng, count, maxDanger, latestAt, reports: [{ id, lat, lng, dangerLevel, description, photoUrl, createdAt }] }]` |
| PATCH /reports/verify-many | ids, status (`verified` or `dismissed`) | anything |
| GET /announcements | | `[{ id, title, message, severity, lat?, lng?, createdAt }]` |
| POST /announcements | title, message, severity, lat?, lng? | anything |
| GET /polls | | `[{ id, question, options, counts, isActive, createdAt }]` |
| POST /polls | question, options | anything |
| POST /polls/:id/vote | optionIndex | anything (409 if already voted) |
| PATCH /polls/:id/close | | anything |

A `manifestation` is `{ id, name, description, startsAt, meetingLat, meetingLng, code }`.
Errors: Nest's normal `{ message }` is shown to the user.

## Map credit

Map tiles © OpenFreeMap, data © OpenStreetMap contributors. Keep the credit visible.
