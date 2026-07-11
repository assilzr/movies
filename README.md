# LUMEN — deployment guide

This is a Vite + React project. It runs anywhere that can build a static
site (Vercel, Netlify, GitHub Pages, or your own server).

Data (accounts, catalog edits, watchlists) is stored in the browser's
`localStorage`, so it's per-browser/per-device — there's no shared backend.

## Run it locally first (recommended)

You'll need [Node.js](https://nodejs.org) installed (v18 or newer).

```bash
cd lumen-app
npm install
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`).

## Deploy on Vercel (easiest)

1. Create a free account at [vercel.com](https://vercel.com)
2. Push this `lumen-app` folder to a GitHub repository
3. In Vercel, click **Add New → Project**, pick your repo
4. Vercel auto-detects Vite — leave the defaults (Build command: `vite build`,
   Output directory: `dist`) and click **Deploy**
5. You'll get a live URL in about a minute

## Deploy on Netlify

1. Create a free account at [netlify.com](https://netlify.com)
2. Push this folder to GitHub, then **Add new site → Import an existing project**
3. Build command: `npm run build` — Publish directory: `dist`
4. Deploy

## Deploy without GitHub (drag and drop)

```bash
npm install
npm run build
```

This creates a `dist` folder. Drag that folder onto
[app.netlify.com/drop](https://app.netlify.com/drop) for an instant live link
— no account or Git required.

## Notes

- Login/registration is a **demo only** — accounts are plain objects in
  `localStorage`, not a secure authentication system. Don't reuse a real
  password.
- Video playback uses a public sample clip, not real movie files.
- Poster art is generated with CSS gradients, not real images.
