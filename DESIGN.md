# GitHub Mood Garden - Design Document

## 1. High-Level Architecture

```mermaid
graph TD
    User[User] -->|Interacts| Client[Frontend (React + Vite)]
    Client -->|REST API| Server[Backend (Node.js + Express)]
    Server -->|Read/Write| DB[(PostgreSQL Database)]
    Server -->|OAuth & Data Fetching| GitHub[GitHub API]
    Client -->|Optional Extension| Browser[Browser Extension]
    Browser -->|Fetches State| Server
    Browser -->|DOM Injection| GitHubPage[GitHub.com Profile]
```

**Flow:**
1.  **Auth**: User logs in via GitHub OAuth. backend exchanges code for token, creates/updates User in DB.
2.  **Data Fetch**: Backend background job (or on-login) fetches contribution data from GitHub API.
3.  **Core Logic**: Backend calculates streaks, active days, and updates Plant health/stage in DB.
4.  **UI Render**: Frontend fetches `Garden` state and `Stats` to render the virtual garden.
5.  **Interaction**: User logs mood via Frontend; Backend stores it in `MoodLog`.

---

## 2. File/Folder Structure

We will use a standard monorepo-like structure with `client` and `server` at the top level.

```text
/mood-garden
├── /client                 # Frontend (React + Vite + Tailwind)
│   ├── /public             # Static assets (favicons, manifest)
│   ├── /src
│   │   ├── /assets         # Plant SVGs, Garden backgrounds
│   │   ├── /components     # Reusable UI components (GardenView, StatsCard, MoodModal)
│   │   ├── /pages          # Page layouts (Home, Dashboard, Login)
│   │   ├── /hooks          # Custom hooks (useAuth, useGarden)
│   │   ├── /services       # API fetch wrappers
│   │   └── main.tsx        # Entry point
│   ├── index.html
│   └── vite.config.ts
├── /server                 # Backend (Node.js + Express)
│   ├── /src
│   │   ├── /config         # Env variables, DB config
│   │   ├── /controllers    # Route logic (auth, garden, stats)
│   │   ├── /models         # DB Models (Sequelize/TypeORM or raw SQL wrappers)
│   │   ├── /routes         # API Route definitions
│   │   ├── /services       # Business logic (GitHubFetcher, StreakCalculator)
│   │   ├── /utils          # Helpers
│   │   └── app.ts          # App setup
│   ├── /db                 # Migrations and seeds
│   └── package.json
├── /extension              # (Optional) Browser Extension
│   ├── manifest.json
│   └── /src                # Content scripts, popup
├── README.md
└── .gitignore
```

---

## 3. Database Schema (PostgreSQL)

```sql
-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    github_id VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    access_token TEXT, -- Encrypted in real app; basic storage for MVP
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Plants Table (State of the user's garden)
CREATE TABLE plants (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(50) DEFAULT 'sunflower', -- e.g., 'cactus', 'bonsai'
    stage VARCHAR(50) DEFAULT 'seedling', -- 'seedling', 'growing', 'blooming', 'legendary'
    health INTEGER DEFAULT 100, -- 0-100
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily Stats (Cache for contribution history)
CREATE TABLE daily_stats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    date DATE NOT NULL,
    contributions_count INTEGER DEFAULT 0,
    is_active_day BOOLEAN DEFAULT FALSE,
    UNIQUE(user_id, date)
);

-- Mood Logs (User input)
CREATE TABLE mood_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    date DATE NOT NULL,
    mood VARCHAR(50), -- 'Happy', 'Stressed', 'Productive', 'Burned out'
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);
```

---

## 4. API Contracts

### Auth
- **GET /auth/github**: Redirect to GitHub OAuth.
- **GET /auth/github/callback**: Callback handling -> Returns JWT or Session Cookie.

### User & Garden
- **GET /api/me**
  - **Response**:
    ```json
    {
      "user": { "username": "octocat", "avatar": "..." },
      "plant": { "type": "sunflower", "stage": "blooming", "health": 95 }
    }
    ```

### Stats
- **GET /api/stats?range=90d**
  - **Response**:
    ```json
    {
      "currentStreak": 12,
      "longestStreak": 45,
      "activeDaysLast30": 28,
      "history": [
        { "date": "2023-10-01", "count": 5, "mood": "Productive" },
        ...
      ]
    }
    ```

### Mood
- **POST /api/mood**
  - **Body**: `{ "date": "2023-10-27", "mood": "Happy", "note": "Fixed the bug!" }`
  - **Response**: `{ "success": true, "log": { ... } }`

---

## 5. Implementation Plan (Milestones)

### Milestone 1: Foundation & Auth (2-3 Hours)
- [ ] Initialize Git repo & Project Structure.
- [ ] Set up Express Backend with basic Health Check.
- [ ] Set up React Frontend (Vite) with Tailwind CSS.
- [ ] Implement GitHub OAuth flow (Backend routes + Frontend redirect).
- [ ] Create PostgreSQL DB and connect Backend.

### Milestone 2: The Data Engine (2-3 Hours)
- [ ] Implement `GitHubService` to fetch contribution data (Graph API or Scraper).
- [ ] Create `StreakCalculator` logic.
- [ ] API Endpoint `/api/stats` to return calculated streaks and history.
- [ ] Simply display raw stats on Frontend to verify.

### Milestone 3: The Garden Visuals (3-4 Hours)
- [ ] Design/Acquire SVG assets for Plant stages (Seedling -> Legendary).
- [ ] Implement `PlantService` to update plant state based on streaks/missed days.
- [ ] Create `GardenView` component in React to render the current plant state.
- [ ] Add basic animations (swaying, growing).

### Milestone 4: Mood & Polish (2-3 Hours)
- [ ] Create Mood Log UI (Modal/Sidebar).
- [ ] Connect Mood API (POST/GET).
- [ ] Overlay Mood on the Contribution/History timeline.
- [ ] Final UI Polish (Colors, Fonts, Responsive layout).

