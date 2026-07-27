# Postliner — booking demo (React + Django)

A full-stack rebuild of an intercity coach booking form, inspired by
Postliner's public booking page. Not affiliated with Postal Corporation of
Kenya — a fan-made clone for demo/learning purposes.

```
postliner-clone/
├── backend/    Django + Django REST Framework API (SQLite)
└── frontend/   React + Vite single-page app
```

## What it does

- Pick a journey (Busia → Nairobi or Nairobi → Busia), pickup/dropoff stage,
  and travel date
- Browse a departure board of coach times, coaches and fares
- Pick seats on a literal 2+2 bus seat map (booked seats are disabled per
  schedule + date)
- Enter passenger details and confirm — the backend validates seats aren't
  already taken and returns a booking reference + e-ticket
- Server-side seat-clash protection: two people can't book the same seat on
  the same trip/date

## Backend setup (Django)

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate   # optional but recommended
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data      # loads demo locations, routes, schedules
python manage.py runserver 8000
```

API will be at `http://localhost:8000/api/`. Key endpoints:

| Method | Path                                  | Purpose                          |
|--------|----------------------------------------|-----------------------------------|
| GET    | `/api/locations/`                      | List pickup/dropoff towns        |
| GET    | `/api/routes/`                         | List journeys (directions)       |
| GET    | `/api/schedules/?route=<id>`           | Departures for a route           |
| GET    | `/api/schedules/<id>/seats/?date=YYYY-MM-DD` | Seat availability for a trip/date |
| POST   | `/api/bookings/`                       | Create a booking                 |
| GET    | `/api/bookings/<reference>/`           | Fetch a booking by reference     |

Optional: create an admin user to browse data at `/admin/`:

```bash
python manage.py createsuperuser
```

## Frontend setup (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:5173`. It talks to the API at the URL in
`frontend/.env` (`VITE_API_URL`, defaults to `http://localhost:8000/api`).

Run both the backend and frontend dev servers at the same time, then open
the frontend URL in your browser.

## Design

Dark "night coach" shell with a paper ticket-stub card as the centerpiece —
perforated-edge divider, a literal bus seat map, and a mono-typeset e-ticket
with reference code + barcode on confirmation. Fonts: Space Grotesk
(display), Inter (UI), JetBrains Mono (data/seat numbers).
