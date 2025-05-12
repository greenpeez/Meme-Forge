import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add Roboto font
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap';
document.head.appendChild(link);

// Add title
const title = document.createElement('title');
title.textContent = 'Bani Meme Generator';
document.head.appendChild(title);

createRoot(document.getElementById("root")!).render(<App />);
