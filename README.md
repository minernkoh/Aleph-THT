# Aleph Technologies – UI Developer Take-Home

This repo contains a React + TypeScript app implementing the 4 take-home tasks:

- **Task 1**: Reusable AIO paginated table (`AG Grid` + pagination sub-component)
- **Task 2**: Process flow editor (nodes + edges tables) + interactive canvas with add, connect, inline edit, and context menu (`React Flow`). Node creation is shared across table + canvas to keep default `Node N` names unique.
- **Task 3**: Report generation with LLM narrative + PDF export (Google **Gemini** via Express API, `jspdf-autotable`, `jsPDF`). PDFs use searchable text and tables; charts are embedded as images.
- **Task 4**: Analytics dashboard (pie/bar/line/scatter) using `src/data/mock_results.json` (`Recharts`)

## Tech Stack

| Category   | Technologies |
|-----------|---------------|
| Frontend  | React 18, TypeScript, Vite 7, React Router 7, React Bootstrap, AG Grid, Recharts, React Flow, dagre, react-markdown |
| Backend   | Express 4, Google Generative AI (Gemini) |
| PDF       | jsPDF, jspdf-autotable, html2canvas |
| Validation | Zod |
| Icons     | @phosphor-icons/react |
| Linting   | ESLint 9, Prettier |

## Project Structure

```
src/
  components/       # UI components by feature
    charts/         # Recharts components (shared `ChartShell` wrapper)
    Task1-PaginatedTable/  # Task 1
    Task2-ProcessFlow/     # Task 2
    Task3-ReportGenerator/ # Task 3
  hooks/            # Custom data hooks
  services/         # PDF export
  pages/            # Route entry pages
  constants/        # Shared constants
  context/          # Theme context (dark/light mode toggle)
  data/             # Mock data loader
  utils/            # Utilities
  types.ts          # Shared types (incl. chart/table view models)
server/
  index.ts          # Express API (Gemini narrative proxy)
  narrativeSchema.ts # Zod schema for narrative request validation
```

## Running locally

**Frontend only** (Task 3 narrative generation requires the API key; without it a template fallback is used):

```bash
npm install
npm run dev
```

Then open the dev server URL shown in the terminal. The app supports **dark mode** via a navbar toggle; it also detects your system preference on first load.

**Full stack** (Task 3 can call Gemini for narrative generation):

1. Copy `.env.example` to `.env`.
2. Add your Gemini API key to `.env` (from [Google AI Studio](https://aistudio.google.com/apikey)). The key is used **server-side only** by the Express server; it is never sent to the browser.
3. Run both the API server and the dev server:

```bash
npm run dev:all
```

A valid Gemini API key is required for narrative generation. If the key is missing or invalid, the report falls back to a deterministic template narrative and PDF export still works, but LLM-generated content will be unavailable.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run server` | Start Express API server (Gemini proxy) |
| `npm run dev:all` | Run API server and Vite dev server together |
| `npm run typecheck` | Run TypeScript project build checks |
| `npm run build` | TypeScript build + Vite production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run format` | Format source with Prettier |

## Notes (Task 3)

- A valid **Gemini API key is required** for narrative generation. If the server is not running or the key is not set, the report uses a deterministic template narrative so PDF export still works, but LLM-generated content will be unavailable.
- The key is used **only on the Express server** (`server/index.ts`). The frontend calls `/api/generate-narrative`, which is proxied to the server; the key is never exposed to the browser. Do not commit `.env` or keys.
- PDF export uses **jspdf-autotable** for searchable tables and `jsPDF` text for the narrative; charts are captured with `html2canvas` and embedded as images.
