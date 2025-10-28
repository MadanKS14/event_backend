# Event Backend

Express + MongoDB API for the Event Management Dashboard with JWT auth and Socket.io realtime updates.

## Tech Stack
- Node.js, Express
- MongoDB via Mongoose
- JWT Authentication
- Socket.io (websockets)
- CORS enabled

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB connection URI

### Installation
```bash
cd event_backend
npm install
```

### Environment Variables
Create a `.env` file in `event_backend/` with:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
```

Render deployment example variables are declared in `render.yaml` (values managed in dashboard).

### Scripts
```bash
# start production server
npm start

# start in dev mode with reload
npm run dev
```

### Run
```bash
node server.js    # or npm start / npm run dev
```

Server listens on `PORT` (default 5000) and mounts routes at `/api`.

## API Overview

Base URL: `http://localhost:5000/api`

All protected routes require header:
```
Authorization: Bearer <jwt>
```

### Auth & Users (`/api/users`)
- `POST /register` — body: `{ name, email, password, role: "user"|"admin" }`
- `POST /login` — body: `{ email, password }`
- `GET /me` — auth required — returns current user (no password)
- `GET /` — admin only — list users (no password)
- `PUT /profile` — auth required — body: `{ name?, password? }` — returns updated user and new token
- `POST /` — admin only — create user — body: `{ name, email, password, role }`

### Events (`/api/events`)
- `GET /` — auth required —
  - admin: all events
  - user: events where user is an attendee
- `POST /` — admin only — body: `{ name, description, date, location }` — creator auto-added as attendee
- `GET /:id` — auth required — admin or attendee can view
- `PUT /:id` — admin only; cannot modify past events
- `DELETE /:id` — admin only; cannot delete past events; cascades delete tasks
- `POST /:id/attendees` — admin only — body: `{ userId }` — cannot add to past events
- `DELETE /:id/attendees` — admin only — body: `{ userId }` — cannot remove from past events

### Tasks (`/api/tasks`)
- `POST /` — admin only — body: `{ name, deadline, eventId, assignedAttendeeId }` — emits `task-created`
- `GET /event/:eventId` — auth required —
  - admin: all tasks for event
  - user: only tasks assigned to them for event
- `PUT /:id` — auth required — body: `{ status: "Pending"|"Completed" }` — admin or assigned user; emits `task-updated`
- `GET /progress/:eventId` — auth required — returns `{ progress }` percent

## WebSockets

Namespace: default. The server joins/leaves rooms by event id.

Client should:
```js
socket.emit('join-event-room', eventId);
// later
socket.emit('leave-event-room', eventId);
```

Emitted events:
- `task-created` (payload: task)
- `task-updated` (payload: task)

## CORS
Server allows `origin: *` in development. For production, set strict origins using `FRONTEND_URL` and configure as needed.

## Project Structure
```
event_backend/
├─ server.js
├─ config/
│  └─ db.js
├─ controllers/
├─ middleware/
├─ models/
├─ routes/
└─ render.yaml
```

## Deployment
- Render: see `render.yaml` and `RENDER_DEPLOYMENT.md`
- Vercel: `vercel.json` included (for reference)


