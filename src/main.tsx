import { registerSW } from 'virtual:pwa-register';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);

registerSW({ immediate: true });
