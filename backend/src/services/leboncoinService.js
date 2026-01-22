const puppeteer = require('puppeteer');

class LeboncoinService {
  constructor() {
    this.browser = null;
  }

  async initBrowser() {
    if (!this.browser) {
      console.log('🌐 Démarrage du navigateur...');
      this.browser = await puppeteer.launch({
        headless: false, // Afficher le navigateur pour voir ce qui se passe
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-blink-features=AutomationControlled'
        ],
        defaultViewport: {
          width: 1280,
          height: 800
        }
      });
      console.log('✅ Navigateur démarré');
    }
    return this.browser;
  }

  async loginToLeboncoin(email, password, accountId = null) {
    const browser = await this.initBrowser();
    const page = await browser.newPage();
    
    try {
      console.log(`🔐 Connexion à Leboncoin pour ${email}...`);
      
      await page.goto('https://www.leboncoin.fr/connexion', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Attendre et remplir le formulaire
      await page.waitForSelector('input[type="email"], input[name="email"]', { 
        timeout: 10000 
      });
      
      console.log('📝 Remplissage du formulaire...');
      
      // Sélecteurs possibles pour les champs
      const emailSelector = 'input[type="email"]';
      const passwordSelector = 'input[type="password"]';
      
      await page.type(emailSelector, email, { delay: 100 });
      await page.type(passwordSelector, password, { delay: 100 });
      
      // Cliquer sur le bouton de connexion
      await page.click('button[type="submit"]');
      
      console.log('⏳ En attente de la connexion...');
      
      // Attendre la redirection
      await page.waitForNavigation({ 
        waitUntil: 'networkidle2', 
        timeout: 30000 
      });

      console.log('✅ Connexion réussie');

      // Si un accountId est fourni, naviguer vers ce compte
      if (accountId) {
        console.log(`🔗 Navigation vers le compte ${accountId}...`);
        const accountUrl = `https://www.leboncoin.fr/compte/${accountId}`;
        await page.goto(accountUrl, { waitUntil: 'networkidle2' });
      }

      return { success: true, url: page.url() };
    } catch (error) {
      console.error('❌ Erreur lors de la connexion:', error.message);
      throw error;
    }
  }

  async openEmailLink(url, email, password, accountId = null) {
    try {
      console.log(`🔗 Ouverture du lien: ${url}`);
      
      // D'abord se connecter à Leboncoin
      const loginResult = await this.loginToLeboncoin(email, password, accountId);
      
      const browser = await this.initBrowser();
      const pages = await browser.pages();
      const page = pages[pages.length - 1]; // Utiliser la dernière page ouverte
      
      // Ensuite ouvrir le lien de l'email
      await page.goto(url, { 
        waitUntil: 'networkidle2', 
        timeout: 30000 
      });
      
      console.log('✅ Lien ouvert avec succès');
      
      return { success: true, url: page.url() };
    } catch (error) {
      console.error('❌ Erreur lors de l\'ouverture du lien:', error.message);
      throw error;
    }
  }

  async closeBrowser() {
    if (this.browser) {
      console.log('🔌 Fermeture du navigateur...');
      await this.browser.close();
      this.browser = null;
      console.log('✅ Navigateur fermé');
    }
  }
}

module.exports = new LeboncoinService();
