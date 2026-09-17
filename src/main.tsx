import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx'

window.addEventListener('error', (event) => {
  console.error("GLOBAL ERROR INTERCEPTED:", event.error?.stack || event.message);
  fetch('/api/log_error', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ error: event.error?.stack || event.message })
  }).catch(e=>console.log(e));
});
window.addEventListener('unhandledrejection', (event) => {
  let reason = event.reason;
  if (reason && reason.stack) reason = reason.stack;
  else if (typeof reason === 'object') {
    try { reason = JSON.stringify(reason); } catch (e) { reason = String(reason); }
  } else if (!reason) {
    reason = 'No reason provided (undefined/null)';
  } else {
    reason = String(reason);
  }
  
  if (reason === '{}' || reason.includes('No reason provided')) {
    event.preventDefault();
    return;
  }
  
  console.warn("GLOBAL PROMISE REJECTION INTERCEPTED:", reason);
  fetch('/api/log_error', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ error: reason })
  }).catch(e=>console.log(e));
});
;
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
