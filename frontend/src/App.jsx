import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Suhu from "./pages/Suhu";

export default function App() {
  const [page, setPage] = useState("suhu");

  const renderPage = () => {
    switch (page) {
      case "suhu":
        return <Suhu />;
      case "dashboard":
        return <h1 className="p-5">Dashboard</h1>;
      case "sapi":
        return <h1 className="p-5">Data Sapi</h1>;
      case "detak":
        return <h1 className="p-5">Monitoring Detak Jantung</h1>;
      case "gerakan":
        return <h1 className="p-5">Monitoring Gerakan</h1>;
      default:
        return <h1 className="p-5">Pilih menu</h1>;
    }
  };

  return (
    <div className="flex">
      <Sidebar onSelect={setPage} />
      <div className="flex-1 p-5">{renderPage()}</div>
    </div>
  );
}
