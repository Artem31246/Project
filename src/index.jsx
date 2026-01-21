import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import MainPage from "./MainPage";
import * as Sentry from "@sentry/react";


Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  sendDefaultPii: true,
  debug: true
});


const Root = () => {
  const [gpxFile, setGpxFile] = useState(null);

  
  if (gpxFile) {
    return <App initialFile={gpxFile} />;
  }


  
  return <MainPage onFileSelected={setGpxFile} />;
};

createRoot(document.getElementById("root")).render(<Root />);