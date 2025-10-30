// 🚀 FBP/FBC Tracker para Cakto Webhook
// Captura cookies do Meta Pixel e envia para Cakto

class FBPTracker {
  constructor() {
    this.pixelId = '642933108377475'; // Meta Pixel ID
    this.init();
  }

  init() {
    console.log('🍪 FBP/FBC Tracker inicializado');
    
    // Capturar cookies existentes
    this.captureCookies();
    
    // Setup listener para novos eventos
    this.setupEventListeners();
    
    // Enviar dados para Cakto quando disponível
    this.sendToCakto();
  }

  // Capturar cookies do Meta Pixel
  captureCookies() {
    const cookies = document.cookie.split(';');
    
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      
      if (name === '_fbp') {
        this.fbp = value;
        console.log('✅ FBP capturado:', this.fbp);
      }
      
      if (name === '_fbc') {
        this.fbc = value;
        console.log('✅ FBC capturado:', this.fbc);
      }
    }
  }

  // Gerar FBP se não existir
  generateFBP() {
    if (!this.fbp) {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substr(2, 9);
      this.fbp = `fb.1.${timestamp}.${random}`;
      
      // Setar cookie com expiração de 1 ano
      document.cookie = `_fbp=${this.fbp}; expires=${new Date(Date.now() + 365*24*60*60*1000).toUTCString()}; path=/; domain=${window.location.hostname}`;
      console.log('🆕 FBP gerado:', this.fbp);
    }
  }

  // Setup listeners para eventos de checkout
  setupEventListeners() {
    // Listener para checkout button
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-checkout], .checkout-btn, #checkout-button')) {
        console.log('🛒 Checkout detectado - preparando FBP/FBC');
        this.generateFBP();
        this.sendToCakto();
      }
    });

    // Listener para form submit
    document.addEventListener('submit', (e) => {
      if (e.target.matches('.checkout-form, #payment-form')) {
        console.log('📝 Form de pagamento detectado');
        this.sendToCakto();
      }
    });
  }

  // Enviar dados para Cakto via API
  async sendToCakto() {
    const browserData = {
      fbp: this.fbp || null,
      fbc: this.fbc || null,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      url: window.location.href,
      referrer: document.referrer
    };

    console.log('📤 Enviando FBP/FBC para Cakto:', browserData);

    try {
      // Armazenar no localStorage para a Cakto capturar
      localStorage.setItem('cakto_browser_data', JSON.stringify(browserData));
      
      // Enviar para endpoint de preparação
      const response = await fetch('/api/cakto-prepare-browser-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(browserData)
      });

      if (response.ok) {
        console.log('✅ Dados do navegador enviados para Cakto');
      } else {
        console.log('⚠️ Falha ao enviar dados para Cakto');
      }
    } catch (error) {
      console.log('❌ Erro ao enviar dados:', error);
    }
  }

  // Método público para obter dados atuais
  getBrowserData() {
    return {
      fbp: this.fbp || null,
      fbc: this.fbc || null,
      userAgent: navigator.userAgent,
      timestamp: Date.now()
    };
  }
}

// Inicializar tracker
window.FBPTracker = new FBPTracker();

// Disponibilizar globalmente
window.getCaktoBrowserData = () => window.FBPTracker.getBrowserData();

console.log('🚀 FBP/FBC Tracker carregado com sucesso');