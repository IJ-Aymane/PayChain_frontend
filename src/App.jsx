import { useEffect, useState } from "react";

import { getMe, getStoredToken } from "./api/index.js";
import { Dashboard } from "./pages/Dashboard.jsx";
import { Login } from "./pages/Login.jsx";
import { Signup } from "./pages/Signup.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState("login");
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      if (!getStoredToken()) {
        setBooting(false);
        return;
      }

      try {
        const data = await getMe();
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setBooting(false);
      }
    }

    restoreSession();
  }, []);

  if (booting) {
    return <main className="grid min-h-screen place-items-center bg-slate-100 text-ink">Loading PayChain...</main>;
  }

  if (user) {
    return <Dashboard onLogout={() => setUser(null)} user={user} />;
  }

  if (screen === "signup") {
    return <Signup onAuthenticated={setUser} onSwitch={() => setScreen("login")} />;
  }

  return <Login onAuthenticated={setUser} onSwitch={() => setScreen("signup")} />;
}
