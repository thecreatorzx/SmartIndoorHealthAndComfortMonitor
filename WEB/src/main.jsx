import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SensorProvider } from './context/SensorContext.jsx';
import {BrowserRouter as Router } from "react-router-dom"


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <SensorProvider>
        <App />
      </SensorProvider>
    </Router>
  </StrictMode>,
)
