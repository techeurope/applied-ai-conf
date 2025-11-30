# Applied AI Conf by {Tech: Europe}

Conference website for Applied AI Conf - May 28, 2026 at Delta Campus, Berlin.

## Tech Stack

- Next.js 15 with App Router
- React 19, TypeScript
- Tailwind CSS v4
- React Three Fiber for shader graphics

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up environment variables

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Then fill in your values:

```
BEEHIIV_API_KEY=your_api_key_here
BEEHIIV_PUBLICATION_ID=your_publication_id_here
```

Get these from: beehiiv dashboard > Settings > Integrations > API

### 3. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `BEEHIIV_API_KEY` | API key for newsletter signups | Yes |
| `BEEHIIV_PUBLICATION_ID` | Your beehiiv publication ID | Yes |

## Deployment

Deploy on Vercel - make sure to add the environment variables in your project settings.
