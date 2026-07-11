import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// ponytail: wait for webfonts so landing doesn't flash system → Bebas/Grotesk
async function boot() {
  await Promise.race([
    document.fonts.ready,
    new Promise<void>((r) => setTimeout(r, 1500)),
  ]);
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

boot();
