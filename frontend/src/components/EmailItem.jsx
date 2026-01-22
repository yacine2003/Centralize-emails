import React from 'react';
import './EmailItem.css';

const EmailItem = ({ email, onClick }) => {
  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="email-item" onClick={onClick}>
      <div className="email-header">
        <div className="email-subject">
          <span className="email-icon">📨</span>
          {email.subject}
        </div>
        <div className="email-date">
          🕒 {formatDate(email.date)}
        </div>
      </div>
      
      <div className="email-meta">
        <span className="email-meta-item">
          <strong>De:</strong> {email.from}
        </span>
        <span className="email-meta-item">
          <strong>Compte:</strong> {email.accountEmail}
        </span>
      </div>
      
      <div className="email-snippet">
        {email.snippet}
      </div>
      
      {email.leboncoinUrl && (
        <div className="email-link">
          🔗 Lien Leboncoin disponible - Cliquez pour ouvrir
        </div>
      )}
      
      {!email.leboncoinUrl && (
        <div className="email-no-link">
          ⚠️ Aucun lien Leboncoin trouvé
        </div>
      )}
    </div>
  );
};

export default EmailItem;
