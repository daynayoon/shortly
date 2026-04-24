# Shortly — Frontend (React + Vite)

React frontend for the Shortly URL shortener. See the [root README](../README.md) for full project docs.

## Quick Start

```bash
# Create .env with backend URL
echo "VITE_API_URL=http://localhost:8080" > .env

npm install
npm run dev
# http://localhost:5173
```

## Build

```bash
npm run build
# Output: dist/
```

## Pages

| Route | Page | Auth |
|-------|------|------|
| `/` | Home — shorten a URL | Optional |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/dashboard` | User's URL list | Required |
| `/analytics/:code` | Click analytics charts | Required |
