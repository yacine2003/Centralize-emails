const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const serviceAccount = require('../../service_account.json');

class GoogleSheetsService {
  constructor() {
    this.doc = null;
  }

  async init(spreadsheetId) {
    // Créer une instance JWT pour l'authentification
    const serviceAccountAuth = new JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.doc = new GoogleSpreadsheet(spreadsheetId, serviceAccountAuth);
    await this.doc.loadInfo();
    console.log(`✅ Connecté au Google Sheet: ${this.doc.title}`);
  }

  async getEmailAccounts() {
    if (!this.doc) {
      throw new Error('Document non initialisé. Appelez init() d\'abord.');
    }

    // Accéder à la feuille "COMPTES" par son titre
    const sheet = this.doc.sheetsByTitle['COMPTES'];
    
    if (!sheet) {
      throw new Error('La feuille "COMPTES" n\'a pas été trouvée dans le Google Sheet');
    }

    await sheet.loadHeaderRow();
    const rows = await sheet.getRows();

    console.log(`📊 ${rows.length} compte(s) trouvé(s) dans la feuille "COMPTES"`);

    return rows.map(row => ({
      id: row.get('ID'),
      imapEmail: row.get('IMAP_Email'),
      imapPassword: row.get('IMAP_Password'),
      lbcPassword: row.get('LBC_Password')
    })).filter(account => account.imapEmail && account.imapPassword); // Filtrer les lignes vides ou incomplètes
  }
}

module.exports = new GoogleSheetsService();
