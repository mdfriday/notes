import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";

import { Provider } from "./provider.tsx";
// eslint-disable-next-line import/order
import App from "./App.tsx";
import "@/assets/css/globals.css";

import "./core/utils/i18n.ts";
import { ToolbarState } from "@/core/state/toolbarState.ts";

// Set default language to Chinese if not already set
if (!localStorage.getItem("APP_LANG")) {
  localStorage.setItem("APP_LANG", "zh");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider>
        <ToolbarState.Provider>
          <Analytics />
          <Toaster />
          <App />
        </ToolbarState.Provider>
      </Provider>
    </BrowserRouter>
  </React.StrictMode>,
);
