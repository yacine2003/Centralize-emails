import React, { useState, useEffect } from 'react';
import './Config.css';

const Config = ({ onConfigSaved }) => {
  const [sheetInput, setSheetInput] = useState('');
  const [extractedId, setExtractedId] = useState('');
  const [sheetInfo, setSheetInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Charger la configuration existante au montage
  useEffect(() => {
    const loadExistingConfig = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/config');
        if (response.ok) {
          const data = await response.json();
          if (data.spreadsheetId) {
            setSheetInput(data.spreadsheetId);
            setExtractedId(data.spreadsheetId);
            // Charger les infos du sheet
            verifySheet(data.spreadsheetId);
          }
        }
      } catch (err) {
        console.error('Erreur chargement config:', err);
      }
    };
    
    loadExistingConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const extractSpreadsheetId = (input) => {
    const trimmed = input.trim();
    
    // Regex pour extraire l'ID depuis l'URL
    const urlMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    
    if (urlMatch) {
      return urlMatch[1];
    }
    
    // Si pas d'URL détectée, considérer que c'est l'ID directement
    if (trimmed.length > 20 && /^[a-zA-Z0-9-_]+$/.test(trimmed)) {
      return trimmed;
    }
    
    return null;
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSheetInput(value);
    setError('');
    setSuccess('');
    setSheetInfo(null);
    
    // Extraire l'ID en temps réel
    const id = extractSpreadsheetId(value);
    setExtractedId(id || '');
  };

  const verifySheet = async (spreadsheetId) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(
        `http://localhost:3001/api/config/verify?spreadsheetId=${spreadsheetId}`
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la vérification');
      }
      
      setSheetInfo(data);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!extractedId) {
      setError('Veuillez entrer une URL ou un ID de Google Sheet valide');
      return;
    }
    
    await verifySheet(extractedId);
  };

  const handleSave = async () => {
    if (!extractedId) {
      setError('Veuillez entrer une URL ou un ID de Google Sheet valide');
      return;
    }

    // Vérifier d'abord si le sheet est accessible
    const isValid = await verifySheet(extractedId);
    
    if (!isValid) {
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:3001/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spreadsheetId: extractedId })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la sauvegarde');
      }
      
      setSuccess('✅ Configuration sauvegardée avec succès !');
      
      // Notifier le parent si une fonction de callback est fournie
      if (onConfigSaved) {
        onConfigSaved(extractedId);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="config-container">
      <div className="config-header">
        <h1>⚙️ Configuration</h1>
        <p className="config-subtitle">Configurez votre Google Sheet pour centraliser vos emails Leboncoin</p>
      </div>

      <div className="config-card">
        <div className="config-section">
          <h2>📊 Google Sheet</h2>
          <p className="help-text">
            Entrez l'URL ou l'ID de votre Google Sheet contenant les comptes emails
          </p>

          <div className="input-group">
            <label htmlFor="sheet-input">URL ou ID du Google Sheet :</label>
            <input
              id="sheet-input"
              type="text"
              value={sheetInput}
              onChange={handleInputChange}
              placeholder="https://docs.google.com/spreadsheets/d/1ABC..."
              className="sheet-input"
            />
            
            {extractedId && (
              <div className="extracted-id">
                <span className="label">ID extrait :</span>
                <code>{extractedId}</code>
              </div>
            )}
          </div>

          <div className="button-group">
            <button 
              onClick={handleVerify}
              disabled={!extractedId || loading}
              className="btn btn-secondary"
            >
              {loading ? '🔄 Vérification...' : '🔍 Vérifier'}
            </button>
            
            <button 
              onClick={handleSave}
              disabled={!extractedId || loading}
              className="btn btn-primary"
            >
              {loading ? '💾 Sauvegarde...' : '💾 Sauvegarder'}
            </button>
          </div>

          {error && (
            <div className="message error-message">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="message success-message">
              {success}
            </div>
          )}

          {sheetInfo && (
            <div className="sheet-info">
              <h3>✅ Google Sheet trouvé !</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">📋 Nom :</span>
                  <span className="info-value">{sheetInfo.title}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">👥 Comptes configurés :</span>
                  <span className="info-value">{sheetInfo.accountsCount}</span>
                </div>
              </div>
              
              {sheetInfo.accounts && sheetInfo.accounts.length > 0 && (
                <div className="accounts-preview">
                  <h4>Comptes détectés :</h4>
                  <ul>
                    {sheetInfo.accounts.map((account, index) => (
                      <li key={index}>
                        ✉️ {account.imapEmail}
                        {account.lbcPassword ? ' 🔑' : ' ⚠️ (mot de passe manquant)'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Config;
