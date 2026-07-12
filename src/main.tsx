import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { vocabulary } from "./data/vocabulary";
import { seedKanjiReadingsFromDetails } from "./utils/alignFurigana";
import "./styles/global.css";
import "./styles/player.css";

for (const item of vocabulary) {
  seedKanjiReadingsFromDetails(item.kanjiDetails);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
