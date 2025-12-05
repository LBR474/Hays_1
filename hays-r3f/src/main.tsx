import React from "react";
import ReactDOM from "react-dom/client";
//import HaysLogo3D from "./HaysLogo3DText";
import HaysLogo3D from "./HaysLogoGLB_3";
import "./App.css";
ReactDOM.createRoot(
  document.getElementById("hays-3d-container") as HTMLElement
).render(
  <React.StrictMode>
    <HaysLogo3D />
  </React.StrictMode>
);


