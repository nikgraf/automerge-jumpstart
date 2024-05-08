import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./components/App/App.js";
import "./index.css";
import "./todos.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
