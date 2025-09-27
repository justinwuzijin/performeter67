import React from 'react'
import './styles.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Performative Meter</h1>
        <p className="subtitle">Sidebar Extension</p>
      </header>
      
      <main className="app-main">
        <div className="placeholder-content">
          <div className="placeholder-box">
            <h3>Welcome to Performative Meter!</h3>
            <p>This sidebar is now active on Tinde!!!r.</p>
            <p>You can customize this React component to add your performance tracking features.</p>
          </div>
          
          <div className="feature-list">
            <h4>Planned Features:</h4>
            <ul>
              <li>Performance metrics tracking</li>
              <li>Real-time analytics</li>
              <li>Customizable dashboard</li>
              <li>Data visualization</li>
            </ul>
          </div>
        </div>
      </main>
      
      <footer className="app-footer">
        <p>Built with React + Vite</p>
      </footer>
    </div>
  )
}

export default App
