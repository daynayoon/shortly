# Shortly — URL Shortener

A full-stack URL shortening service with click analytics. Users can shorten any URL and track detailed statistics including country, device, browser, and click history for each link.


---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 6, Tailwind CSS v4, Recharts, React Router 6, Axios |
| Backend | Java 17, Spring Boot 3, Spring Security 6, JWT (jjwt 0.11.5), JPA/Hibernate, Lombok |
| Database | PostgreSQL (Neon) |
| Cache | Redis (Upstash) |
| Hosting | Vercel (frontend) · Render (backend) |

---

## System Architecture

```mermaid
graph TD
    Browser["User's Browser"]

    subgraph Vercel
        React["React App\n/ Home\n/dashboard\n/analytics/:code\n/login  /register"]
    end

    subgraph Render
        API["Spring Boot API\nshortly-api.onrender.com"]
    end

    subgraph Neon
        PG[("PostgreSQL\nusers / urls / clicks")]
    end

    subgraph Upstash
        Redis[("Redis Cache\nshortCode → URL\nTTL: 24h")]
    end

    Browser -- "REST + JWT (HTTPS)" --> React
    React -- "REST API calls" --> API
    Browser -- "GET /{shortCode}" --> API
    API -- "JPA queries" --> PG
    API -- "Cache read/write" --> Redis
```

---

## URL Shortening Flow

```mermaid
sequenceDiagram
    participant User
    participant React
    participant API
    participant DB as PostgreSQL
    participant Cache as Redis

    User->>React: Paste long URL, click Shorten
    React->>API: POST /api/urls/shorten
    API->>DB: INSERT into urls (original_url)
    DB-->>API: Return auto-generated id (e.g. 12345)
    API->>API: Base62 encode id → "dnh"
    API->>DB: UPDATE urls SET short_code = "dnh"
    API->>Cache: SET "dnh" = original_url (TTL 24h)
    API-->>React: { shortUrl: ".../dnh" }
    React-->>User: Display short URL + copy button
```

---

## Redirect Flow

```mermaid
flowchart TD
    A["Browser: GET /dnh"] --> B{"Redis\nCache HIT?"}
    B -- Yes --> C["Return original URL ⚡"]
    B -- No --> D["Query PostgreSQL\nSELECT * FROM urls\nWHERE short_code = 'dnh'"]
    D --> E{"Found?"}
    E -- No --> F["404 Not Found"]
    E -- Yes --> G{"Active &\nnot expired?"}
    G -- No --> H["410 Gone"]
    G -- Yes --> I["Write to Redis\nTTL 24h"]
    I --> C
    C --> J["HTTP 302 Redirect → original URL"]
    J --> K["@Async: Record click\nIP → GeoIP → country/city\nUser-Agent → device/browser\nSave to clicks table"]
```

The click is recorded **asynchronously** — the user experiences zero delay from analytics tracking.

---

## JWT Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant React
    participant API
    participant DB as PostgreSQL

    User->>React: Submit email + password
    React->>API: POST /api/auth/login
    API->>DB: SELECT * FROM users WHERE email = ?
    DB-->>API: User record
    API->>API: BCrypt.verify(password, hash)
    API->>API: Generate JWT (userId, email, exp: 24h)
    API-->>React: { token, email, name }
    React->>React: localStorage.setItem('token', jwt)

    Note over React,API: Every subsequent request
    React->>API: GET /api/urls\nAuthorization: Bearer eyJ...
    API->>API: JwtFilter: validate token\nset SecurityContext
    API-->>React: Protected resource
