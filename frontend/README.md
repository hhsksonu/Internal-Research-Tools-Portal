# Research Portal — Frontend

A React frontend for the Research Portal API. Provides a clean, responsive UI for uploading financial documents and running AI-powered analysis tools.

## Tech Stack

- **React 18** — UI framework
- **React Router v6** — client-side routing
- **Axios** (as fallback) — HTTP requests
- **CSS Modules** — scoped, hand-written styles (no Tailwind, no UI library)
- **Google Fonts** — Space Mono + Sora

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Navbar.js / Navbar.css
│   │   ├── Footer.js / Footer.css
│   │   └── Layout.js / Layout.css
│   ├── context/
│   │   └── AppContext.js      ← global state (uploaded files, status)
│   ├── pages/
│   │   ├── Home.js / Home.css
│   │   ├── Upload.js / Upload.css
│   │   ├── FinancialExtraction.js
│   │   ├── EarningsSummary.js / EarningsSummary.css
│   │   ├── ToolPage.css       ← shared tool page styles
│   │   └── NotFound.js / NotFound.css
│   ├── services/
│   │   └── api.js             ← all API calls to backend
│   ├── App.js                 ← routing
│   ├── index.js               ← entry point
│   └── index.css              ← global CSS variables & reset
├── .env                       ← REACT_APP_API_URL=http://localhost:8000
├── .gitignore
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Backend running on `http://localhost:8000`

### Install & Run

```bash
cd frontend
npm install
npm start
```

Open http://localhost:3000 in your browser.

### Build for Production

```bash
npm run build
```

Outputs static files to `build/` folder. Deploy to any static host (Netlify, Vercel, S3, etc.).

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `REACT_APP_API_URL` | `http://localhost:8000` | Backend API base URL |

Change the `.env` file to point to your deployed backend.

## Pages

| Route | Description |
|---|---|
| `/` | Landing page with feature overview |
| `/upload` | Drag & drop file uploader (PDF/TXT) |
| `/financial-extraction` | Run financial data extraction → download Excel |
| `/earnings-summary` | Run earnings call analysis → view structured JSON |

## API Integration

All API calls live in `src/services/api.js`:

- `uploadFiles(files)` → `POST /upload`
- `getUploadedFiles()` → `GET /files`
- `runFinancialExtraction()` → `POST /tools/financial-extraction` (returns Blob)
- `runEarningsSummary()` → `POST /tools/earnings-summary` (returns JSON)

## Deployment

For production, set `REACT_APP_API_URL` to your backend URL. If deploying backend and frontend separately, ensure CORS is configured on the backend.

Tested deployment targets:
- **Frontend**: Netlify, Vercel, GitHub Pages (static `build/`)
- **Backend**: Render, Railway, Fly.io
