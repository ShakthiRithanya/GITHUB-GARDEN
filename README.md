# GitHub Mood Garden 🌱

**GitHub Mood Garden** is a gamified visualizer for your GitHub activity. It turns your daily contribution graph into a living, breathing virtual garden. Consistent coding nurtures your plants, while missing days might make them droop. It also serves as a mindfulness tool, allowing you to log your daily mood alongside your code.

## 🌟 Key Features

- **Gamified Streaks**: Your contribution consistency directly impacts the health and growth stage of your virtual plant.
- **Garden Visualization**: Watch your plant grow from a seedling to a legendary bloom as you maintain your streak.
- **Mood Logging**: Track how you felt during your coding sessions (e.g., "Productive", "Stressed", "Flow").
- **Retro-Tamagotchi Vibe**: A nostalgic, playful UI to make checking your stats fun.

## 🛠 Tech Stack

- **Frontend**: React (TypeScript), Vite, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Auth**: GitHub OAuth

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL installed and running
- A GitHub OAuth App (Client ID & Secret)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/github-mood-garden.git
   cd github-mood-garden
   ```

2. **Setup Backend**
   ```bash
   cd server
   npm install
   # Create a .env file based on example
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd client
   npm install
   npm run dev
   ```

## 🗺 Roadmap

- [ ] **v1.0**: Core garden visualization, Contribution fetching, Mood logging.
- [ ] **v1.1**: Browser Extension for GitHub.com overlay.
- [ ] **v2.0**: Community gardens and Unlockable plant types.

## 📄 Design & Architecture

See [DESIGN.md](./DESIGN.md) for detailed architecture, database schema, and API contracts.
