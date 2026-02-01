import React, { useState } from 'react';
import EmailList from './components/EmailList';
import Config from './components/Config';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('emails');
  const [spreadsheetId, setSpreadsheetId] = useState(null);

  const handleConfigSaved = (id) => {
    setSpreadsheetId(id);
    // Rediriger automatiquement vers la page des emails après sauvegarde
    setTimeout(() => {
      setCurrentPage('emails');
    }, 1500);
  };

  return (
    <div className="App">
      <nav className="app-nav">
        <button 
          className={`nav-btn ${currentPage === 'emails' ? 'active' : ''}`}
          onClick={() => setCurrentPage('emails')}
        >
          📧 Emails
        </button>
        <button 
          className={`nav-btn ${currentPage === 'config' ? 'active' : ''}`}
          onClick={() => setCurrentPage('config')}
        >
          ⚙️ Configuration
        </button>
      </nav>

      <div className="app-content">
        {currentPage === 'emails' ? (
          <EmailList spreadsheetId={spreadsheetId} />
        ) : (
          <Config onConfigSaved={handleConfigSaved} />
        )}
      </div>
    </div>
  );
}

export default App;
