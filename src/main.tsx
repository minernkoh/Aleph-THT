/**
 * App bootstrap (entrypoint).
 *
 * This file runs once in the browser: it registers third-party modules/styles,
 * then mounts the React app into the `#root` element from `index.html`.
 */
import React from "react";
import ReactDOM from "react-dom/client";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import App from "./App";

// AG Grid uses a module system; we register what we need up-front.
ModuleRegistry.registerModules([AllCommunityModule]);

const root = document.getElementById("root");
if (!root) throw new Error("Root element #root not found in index.html");

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