```

---

## Database Schema (ERD)

```mermaid
erDiagram
    USERS {
        bigint id PK
        varchar email "UNIQUE NOT NULL"
        varchar password "BCrypt hashed"
        varchar name
        timestamp created_at
    }

    URLS {
        bigint id PK
        bigint user_id FK "nullable (anonymous)"
        text original_url
        varchar short_code "UNIQUE e.g. dnh"
        varchar title "optional"
        boolean is_active "default true"
        timestamp expires_at "nullable"
        timestamp created_at
    }

    CLICKS {
        bigint id PK
        bigint url_id FK
        varchar ip_address
        varchar country "e.g. South Korea"
        varchar country_code "e.g. KR"
        varchar city
        varchar device_type "mobile/desktop/tablet"
        varchar browser "Chrome/Safari/Firefox"
        varchar referrer
        timestamp clicked_at
    }

    USERS ||--o{ URLS : "owns"
    URLS ||--o{ CLICKS : "has"
```

---

## Base62 Encoding

Database IDs are encoded into short, URL-safe codes using Base62 (a–z, A–Z, 0–9 = 62 characters).

```
ID: 1       → "b"
ID: 100     → "bM"
ID: 12345   → "dnh"
ID: 99999   → "q0T"

Capacity:
  5 chars = 62^5 =  916,132,832 unique URLs
  6 chars = 62^6 = 56,800,235,584 unique URLs
```

The same ID always produces the same code — no collision checking needed, no random generation required.

---

## API Reference

### Auth — Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account → returns JWT |
| POST | `/api/auth/login` | Login → returns JWT |

### URLs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/urls/shorten` | Optional | Shorten a URL |
| GET | `/api/urls` | Required | List user's URLs |
| DELETE | `/api/urls/{id}` | Required | Delete a URL |
| PATCH | `/api/urls/{id}/toggle` | Required | Enable/disable a URL |

### Redirect — Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/{shortCode}` | 302 redirect + async click tracking |

### Analytics

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/analytics/{shortCode}` | Required | Clicks by date, country, device, browser |

---

## Project Structure

```
Shortly/
├── shortly-client/               ← React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx          ← URL input + result
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx     ← User's URL list
│   │   │   └── Analytics.jsx     ← Charts (Recharts)
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── UrlCard.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   └── api/axios.js          ← JWT interceptor
│   ├── .env                      ← gitignored
│   └── .env.production
│
└── shortly-api/                  ← Spring Boot backend
    └── src/main/java/com/shortly/
        ├── controller/           ← HTTP handlers
        ├── service/              ← Business logic
        ├── repository/           ← JPA (DB access)
        ├── model/                ← JPA entities
        ├── dto/                  ← Request/response objects
        ├── config/               ← Redis, Security, CORS beans
        ├── security/             ← JWT filter + util
        └── util/Base62Encoder.java
```

---

## Local Development

### Prerequisites

- Node.js 18+
- Java 17+
- Maven 3.x (or use the `.m2` wrapper)

### 1. Backend

Copy your credentials into `shortly-api/src/main/resources/application-local.properties` (already gitignored):

```properties
spring.datasource.url=your_neon_postgres_url
spring.datasource.username=your_db_username
spring.datasource.password=your_db_password

spring.data.redis.host=your_upstash_host
spring.data.redis.port=6379
spring.data.redis.password=your_upstash_password
spring.data.redis.ssl.enabled=true

jwt.secret=your_32_char_secret_key
app.base-url=http://localhost:8080
```

```bash
cd shortly-api
mvn spring-boot:run -Dspring-boot.run.profiles=local
```
> **PowerShell users:** use `cd shortly-api; mvn spring-boot:run -Dspring-boot.run.profiles=local`

API available at **http://localhost:8080**

### 2. Frontend

```bash
cd shortly-client
# .env is already set to http://localhost:8080
npm install
npm run dev
# App available at http://localhost:5173
```

---

## Build

### Frontend

```bash
cd shortly-client
npm run build
# Output: shortly-client/dist/
```

### Backend (JAR)

```bash
cd shortly-api
mvn clean package -DskipTests
# Output: shortly-api/target/shortly-api-0.0.1-SNAPSHOT.jar
```

---

## Deployment

| Service | Platform | Config |
|---------|----------|--------|
| Frontend | Vercel | Auto-deploys from `main` branch; uses `.env.production` |
| Backend | Render | Docker deploy; env vars set in Render dashboard |
| Database | Neon | PostgreSQL — Hibernate auto-creates tables on first run |
| Cache | Upstash | Redis with TLS |

### Backend Dockerfile

```dockerfile
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Required environment variables on Render

```
DB_URL            postgresql://user:pass@host/db?sslmode=require
DB_USERNAME       your_db_user
DB_PASSWORD       your_db_password
REDIS_HOST        your-db.upstash.io
REDIS_PORT        6379
REDIS_PASSWORD    your_redis_password
JWT_SECRET        your_32_char_secret
APP_BASE_URL      https://shortly-api.onrender.com
```

---

## If Time Permits

- **Country click analytics**: Country data currently shows as "Unknown" in Analytics. Requires integrating [MaxMind GeoLite2](https://dev.maxmind.com/geoip/geolite2-free-geolocation-data) free database for IP → country lookup. Look up the IP in `ClickService.recordClick()` and store the result via `click.setCountry()`.
