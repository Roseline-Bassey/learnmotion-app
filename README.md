# LearnMotion

Upload a video (or paste a YouTube link) and get a step-by-step breakdown of
every animation in it — element, motion type, timing, and easing — powered by
Gemini 2.5 Flash.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Add your Gemini API key:

   ```bash
   cp .env.local.example .env.local
   ```

   Then edit `.env.local` and set `GEMINI_API_KEY` to a key from
   [Google AI Studio](https://aistudio.google.com/app/apikey).

3. Run the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## How it works

- `/` — upload a clip (MP4/MOV, up to 20MB) or paste a YouTube link.
- `/analyzing` — calls `/api/analyze`, which sends the video (or YouTube URL)
  to Gemini 2.5 Flash and waits for a structured breakdown.
- `/results` — renders the returned steps as cards, with a button to copy them
  as a plain-text snippet.

The video file, YouTube URL, and analysis result are held in memory via
`context/AnalysisContext.tsx` (a React Context), not localStorage — this
avoids trying to serialize large video files into browser storage.

## Deploying to Vercel

1. Push this repo to GitHub (or import it directly from your local folder).
2. Import the project into [Vercel](https://vercel.com/new).
3. In the Vercel project's **Settings → Environment Variables**, add
   `GEMINI_API_KEY` with your key (the `.env.local` file is not deployed).
4. Deploy — Vercel's free tier covers this project, including the
   `/api/analyze` route (it runs on the Node.js runtime, not Edge).
