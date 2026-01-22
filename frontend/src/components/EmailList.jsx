import React, { useState, useCallback, useEffect } from 'react';
import EmailItem from './EmailItem';
import './EmailList.css';

const EmailList = () => {
  // ID du Google Sheet codé en dur
  const SPREADSHEET_ID = '10gWvODEEzozfzh-86lsDeBbF5sKH4WFWzzNcu6UwK7Y';
  
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(
        `http://localhost:3001/api/emails/leboncoin?spreadsheetId=${SPREADSHEET_ID}`
      );
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des emails');
      }
      
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setEmails(data.emails || []);
        if (data.emails.length === 0) {
          setError('Aucun email Leboncoin trouvé');
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de se connecter au serveur. Vérifiez que le backend est démarré.');
    } finally {
      setLoading(false);
    }
  }, [SPREADSHEET_ID]);

  // Charger automatiquement les emails au démarrage
  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const handleOpenEmail = async (email) => {
    if (!email.leboncoinUrl) {
      alert('Aucun lien Leboncoin trouvé dans cet email');
      return;
    }

    if (!email.lbcPassword) {
      alert('Mot de passe Leboncoin non configuré pour ce compte dans le Google Sheet');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/emails/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: email.leboncoinUrl,
          email: email.accountEmail,
          password: email.lbcPassword,
          accountId: email.accountId
        })
      });

      const data = await response.json();
      
      if (data.error) {
        alert(`Erreur: ${data.error}`);
      } else {
        console.log('✅ Lien ouvert avec succès');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'ouverture du lien');
    }
  };

  return (
    <div className="email-list-container">
      <div className="header">
        <h1>📧 Emails Leboncoin Centralisés</h1>
        <p className="subtitle">Tous vos emails Leboncoin en un seul endroit</p>
      </div>

      <div className="config-section">
        <div className="action-group">
          <button 
            onClick={fetchEmails} 
            disabled={loading}
            className="fetch-button"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Chargement des emails...
              </>
            ) : (
              '🔄 Rafraîchir les emails'
            )}
          </button>
        </div>
        
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}
      </div>

      <div className="stats">
        {emails.length > 0 && (
          <div className="emails-count">
            📊 {emails.length} email(s) trouvé(s)
          </div>
        )}
      </div>

      <div className="emails-list">
        {emails.length === 0 && !loading && !error && (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>Aucun email chargé</h3>
            <p>Entrez l'ID de votre Google Sheet et cliquez sur "Rafraîchir"</p>
          </div>
        )}
        
        {emails.map((email) => (
          <EmailItem
            key={email.id}
            email={email}
            onClick={() => handleOpenEmail(email)}
          />
        ))}
      </div>
    </div>
  );
};

export default EmailList;
