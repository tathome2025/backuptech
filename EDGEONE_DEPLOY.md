# EdgeOne Pages Deployment

This repository supports both platforms:

- Vercel uses `/api/*.js`
- EdgeOne Pages uses `/node-functions/api/*.js`

Recommended EdgeOne Pages settings:

- Framework preset: Other
- Root directory: `./`
- Output directory: `/`
- Node.js version: `20.x`

Required environment variables:

- `DEEPSEEK_API_KEY`
- `DEEPSEEK_MODEL` (optional)
- `RESEND_API_KEY`
- `INQUIRY_FROM_EMAIL`

Notes:

- Keep the existing `/api` directory for Vercel.
- Keep the new `/node-functions/api` directory for EdgeOne Pages.
- Frontend requests to `/api/chat` and `/api/inquiry` can stay unchanged.
- One custom domain cannot point to Vercel and EdgeOne Pages at the same time. Use separate hostnames if both must stay online.
- If you later add `vercel.json` redirects or headers, migrate the same rules to `edgeone.json`.
