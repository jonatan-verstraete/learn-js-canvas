import React, { createRoot } from "react-dom/client";

// import App from "./v0";
// import App from "./v1";
// import App from "./v3-rt";
// import App from "./v3.2-rt-TRIPPYY";
// import App from "./v3.3-remastered";

import App from "./v4-audioPro";

import "./styles.css";

const root = document.getElementById("root");

if (root) {
  createRoot(root).render(<App />);
}
