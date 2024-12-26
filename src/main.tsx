import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import { NextUIProvider } from "@nextui-org/system";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Theme appearance="dark">
      <NextUIProvider>
        <main className="dark text-foreground bg-background">
          <App />
        </main>
      </NextUIProvider>
    </Theme>
  </React.StrictMode>,
);
