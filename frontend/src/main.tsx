import { createRoot } from "react-dom/client";
import App from "./App";   // ✅ REMOVE .tsx
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
