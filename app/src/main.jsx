import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { process } from 'process';
import ContextProvider from './Context/ContextProvider.jsx';
import '@solana/wallet-adapter-react-ui/styles.css';

window.process = process;


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ContextProvider>
      <App />
    </ContextProvider>
  </React.StrictMode>,
)
