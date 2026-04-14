import { useState } from "react";
import Auth from "./Auth";
import Dashboard from "./Dashboard";

export default function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return <Auth onSuccess={setUser} />;
  }

  return <Dashboard user={user} onLogout={() => setUser(null)} />;
}
