import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register Service Worker for Offline PWA Capabilities
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('PWA ServiceWorker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.warn('PWA ServiceWorker registration failed:', error);
      });
  });
} else if ('serviceWorker' in navigator) {
  // Also register in dev/preview so offline PWA testing works!
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

createRoot(document.getElementById('root')!).render(<App />);
