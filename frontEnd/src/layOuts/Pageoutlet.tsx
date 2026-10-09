// src/assets/Layouts/Pageoulet.jsx
// Mirrors repo's frontEnd/src/assets/Layouts/Pageoulet.tsx exactly

import { Outlet } from "react-router-dom";
import Headers from "./Headers";
import Footers from "./Footers";
import { MobileNavProvider } from "../context/MobileNavContext";
import "./Pageoutlet.css";


const Pageoulet = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <MobileNavProvider>
        <Headers />
        <div className="mobile-bottom-nav-spacer" />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footers />
      </MobileNavProvider>
    </div>
  );
};

export default Pageoulet;