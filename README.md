# PayChain Frontend

Standalone Vite React frontend for PayChain.

## Local Run

```bash
npm install
cp .env.example .env
npm run dev
```

Set `VITE_API_BASE_URL` to your backend API URL, for example:

```text
VITE_API_BASE_URL=http://localhost:4000/api
```

## Render Docker Deploy

Create a Docker Web Service with this directory as the repository/root directory.

Set this build/runtime environment variable:

```text
VITE_API_BASE_URL=https://your-backend.onrender.com/api
```

The nginx runtime listens on Render `PORT`, defaulting to `10000`.
