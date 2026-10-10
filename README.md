# EnvDiffWebApp ⚡

 A privacy-first, zero-backend developer utility that instantly compares `.env` files, highlights missing keys, detects type mismatches, and generates clean `.env.example` templates—executed 100% locally in your browser.



# The Problem It Solves

Software development teams frequently encounter silent app crashes, missing variables, and configuration bugs after pulling updates or switching feature branches. 
* **The Missing Key Trap:** A teammate adds a crucial environment variable (e.g., `STRIPE_WEBHOOK_SECRET`) to production or staging without notifying the rest of the team.
* **Outdated Templates:** Maintaining accurate `.env.example` boilerplate files manually is tedious and prone to human error.
* **Security & Privacy Risks:** Developers often hesitate to paste sensitive configuration keys (`DATABASE_URL`, API tokens, JWT secrets) into third-party online diff tools due to fears that cloud servers or logs will store confidential credentials.

### The Solution
**EnvDiffWebApp** solves this by providing a dual-panel comparative inspection engine that runs entirely within the client-side DOM. **Zero data, logs, or secrets ever leave your machine.**

---

## 🛠️ Tech Stack & Architecture

EnvDiffWebApp is built as an ultra-fast, zero-server static application optimized for performance, developer experience, and complete privacy:

* **Frontend Framework:** React + Vite (Static Edge Build)
* **Styling & Design System:** Tailwind CSS (featuring a warm paper theme `#FBF8F3`, hairline borders, and high-contrast status tokens)
* **Iconography:** Lucide React (`lucide-react`)
* **Parsing Engine:** Client-side `dotenv` parser (`dotenv.parse()`)
* **Diff & Type Inference Engine:** Custom Set algebra engine evaluating data type signatures (Strings, URLs, Numbers, Booleans, and Secrets)
* **URL Compression:** `lz-string` (packs non-sensitive template diffs into URL hash fragments for secure team sharing without a backend database)
* **Hosting:** Vercel / GitHub Pages (Zero server costs, infinite global scaling)

---

## ✨ Key Features

1. **100% Client-Side Privacy Guarantee:** Operates entirely in browser memory. No telemetry or server storage of environment secrets.
2. **Side-by-Side Split View:** Dual reactive input fields supporting direct raw text pasting and drag-and-drop `.env` file ingestion.
3. **Intelligent Type & Format Inference:** Automatically detects and flags mismatches across data types (e.g., checking if a local port is a number while production expects a boolean or URI).
4. **One-Click `.env.example` Generator:** Automatically strips real sensitive credential values and outputs a clean sanitized template ready for version control.
5. **URL Hash Sharing:** Encodes mock/sample configuration states directly into a secure URL hash fragment (`#data=...`) so teammates can inspect bugs without server transit.

---

## 📦 Getting Started & Installation

### 1. Clone the Repository
```bash
git clone [https://github.com/degifetise/EnvDiffWebApp.git](https://github.com/degifetise/EnvDiffWebApp.git)
cd EnvDiffWebApp
2. Install Dependencies
Bash
npm install
3. Run the Development Server
Bash
npm run dev
Open your browser at http://localhost:5173/ to view the local application.

📂 Project Structure
Plaintext
EnvDiffWebApp/
├── public/               # Static assets & favicons
├── src/
│   ├── components/       # UI layout, panels, and diff result views
│   ├── utils/            # Dotenv parsing, type inference, & LZ compression
│   ├── App.jsx           # Main state orchestrator
│   ├── index.css         # Tailwind directives & paper theme variables
│   └── main.jsx          # Application entry point
├── index.html            # HTML shell & font imports
├── package.json          # Project dependencies & scripts
└── vite.config.js        # Vite & Tailwind configuration
📄 License
Distributed under the MIT License
