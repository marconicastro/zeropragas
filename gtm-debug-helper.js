// GTM Debug Helper - Verificar conexão Web→Server
(function() {
  'use strict';
  
  // Função para debugar eventos GTM
  window.gtmDebugHelper = {
    
    // Verificar se GTM está carregado
    checkGTM: function() {
      if (typeof google_tag_manager === 'undefined') {
        console.error('❌ GTM não está carregado');
        return false;
      }
      
      console.log('✅ GTM carregado:', Object.keys(google_tag_manager));
      return true;
    },
    
    // Enviar evento de teste
    sendTestEvent: function(eventName, data) {
      if (!this.checkGTM()) return;
      
      const eventData = {
        event: eventName || 'test_event',
        timestamp: new Date().toISOString(),
        ...data
      };
      
      console.log('📤 Enviando evento:', eventData);
      
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(eventData);
      
      // Verificar se o evento foi processado
      setTimeout(() => {
        console.log('📊 DataLayer atual:', window.dataLayer);
      }, 1000);
    },
    
    // Verificar configuração do server container
    checkServerConfig: function() {
      // Verificar se há configuração de server
      const serverConfig = {
        endpoint: 'https://collect.maracujazeropragas.com', // Exemplo
        containerId: 'GTM-PVHVLNR9'
      };
      
      console.log('🔧 Configuração Server:', serverConfig);
      return serverConfig;
    },
    
    // Testar fluxo completo
    testFullFlow: function() {
      console.log('🧪 Iniciando teste completo...');
      
      // 1. Verificar GTM
      this.checkGTM();
      
      // 2. Verificar config server
      this.checkServerConfig();
      
      // 3. Enviar evento de teste
      this.sendTestEvent('debug_test', {
        test_id: 'debug_' + Date.now(),
        source: 'debug_helper'
      });
      
      // 4. Enviar page_view
      this.sendTestEvent('page_view', {
        page_location: window.location.href,
        page_title: document.title
      });
    }
  };
  
  // Auto-executar teste
  console.log('🚀 GTM Debug Helper carregado');
  console.log('Use: gtmDebugHelper.testFullFlow()');
  
})();