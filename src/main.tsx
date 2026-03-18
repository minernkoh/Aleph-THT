import React from "react";
import ReactDOM from "react-dom/client";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import App from "./App";

ModuleRegistry.registerModules([AllCommunityModule]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

