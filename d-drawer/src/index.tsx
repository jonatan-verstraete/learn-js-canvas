import React, { createRoot } from "react-dom/client";

// import App from "./v0";
// import App from "./v1";
import App from "./v3-rt";
// import App from "./v3.2-rt-TRIPPYY";
// import App from "./v3.3-remastered";

// import App from "./v4-audioPro";

import "./styles.css";
import { memo, useEffect, useState } from "react";

const AppRapper = memo(() => {
  // @ts-ignore
  const [hasInteracted, setHasInteracted] = useState(window.hasInteracted);

  useEffect(() => {
    const onInteract = () => {
      // @ts-ignore
      window.hasInteracted = true
      setHasInteracted(true);
    }
    if (!hasInteracted) {
      document.addEventListener("click", onInteract);
    }

    return () => {
      document.removeEventListener("click", onInteract);
    };
  });

  return hasInteracted ? (
    <App key='app' />
  ) : (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        fontSize: "5rem",
      }}
    >
      <div>click anywhere</div>
    </div>
  );
})

const root = document.getElementById("root");

if (root) {
  createRoot(root).render(<AppRapper />);
}
