import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import router from "./router";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {router}
  </React.StrictMode>,
);
