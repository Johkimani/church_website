// src/assets/Layouts/Pageoulet.jsx
// Mirrors repo's frontEnd/src/assets/Layouts/Pageoulet.tsx exactly

import { Outlet } from "react-router-dom";
import Headers from "./Headers";
import Footers from "./Footers";


const Pageoulet = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Headers />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footers />
    </div>
  );
};

export default Pageoulet;