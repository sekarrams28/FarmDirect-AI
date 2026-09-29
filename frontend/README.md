# FarmDirect AI — frontend (React + Vite + Tailwind)

## Run it

```bash
cd frontend
cp .env.example .env      # VITE_API_URL, defaults to http://localhost:5000/api
npm install
npm run dev                # http://localhost:5173
```

Make sure `backend/` (port 5000) and `ai-service/` (port 8000) are running
first — see the root `README.md`. For a quick working demo, run
`npm run seed` in `backend/` and log in with one of the seeded accounts
shown on the login page.

## What's wired up

- **Auth** — register/login (JWT stored in `localStorage`), role-aware
  redirects (`farmer` / `buyer` / `fpo` / `admin`).
- **Marketplace** — browse and search live listings from `GET /api/marketplace`.
- **Produce detail** — "Get AI demand & price insight" calls
  `/api/ai/demand` and `/api/ai/price`, which forward to the Python service.
  Buyers can submit an offer from the same page.
- **Farmer dashboard** — lists your own produce, lets you list new produce,
  and calls `/api/ai/farm-advisor` for a sell/wait recommendation per listing.
- **Buyer dashboard** — your orders and their status.
- **Admin dashboard** — platform totals and a crop-supply chart from
  `/api/admin/dashboard` and `/api/admin/analytics` (using Recharts).
- **FPO dashboard** — stubbed; wire up once FPO membership management exists
  on the backend.
- **5-language i18n** — English, Tamil, Hindi, Telugu, Kannada, via
  `src/i18n/*.json` and `LanguageContext`. Currently covers nav, auth and
  home copy; extend the JSON files as you localise more screens.

## Not included yet (by design, to keep the MVP scope from the plan)

- Voice input, offline queueing/PWA behaviour, and the interactive AI-flow
  demo animation — these live in the standalone marketing site
  (`index.html`, shared separately) as a fast way to demo the concept.
  Port whichever pieces you want into real screens here as you build them out.
- Payments, buyer-match ranking UI, and route-optimisation UI — the backend
  endpoints (`/api/ai/buyer-match`, `/api/ai/logistics`) exist; add pages/
  components that call them when you're ready.
