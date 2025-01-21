import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import { Provider as ReduxProvider } from 'react-redux'
import { store } from './redux/store'

import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import { NextUIProvider } from "@nextui-org/system";

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import { MantineProvider } from '@mantine/core';

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Theme appearance="dark">
        <ReduxProvider store={store}>
        <MantineProvider defaultColorScheme="dark">
          <NextUIProvider>
            <main className="dark text-foreground bg-background">
              <App />
            </main>
          </NextUIProvider>
        </MantineProvider>
      </ReduxProvider>
    </Theme>
  </React.StrictMode>,
);
