import { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  username: string;
  avatar_url: string;
}

interface Plant {
  stage: 'seedling' | 'growing' | 'blooming' | 'legendary' | 'wilted';
  health: number;
}

interface Stats {
  streak: number;
  totalContributions: number;
}

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const [plant, setPlant] = useState<Plant | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check for token in URL
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');

    if (urlToken) {
      localStorage.setItem('token', urlToken);
      setToken(urlToken);
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data.user);
      setPlant(res.data.plant);
      setStats(res.data.stats);
    } catch (err) {
      console.error(err);
      // If 403/401, maybe logout
      if (axios.isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 403)) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setPlant(null);
  };

  const getPlantEmoji = (stage: string) => {
    switch (stage) {
      case 'seedling': return '🌱';
      case 'growing': return '🌿';
      case 'blooming': return '🌻';
      case 'legendary': return '🌳';
      case 'wilted': return '🥀';
      default: return '🌱';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-slate-800 font-sans">
      <header className="mb-8 text-center">
        <h1 className="text-5xl font-extrabold text-garden-800 mb-4 tracking-tight">
          GitHub Mood Garden <span className="text-4xl">🌱</span>
        </h1>
        {user ? (
          <div className="flex items-center justify-center space-x-3 mt-4">
            <img src={user.avatar_url} alt={user.username} className="w-10 h-10 rounded-full border-2 border-garden-500" />
            <p className="text-xl text-slate-600">Welcome, <span className="font-bold text-slate-800">{user.username}</span>!</p>
            <button onClick={logout} className="text-xs text-red-500 hover:underline">Logout</button>
          </div>
        ) : (
          <p className="text-xl text-slate-600 max-w-lg mx-auto">
            Visualize your coding consistency as a living digital garden.
          </p>
        )}
      </header>

      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-4xl border border-slate-100">

        {!token ? (
          // LOGIN VIEW
          <div className="text-center py-12">
            <div className="mb-8 text-9xl animate-bounce">🧑‍🌾</div>
            <h2 className="text-2xl font-bold mb-6">Ready to grow your garden?</h2>
            <button
              className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex items-center justify-center space-x-2 mx-auto"
              onClick={() => window.location.href = 'http://localhost:5000/auth/github'}
            >
              <span>Login with GitHub</span>
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
            </button>
          </div>
        ) : loading ? (
          // LOADING VIEW
          <div className="flex flex-col items-center justify-center h-80">
            <div className="text-6xl animate-spin mb-4">🌻</div>
            <p className="text-slate-500 font-medium">Watering your garden...</p>
          </div>
        ) : (
          // DASHBOARD VIEW
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

            {/* Garden View */}
            <div className="bg-garden-100 rounded-2xl h-80 flex items-center justify-center relative overflow-hidden group hover:shadow-inner transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-t from-garden-200 to-transparent opacity-50"></div>

              <div className="relative z-10 text-center animate-sway origin-bottom">
                <div className="text-9xl filter drop-shadow-xl transform transition-transform duration-700 group-hover:scale-110">
                  {plant ? getPlantEmoji(plant.stage) : '🌱'}
                </div>
                <div className="mt-4 bg-white/80 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-semibold text-garden-900 shadow-sm inline-block capitalize">
                  {plant?.stage || 'Seedling'}
                </div>
              </div>
            </div>

            {/* Stats View */}
            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <h3 className="text-sm uppercase tracking-wide text-slate-500 font-bold mb-1">Current Streak</h3>
                <div className="flex items-baseline space-x-2">
                  <span className="text-5xl font-black text-garden-600">{stats?.streak || 0}</span>
                  <span className="text-lg text-slate-600 font-medium">days</span>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <h3 className="text-sm uppercase tracking-wide text-slate-500 font-bold mb-1">Health</h3>
                <div className="w-full bg-slate-200 rounded-full h-4 mt-2 overflow-hidden">
                  <div
                    className="bg-garden-500 h-4 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(74,222,128,0.5)]"
                    style={{ width: `${plant?.health || 0}%` }}
                  ></div>
                </div>
                <p className="text-right text-xs text-slate-500 mt-2 font-mono">{plant?.health || 0}/100</p>
              </div>

              <div className="p-4 bg-blue-50 text-blue-800 rounded-xl text-sm border border-blue-100">
                💡 <strong>Tip:</strong> Commit consistently to evolve your plant to the next stage!
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
