import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster position="bottom-right" toastOptions={{ duration: 3000, style: { background:'#1e2536', color:'#e8edf5', border:'1px solid #2a3347', borderRadius:'10px', fontSize:'13.5px' } }} />
    </BrowserRouter>
  </React.StrictMode>
);
