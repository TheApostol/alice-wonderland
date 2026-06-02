# Alice in Wonderland — Tim Burton Edition
### Vercel Deployment Guide

---

## Project Structure

```
alice-wonderland/
├── api/
│   └── narrative.js        ← Serverless function (secure API proxy)
├── public/
│   └── index.html          ← The full 3D experience
├── vercel.json             ← Vercel routing config
└── README.md               ← This file
```

---

## Deploy in 5 Steps

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```
It will open a browser — authenticate with GitHub, Google, or email.

### 3. Deploy
Navigate into the project folder, then:
```bash
cd alice-wonderland
vercel
```
Answer the prompts:
- **Set up and deploy?** → `Y`
- **Which scope?** → your account
- **Link to existing project?** → `N`
- **Project name?** → `alice-wonderland` (or anything you want)
- **In which directory is your code?** → `.` (just press Enter)
- **Want to override settings?** → `N`

### 4. Add Your Anthropic API Key (CRITICAL)

After first deploy, go to:
**Vercel Dashboard → Your Project → Settings → Environment Variables**

Add:
| Name | Value |
|------|-------|
| `ANTHROPIC_API_KEY` | `sk-ant-api03-...` (your full key) |

Set it for: ✅ Production ✅ Preview ✅ Development

### 5. Redeploy to apply the env variable
```bash
vercel --prod
```

Your live URL will be: `https://alice-wonderland-[hash].vercel.app`

---

## How It Works

```
Browser (index.html)
    ↓ POST /api/narrative { zone, action }
Vercel Serverless Function (api/narrative.js)
    ↓ Uses process.env.ANTHROPIC_API_KEY (never exposed to browser)
Anthropic Claude API
    ↓ Returns character dialogue
Browser renders the typed narrative
```

Your API key **never touches the browser**. 100% secure.

---

## Controls (in-game)

| Key | Action |
|-----|--------|
| `Click` | Lock mouse / enter world |
| `WASD` | Move |
| `Mouse` | Look around |
| `E` | Enter portal (when near one) |
| `ESC` | Release mouse |

---

## Zones

| Zone | Location | Character |
|------|----------|-----------|
| The Rabbit Hole | Start (0,0) | White Rabbit |
| The Twisted Garden | East (+35,0) | Cheshire Cat |
| Mad Hatter's Tea Party | South (0,-40) | Mad Hatter |
| The Caterpillar Forest | West (-35,0) | Caterpillar |
| The Queen's Court | North (0,+40) | Red Queen |

---

## Troubleshooting

**Narration not working?**
→ Check that `ANTHROPIC_API_KEY` is set in Vercel env vars
→ Check Vercel Function logs: Dashboard → Project → Functions tab

**Blank screen?**
→ Check browser console for WebGL errors
→ Ensure browser supports WebGL2

**Pointer lock not working?**
→ Must be on HTTPS (Vercel deployment is always HTTPS ✅)
→ Won't work on HTTP localhost — use `vercel dev` for local testing

**Local development:**
```bash
vercel dev
```
This runs both the static files and serverless functions locally with env vars loaded from `.env.local`:
```
# .env.local (create this file, never commit it)
ANTHROPIC_API_KEY=sk-ant-api03-...
```

---

## Optional: Custom Domain

In Vercel Dashboard → Project → Settings → Domains
Add any domain you own. Free SSL included.
