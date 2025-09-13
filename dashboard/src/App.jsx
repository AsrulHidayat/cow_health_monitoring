import { useState } from "react";
import Sidebar from "./components/sidebar";

function App() {
  const [menu, setMenu] = useState("dashboard");

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar onSelect={setMenu} />

      {/* Main Content */}
      <div className="flex-1 p-6">
        {menu === "dashboard" && <h1 className="text-2xl font-bold">📊 Dashboard</h1>}
        {menu === "sapi" && <h1 className="text-2xl font-bold">🐄 Data Sapi</h1>}
        {menu === "suhu" && <h1 className="text-2xl font-bold">🌡️ Monitoring Suhu</h1>}
        {menu === "detak" && <h1 className="text-2xl font-bold">❤️ Detak Jantung</h1>}
        {menu === "gerakan" && <h1 className="text-2xl font-bold">📈 Gerakan</h1>}
      </div>
    </div>
  );
}

export default App;
