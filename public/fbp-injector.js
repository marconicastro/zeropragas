// 🚀 Injetor FBP/FBC Tracker para Maracujá Zero Pragas
// Adiciona automaticamente o tracker ao site

(function() {
  console.log('🍪 Iniciando injeção do FBP/FBC Tracker...');
  
  // Verificar se já foi carregado
  if (window.FBPTracker) {
    console.log('✅ FBP Tracker já está ativo');
    return;
  }
  
  // Criar script element
  const script = document.createElement('script');
  script.src = '/fbp-tracker.js';
  script.async = true;
  script.onload = function() {
    console.log('✅ FBP/FBC Tracker carregado com sucesso');
    
    // Forçar captura inicial
    setTimeout(() => {
      if (window.FBPTracker) {
        window.FBPTracker.captureCookies();
        window.FBPTracker.generateFBP();
        window.FBPTracker.sendToCakto();
      }
    }, 1000);
  };
  
  script.onerror = function() {
    console.error('❌ Falha ao carregar FBP/FBC Tracker');
  };
  
  // Inserir no head
  document.head.appendChild(script);
  
  // Backup: criar tracker manual se falhar
  setTimeout(() => {
    if (!window.FBPTracker) {
      console.log('🔄 Criando tracker manual backup...');
      createManualTracker();
    }
  }, 2000);
})();

function createManualTracker() {
  // Capturar cookies existentes
  const cookies = document.cookie.split(';');
  let fbp = null, fbc = null;
  
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === '_fbp') fbp = value;
    if (name === '_fbc') fbc = value;
  }
  
  // Gerar FBP se não existir
  if (!fbp) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    fbp = `fb.1.${timestamp}.${random}`;
    document.cookie = `_fbp=${fbp}; expires=${new Date(Date.now() + 365*24*60*60*1000).toUTCString()}; path=/; domain=${window.location.hostname}`;
  }
  
  const browserData = {
    fbp,
    fbc,
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
    url: window.location.href,
    referrer: document.referrer
  };
  
  console.log('📤 Enviando dados manualmente:', browserData);
  
  // Enviar para API
  fetch('/api/cakto-prepare-browser-data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(browserData)
  }).then(response => {
    if (response.ok) {
      console.log('✅ Dados enviados manualmente com sucesso');
    } else {
      console.log('⚠️ Falha no envio manual');
    }
  }).catch(error => {
    console.log('❌ Erro no envio manual:', error);
  });
}