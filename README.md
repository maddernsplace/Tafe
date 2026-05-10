# 📚 TAFE Study Dashboard

A personal AI-ready study vault built with **React + Vite**, hosted entirely on **GitHub Pages**.

Track assessments, manage course materials, save study notes (paste ChatGPT/Claude answers), upload files, and eventually connect an AI chatbot to all your uploaded content.

---

## Features

- **Dashboard** – overview of all courses, assessments, overdue/due-soon alerts, quick actions, study streak
- **Courses** – add/edit/delete courses (CHCEDS049, CHCEDS033, CHCDIV001…), click through to course detail
- **Assessments** – track status (Not Started → In Progress → Submitted → Completed), filter/sort/search
- **Study Notes** – paste ChatGPT or Claude answers, Markdown rendering, tags, search
- **File Library** – upload PDFs, DOCX, images; drag-and-drop; stored in browser (localStorage)
- **Study Assistant** – AI chatbot UI placeholder (ready for OpenAI integration)
- **Settings** – export/import JSON backup, clear data, dark/light theme toggle
- Dark/Light mode · Australian date format DD/MM/YYYY · Mobile responsive

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 | UI framework |
| Vite 5 | Build tool / dev server |
| React Router v6 | Client-side routing |
| react-markdown | Markdown rendering for notes |
| react-dropzone | Drag-and-drop file uploads |
| lucide-react | Icons |
| localStorage | Browser-side data storage (upgradeable) |

---

## Folder Structure

```
tafe-study-dashboard/
├── public/                 # Static assets (favicon)
├── src/
│   ├── components/
│   │   ├── Layout/         # Sidebar, Header, Layout wrapper
│   │   ├── Dashboard/      # StatCard, CourseCard, AssessmentRow, QuickActions
│   │   ├── common/         # Modal, Badge, SearchBar, ConfirmDialog
│   │   └── forms/          # CourseForm, AssessmentForm, NoteForm, FileUploadForm
│   ├── context/
│   │   ├── AppContext.jsx   # Global state (courses, assessments, notes, files)
│   │   └── ThemeContext.jsx # Dark/light mode
│   ├── data/
│   │   └── sampleData.js   # Starter courses, assessments, notes, files
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Courses.jsx
│   │   ├── CoursePage.jsx  # Individual course detail
│   │   ├── Assessments.jsx
│   │   ├── StudyNotes.jsx
│   │   ├── FileLibrary.jsx
│   │   ├── StudyAssistant.jsx
│   │   ├── Settings.jsx
│   │   └── partials/       # NoteCard, FileItem (shared between pages)
│   ├── services/
│   │   └── storage.js      # All localStorage read/write (swap for Supabase here)
│   ├── utils/
│   │   └── dateUtils.js    # Australian date formatting, overdue/due-soon helpers
│   ├── App.jsx             # Routes
│   ├── main.jsx            # Entry point
│   └── index.css           # All styles (CSS variables, dark/light themes)
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions → GitHub Pages CI/CD
├── vite.config.js
├── package.json
└── README.md
```

---

## Running Locally

### 1. Prerequisites
- [Node.js 18+](https://nodejs.org/) installed
- A terminal (Command Prompt, PowerShell, or macOS/Linux terminal)

### 2. Install

```bash
# Clone the repository
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>

# Install dependencies
npm install
```

### 3. Start development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for production

```bash
npm run build
```

Output goes to the `dist/` folder.

---

## Deploying to GitHub Pages

### Option A – GitHub Actions (Recommended, automatic)

1. Push the repo to GitHub.
2. Go to **Settings → Pages**.
3. Under **Source**, select **GitHub Actions**.
4. Push to `main` – the `deploy.yml` workflow builds and deploys automatically.

The site will be live at: `https://<username>.github.io/<repo-name>/`

> **Important:** If deploying to a project site (not `username.github.io`), set the
> `VITE_BASE_PATH` environment variable in `deploy.yml` to `/<repo-name>/`:
>
> ```yaml
> VITE_BASE_PATH: /tafe-study-dashboard/
> ```

### Option B – Manual deploy (gh-pages package)

```bash
npm install --save-dev gh-pages
npm run build
npx gh-pages -d dist
```

---

## GitHub Pages Routing

React Router uses client-side routing. GitHub Pages doesn't support server-side redirects, so:

- The app uses `BrowserRouter` with the correct `base` path via `VITE_BASE_PATH`.
- All unknown routes (`*`) redirect to Dashboard.
- No 404 redirect hack is needed because the app is a single HTML file.

---

## Future: Upgrading to Supabase

All data access goes through `src/services/storage.js`. To migrate:

1. `npm install @supabase/supabase-js`
2. Create a `.env` file:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Replace the `localStorage` calls in `storage.js` with Supabase `from(...).select()/insert()/update()/delete()` calls.
4. For file uploads, replace `FileReader` base64 encoding with `supabase.storage.from('files').upload(...)`.

---

## Future: AI Integration

The **Study Assistant** page (`src/pages/StudyAssistant.jsx`) has detailed code comments explaining how to connect OpenAI.

### High-level steps

1. **Never expose API keys in the frontend.** Use a serverless function:
   - Supabase Edge Functions
   - Netlify / Vercel Functions
   - Cloudflare Workers

2. Create an OpenAI Vector Store and upload study notes/PDFs to it.

3. Enable the **File Search** tool on your OpenAI Assistant or Responses API call.

4. The serverless function receives the user's question, calls the OpenAI API with your Vector Store attached, and returns the answer.

5. In the frontend, replace the placeholder `fetch` call:
   ```js
   const response = await fetch('/api/chat', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ message: userInput }),
   })
   const { reply } = await response.json()
   ```

6. For RAG (Retrieval-Augmented Generation):
   - Chunk notes into segments
   - Embed with `text-embedding-3-small`
   - Store in Supabase `pgvector`
   - At query time: embed question → find top-k chunks → inject into prompt

---

## Where to Safely Add API Keys

| Key | Location | How |
|-----|----------|-----|
| Supabase URL + Anon Key | `.env` file | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| OpenAI API Key | Server/serverless function only | `process.env.OPENAI_API_KEY` – **never in frontend** |
| Firebase config | `.env` file | `VITE_FIREBASE_*` variables |

> **Never commit `.env` to Git.** It's in `.gitignore` already.

---

## Sample Data

On first load the app seeds:

**Courses:** CHCEDS049, CHCEDS033, CHCDIV001

**Assessments:** Observation Task, Legal and Ethical Responsibilities Report, Diversity Reflection Journal, Support Plan Development, Communication Strategies Portfolio

**Notes & Files:** example study notes with Markdown content and placeholder file entries.

---

## License

MIT – free to use and modify for personal study.
