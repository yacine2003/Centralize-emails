import React, { useState, useCallback, useEffect } from 'react';
import EmailItem from './EmailItem';
import './EmailList.css';

const EmailList = () => {
  // ID du Google Sheet codé en dur
  const SPREADSHEET_ID = '1BjyJQakQjODsh6yMsyVnSL6dPYvIoJ5R7RPCshSgJog';
  
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterEmail, setFilterEmail] = useState('all');

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

  // Extraire les adresses emails uniques
  const uniqueEmails = [...new Set(emails.map(e => e.accountEmail))].sort();

  const handleOpenEmail = async (email) => {
    if (!email.lbcPassword) {
      alert('Mot de passe Leboncoin non configuré pour ce compte dans le Google Sheet');
      return;
    }

    // Déterminer l'URL à ouvrir selon la catégorie
    let targetUrl;
    
    if (email.category === 'message') {
      // Pour les messages, ouvrir la page des messages
      targetUrl = 'https://www.leboncoin.fr/messages';
      console.log('📬 Ouverture de la page des messages');
    } else {
      // Pour les autres catégories, ouvrir le lien spécifique
      if (!email.leboncoinUrl) {
        alert('Aucun lien Leboncoin trouvé dans cet email');
        return;
      }
      targetUrl = email.leboncoinUrl;
      console.log('🔗 Ouverture du lien spécifique');
    }

    try {
      const response = await fetch('http://localhost:3001/api/emails/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: targetUrl,
          email: email.accountEmail,
          password: email.lbcPassword,
          accountId: email.accountId,
          category: email.category
        })
      });

      const data = await response.json();
      
      if (!response.ok || data.error) {
        // Afficher un message d'erreur plus clair selon le statut
        let errorMessage = data.error || 'Erreur inconnue';
        
        if (response.status === 409) {
          errorMessage += '\n\n💡 Conseil: Attendez quelques secondes et réessayez.';
        } else if (response.status === 408) {
          errorMessage += '\n\n💡 Conseil: Vérifiez votre connexion internet.';
        } else if (response.status === 503) {
          errorMessage += '\n\n💡 Le site Leboncoin peut être temporairement indisponible.';
        } else if (response.status === 401) {
          errorMessage += '\n\n💡 Vérifiez les identifiants dans le Google Sheet.';
        }
        
        alert(`❌ ${errorMessage}`);
        
        // Afficher les détails techniques dans la console pour le debug
        if (data.technicalDetails) {
          console.error('Détails techniques:', data.technicalDetails);
        }
      } else {
        console.log(`✅ Page ouverte: ${data.url}`);
        // Optionnel: afficher une notification de succès discrète
      }
    } catch (error) {
      console.error('Erreur:', error);
      
      let errorMessage = 'Impossible de se connecter au serveur.';
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage = 'Impossible de se connecter au serveur backend.\n\n💡 Vérifiez que le serveur est démarré (npm start dans le dossier backend).';
      }
      
      alert(`❌ ${errorMessage}`);
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
          <>
            <div className="emails-count">
              📊 {emails.filter(e => 
                (filterCategory === 'all' || e.category === filterCategory) &&
                (filterEmail === 'all' || e.accountEmail === filterEmail)
              ).length} email(s) affiché(s) sur {emails.length}
            </div>
            
            <div className="filter-section">
              <div className="filter-group">
                <div className="filter-label">📂 Par catégorie :</div>
                <div className="filter-buttons">
                  <button 
                    className={`filter-btn ${filterCategory === 'all' ? 'active' : ''}`}
                    onClick={() => setFilterCategory('all')}
                  >
                    📧 Tous
                  </button>
                  <button 
                    className={`filter-btn ${filterCategory === 'message' ? 'active' : ''}`}
                    onClick={() => setFilterCategory('message')}
                  >
                    💬 Messages
                  </button>
                  <button 
                    className={`filter-btn ${filterCategory === 'published' ? 'active' : ''}`}
                    onClick={() => setFilterCategory('published')}
                  >
                    ✅ Publiées
                  </button>
                  <button 
                    className={`filter-btn ${filterCategory === 'deleted' ? 'active' : ''}`}
                    onClick={() => setFilterCategory('deleted')}
                  >
                    🗑️ Supprimées
                  </button>
                  <button 
                    className={`filter-btn ${filterCategory === 'rejected' ? 'active' : ''}`}
                    onClick={() => setFilterCategory('rejected')}
                  >
                    ❌ Refusées
                  </button>
                </div>
              </div>

              <div className="filter-group">
                <div className="filter-label">👤 Par compte :</div>
                <div className="filter-buttons">
                  <button 
                    className={`filter-btn ${filterEmail === 'all' ? 'active' : ''}`}
                    onClick={() => setFilterEmail('all')}
                  >
                    📧 Tous les comptes
                  </button>
                  {uniqueEmails.map(email => (
                    <button 
                      key={email}
                      className={`filter-btn ${filterEmail === email ? 'active' : ''}`}
                      onClick={() => setFilterEmail(email)}
                    >
                      ✉️ {email}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
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
        
        {emails
          .filter(email => 
            (filterCategory === 'all' || email.category === filterCategory) &&
            (filterEmail === 'all' || email.accountEmail === filterEmail)
          )
          .map((email) => (
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
