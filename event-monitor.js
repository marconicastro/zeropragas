// Monitor de Eventos GTM - Identificar problemas
(function() {
  'use strict';
  
  const EventMonitor = {
    
    // Monitorar dataLayer changes
    monitorDataLayer: function() {
      const originalPush = window.dataLayer.push;
      
      window.dataLayer.push = function(data) {
        console.log('📝 DataLayer Push:', data);
        
        // Verificar eventos específicos
        if (data.event) {
          console.log(`🎯 Evento: ${data.event}`);
          
          // Verificar se tem os dados necessários
          switch(data.event) {
            case 'page_view':
              this.validatePageView(data);
              break;
            case 'generate_lead':
              this.validateLead(data);
              break;
            case 'purchase':
              this.validatePurchase(data);
              break;
          }
        }
        
        return originalPush.apply(this, arguments);
      }.bind(this);
    },
    
    // Validar page_view
    validatePageView: function(data) {
      const required = ['page_location', 'page_title'];
      const missing = required.filter(field => !data[field]);
      
      if (missing.length > 0) {
        console.warn(`⚠️ page_view campos faltando: ${missing.join(', ')}`);
      } else {
        console.log('✅ page_view válido');
      }
    },
    
    // Validar lead
    validateLead: function(data) {
      const required = ['user_data'];
      const missing = required.filter(field => !data[field]);
      
      if (missing.length > 0) {
        console.warn(`⚠️ generate_lead campos faltando: ${missing.join(', ')}`);
      } else {
        console.log('✅ generate_lead válido');
        
        // Verificar hash dos dados
        if (data.user_data.email_hash || data.user_data.sha256_email_address) {
          console.log('✅ Dados hash presentes');
        } else {
          console.warn('⚠️ Dados não estão hashados');
        }
      }
    },
    
    // Validar purchase
    validatePurchase: function(data) {
      const required = ['transaction_id', 'value', 'currency'];
      const missing = required.filter(field => !data[field]);
      
      if (missing.length > 0) {
        console.warn(`⚠️ purchase campos faltando: ${missing.join(', ')}`);
      } else {
        console.log('✅ purchase válido');
      }
    },
    
    // Verificar se eventos estão chegando no server
    checkServerReception: function() {
      // Simular verificação (precisa ser implementado no backend)
      console.log('🔍 Verificando recepção no server...');
      
      // Adicionar listener para respostas do server
      window.addEventListener('message', function(event) {
        if (event.data.type === 'gtm_response') {
          console.log('📬 Resposta Server GTM:', event.data);
        }
      });
    },
    
    // Iniciar monitoramento
    start: function() {
      console.log('🚀 Iniciando monitoramento de eventos...');
      
      // Iniciar monitoramento do dataLayer
      this.monitorDataLayer();
      
      // Verificar recepção no server
      this.checkServerReception();
      
      // Enviar evento de teste inicial
      setTimeout(() => {
        window.dataLayer.push({
          event: 'monitor_start',
          timestamp: new Date().toISOString()
        });
      }, 1000);
    }
  };
  
  // Iniciar automaticamente
  EventMonitor.start();
  
  // Expor para uso manual
  window.EventMonitor = EventMonitor;
  
})();