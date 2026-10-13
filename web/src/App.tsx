import { createContext, useContext, useEffect, useState } from "react";
import { Navigate, NavLink, Route, Routes } from "react-router-dom";
import { api, type Health } from "./api";
import BankPage from "./pages/BankPage";
import ProblemPage from "./pages/ProblemPage";
import RandomPage from "./pages/RandomPage";
import AdventureHome from "./pages/AdventureHome";
import AdventureMapPage from "./pages/AdventureMapPage";
import MistakesPage from "./pages/MistakesPage";
import HistoryPage from "./pages/HistoryPage";
import StatsPage from "./pages/StatsPage";

const HealthCtx = createContext<Health | null>(null);
export const useHealth = () => useContext(HealthCtx);

const NAV = [
  { to: "/problems", ico: "📋", label: "题库" },
  { to: "/random", ico: "🎲", label: "随机" },
  { to: "/adventure", ico: "🗺️", label: "探险" },
  { to: "/mistakes", ico: "📕", label: "错题本" },
  { to: "/history", ico: "🕘", label: "历史" },
  { to: "/stats", ico: "📈", label: "统计" },
];

export default function App() {
  const [health, setHealth] = useState<Health | null>(null);
  useEffect(() => {
    api.health().then(setHealth).catch(() => setHealth(null));
  }, []);

  return (
    <HealthCtx.Provider value={health}>
      <div className="app">
        <aside className="sidebar">
          <div className="logo">🧩</div>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}>
              <span className="ico">{n.ico}</span>
              <span>{n.label}</span>
            </NavLink>
          ))}
        </aside>
        <div className="main">
          <Routes>
            <Route path="/" element={<Navigate to="/problems" replace />} />
            <Route path="/problems" element={<BankPage />} />
            <Route path="/problem/:id" element={<ProblemPage />} />
            <Route path="/random" element={<RandomPage />} />
            <Route path="/mistakes" element={<MistakesPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/adventure" element={<AdventureHome />} />
            <Route path="/adventure/:chapterId" element={<AdventureMapPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="*" element={<Navigate to="/problems" replace />} />
          </Routes>
        </div>
      </div>
    </HealthCtx.Provider>
  );
}
