import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import useGameStore from './store';
import { ToastProvider } from './components/ui/toast';

// For testing/debugging purposes
if (import.meta.env.DEV) {
  (window as any).store = useGameStore;
}


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </React.StrictMode>,
);
