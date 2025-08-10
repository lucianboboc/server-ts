# Boot.dev Chirpy API - Learn HTTP Servers in TypeScript

### A minimal REST API for a microblogging app called Chirpy.

Base URL
- Local development: http://localhost:${PORT}
- All API endpoints are prefixed as shown below. Static files are served under /app.

Environment variables
- PORT: Port the server listens on (number)
- PLATFORM: dev or prod (string). Affects /admin/reset access.
- SECRET: HS256 JWT signing secret (string)
- POLKA_KEY: Shared ApiKey for webhook authorization (string)
- DB_URL: Postgres connection string for drizzle (string)

Authentication overview
- JWT access token: Bearer <jwt> in Authorization header. Created by POST /api/login, expires in 1 hour.
- Refresh token: Bearer <refresh_token> in Authorization header for /api/refresh and /api/revoke. Refresh tokens are long random strings stored in DB with expiry and revocation support. They are returned by POST /api/login.
- ApiKey: ApiKey <key> in Authorization header for the webhook endpoint. Must equal POLKA_KEY.

Error format
For handled errors, the API returns application/json with this shape:
- Status: one of 400, 401, 403, 404
- Body: { "error": "message" }
For unexpected errors, status 500 with body: { "error": "Something went wrong on our end" }

Endpoints

Health
GET /api/healthz
- Description: Liveness/readiness check
- Headers: none
- Query: none
- Body: none
- Responses:
  - 200 text/plain: OK

Admin/Diagnostics
GET /admin/metrics
- Description: Simple HTML page showing file server hit counter
- Headers: none
- Responses:
  - 200 text/html

POST /admin/reset
- Description: Reset file server hit counter and delete all users (dev only)
- Headers: none
- Responses:
  - 200 text/plain: "Hits: 0"
  - 403 {"error":"Forbidden"} when PLATFORM != dev

Static files
GET /app/*
- Description: Serves static files from ./src/app, increments hit counter

Users & Auth
POST /api/users
- Description: Create a new user
- Headers: Content-Type: application/json
- Body: { "email": string, "password": string }
- Responses:
  - 201 application/json: { id, email, createdAt, updatedAt, isChirpyRed }
  - 500 on conflicts or server errors

PUT /api/users
- Description: Update current user email and password (requires JWT)
- Headers:
  - Authorization: Bearer <jwt>
  - Content-Type: application/json
- Body: { "email": string, "password": string }
- Responses:
  - 200 application/json: { id, email, createdAt, updatedAt, isChirpyRed }
  - 401 {"error":"Unauthorized"} or {"error":"Invalid JWT token"} etc. if missing/invalid token
  - 404 {"error":"User not found"}

POST /api/login
- Description: Login with email + password, returns JWT and refresh token
- Headers: Content-Type: application/json
- Body: { "email": string, "password": string }
- Responses:
  - 200 application/json: { id, email, createdAt, updatedAt, isChirpyRed, token, refreshToken }
  - 401 {"error":"Invalid credentials"}

POST /api/refresh
- Description: Exchange a valid refresh token for a new JWT
- Headers: Authorization: Bearer <refresh_token>
- Responses:
  - 200 application/json: { token }
  - 401 {"error":"Invalid refresh token"}

POST /api/revoke
- Description: Revoke a refresh token
- Headers: Authorization: Bearer <refresh_token>
- Responses:
  - 204 No Content
  - 401 {"error":"Invalid refresh token"}

POST /api/polka/webhooks
- Description: Webhook to upgrade a user to Chirpy Red
- Headers: Authorization: ApiKey <POLKA_KEY>
- Body: { "event": string, "data": { "userId": string } }
- Responses:
  - 204 No Content
  - 400 {"error":"Missing userId"}
  - 401 {"error":"Invalid apiKey"} or {"error":"Missing user"}

Chirps
GET /api/chirps
- Description: List chirps, optionally filtered by author and sorted
- Headers: none
- Query:
  - authorId: string (optional) — filter by userId
  - sort: "asc" | "desc" (optional, default "asc") — sort by createdAt
- Responses:
  - 200 application/json: Array of chirp objects: { id, body, userId, createdAt, updatedAt }

GET /api/chirps/:chirpID
- Description: Get a single chirp by ID
- Headers: none
- Responses:
  - 200 application/json: { id, body, userId, createdAt, updatedAt }
  - 404 {"error":"No chirp found for ID ..."}

POST /api/chirps
- Description: Create a chirp (max 140 chars)
- Headers:
  - Authorization: Bearer <jwt>
  - Content-Type: application/json
- Body: { "body": string }
- Responses:
  - 201 application/json: { id, body, userId, createdAt, updatedAt }
  - 400 {"error":"Invalid body or userId"} or {"error":"Chirp is too long. Max length is 140"}
  - 401 {"error":"Invalid credentials"} when missing/invalid Authorization

DELETE /api/chirps/:chirpID
- Description: Delete a chirp owned by the authenticated user
- Headers: Authorization: Bearer <jwt>
- Responses:
  - 204 No Content
  - 401 {"error":"Invalid JWT token"}/Unauthorized if token invalid
  - 403 {"error":"Forbidden"} if attempting to delete someone else’s chirp
  - 404 {"error":"No chirp found for ID ..."}

Data models (response objects)
- User: { id: string, email: string, isChirpyRed: boolean, createdAt: string, updatedAt: string }
- Chirp: { id: string, body: string, userId: string, createdAt: string, updatedAt: string }
- Token refresh response: { token: string }
- Login response: User fields + { token: string, refreshToken: string }

Curl examples
- Create user:
  curl -X POST http://localhost:$PORT/api/users \
    -H 'Content-Type: application/json' \
    -d '{"email":"a@b.com","password":"secret"}'

- Login:
  curl -X POST http://localhost:$PORT/api/login \
    -H 'Content-Type: application/json' \
    -d '{"email":"a@b.com","password":"secret"}'

- Create chirp:
  curl -X POST http://localhost:$PORT/api/chirps \
    -H "Authorization: Bearer $JWT" \
    -H 'Content-Type: application/json' \
    -d '{"body":"Hello Chirpy!"}'

- List chirps by user, newest first:
  curl "http://localhost:$PORT/api/chirps?authorId=$USER_ID&sort=desc"

- Refresh token:
  curl -X POST http://localhost:$PORT/api/refresh \
    -H "Authorization: Bearer $REFRESH_TOKEN"

- Revoke refresh token:
  curl -X POST http://localhost:$PORT/api/revoke \
    -H "Authorization: Bearer $REFRESH_TOKEN"

Run locally
- Install: npm install
- Configure: copy .env and set PORT, PLATFORM, SECRET, POLKA_KEY, DB_URL
- Start: npm run build && npm start (or npm run dev if available)
