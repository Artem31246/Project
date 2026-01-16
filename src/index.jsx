import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import * as Sentry from "@sentry/react";
import "./styles/app.css";


Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  sendDefaultPii: true,
  debug: true
});


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
