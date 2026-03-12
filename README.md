# StudyForge

AI-powered study tools: slide generator, cheatsheet forge, and poster creator.

## Tech Stack
- **Next.js 16** (App Router)
- **Gemini 2.0 Flash** — free AI inference (users bring their own API key)
- **Vercel** — free deployment

## Getting Started

```bash
npm install
npm run dev
```

## Deploy to Vercel (Free)

1. Push to GitHub
2. Import repo at vercel.com
3. Deploy — no env variables needed (API key entered by users in UI)

## Getting a Gemini API Key (Free)

1. Go to https://aistudio.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Paste into any tool in StudyForge

## Tools

- `/slides` — AI slide generator → self-contained HTML presentations
- `/cheatsheet` — Upload notes/PYPs → dense A4 cheatsheets grounded on your content
- `/poster` — Create academic posters and infographics

## To Upgrade AI Model

In `lib/gemini.ts`, change the model string to `gemini-2.0-flash-exp` or `gemini-1.5-pro` for higher quality.
