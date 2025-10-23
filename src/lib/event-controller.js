/**
 * SISTEMA DE CONTROLE CENTRALIZADO DE EVENTOS
 * Garante regras estritas: ViewContent (1x) e Scroll (50%, 75%, 90%)
 */

class EventController {
  constructor() {
    // Estados globais
    this.events = {
      ViewContent: {
        fired: false,
        timestamp: null,
        trigger: null
      },
      ScrollDepth: {
        fired: [false, false, false], // [50%, 75%, 90%]
        timestamps: [null, null, null],
        thresholds: [50, 75, 90]
      }
    };
    
    // Listeners ativos
    this.activeListeners = {
      scroll: false,
      timer: null
    };
    
    // Debug mode
    this.debug = process.env.NODE_ENV === 'development';
  }

  /**
   * Inicia o controle de eventos para a página atual
   */
  initialize() {
    if (this.initialized) {
      if (this.debug) {
        console.log('⚠️ EventController já inicializado');
      }
      return;
    }

    if (this.debug) {
      console.log('🎯 Inicializando EventController - Controle Centralizado');
    }
    
    // Resetar estados ao inicializar
    this.reset();
    
    // Configurar ViewContent (único disparo)
    this.setupViewContent();
    
    // Configurar ScrollDepth (exatamente 3 disparos)
    this.setupScrollDepth();
    
    this.initialized = true;
    
    if (this.debug) {
      console.log('✅ EventController inicializado com sucesso');
      console.log('📋 Regras ativas:');
      console.log('   - ViewContent: APENAS 1 disparo (timer 15s OU scroll 25%)');
      console.log('   - ScrollDepth: EXATAMENTE 3 disparos (50%, 75%, 90%)');
    }
  }

  /**
   * Reseta todos os estados
   */
  reset() {
    this.events.ViewContent = {
      fired: false,
      timestamp: null,
      trigger: null
    };
    
    this.events.ScrollDepth = {
      fired: [false, false, false],
      timestamps: [null, null, null],
      thresholds: [50, 75, 90]
    };
    
    // Limpar listeners existentes
    this.clearAllListeners();
    
    if (this.debug) {
      console.log('🔄 EventController resetado');
    }
  }

  /**
   * Configura ViewContent com REGRAS ESTRITAS
   */
  setupViewContent() {
    // REGRA: ViewContent só pode disparar UMA VEZ por página
    // Prioridade: Timer (15s) > Scroll (25%)
    
    // Verificar se está no browser antes de configurar
    if (typeof window === 'undefined') {
      return;
    }
    
    let viewContentTimer = null;
    let scrollListenerAdded = false;

    // Função centralizada para disparar ViewContent
    const fireViewContent = (triggerType, triggerData) => {
      // VERIFICAÇÃO ESTRITA: Já foi disparado?
      if (this.events.ViewContent.fired) {
        if (this.debug) {
          console.warn(`⚠️ ViewContent já foi disparado por ${this.events.ViewContent.trigger}. Ignorando ${triggerType}`);
        }
        return false;
      }

      // DISPARO ÚNICO
      if (typeof window !== 'undefined' && window.trackMetaEvent) {
        window.trackMetaEvent('ViewContent', {
          content_name: 'Sistema 4 Fases - Ebook Trips',
          content_ids: ['I101398692S'],
          value: 39.90,
          currency: 'BRL',
          content_type: 'product',
          custom_data: {
            trigger_type: triggerType,
            ...triggerData
          }
        });
        
        // Marcar como disparado
        this.events.ViewContent.fired = true;
        this.events.ViewContent.timestamp = Date.now();
        this.events.ViewContent.trigger = triggerType;
        
        if (this.debug) {
          console.log(`✅ ViewContent disparado por ${triggerType} (ÚNICO DISPARO)`);
        }
        
        // Limpar tudo após disparar
        this.clearViewContentListeners(viewContentTimer, scrollListenerAdded);
        
        return true;
      }
      
      return false;
    };

    // Timer de 15 segundos (prioridade alta)
    viewContentTimer = setTimeout(() => {
      fireViewContent('timing', { time_on_page: 15 });
    }, 15000);

    // Scroll de 25% (prioridade baixa - só dispara se timer não disparou)
    const handleScrollForViewContent = () => {
      if (this.events.ViewContent.fired) return; // Já foi disparado
      
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPosition = window.scrollY;
      const scrollPercentage = Math.round((scrollPosition / scrollHeight) * 100);

      if (scrollPercentage >= 25) {
        fireViewContent('scroll', { scroll_depth: 25 });
      }
    };

    // Adicionar listener de scroll APENAS se estiver no browser
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScrollForViewContent, { passive: true });
      scrollListenerAdded = true;
    }
    
    // Guardar referências para limpeza
    this.activeListeners.timer = viewContentTimer;
    this.activeListeners.scroll = true;
  }

  /**
   * Configura ScrollDepth com EXATAMENTE 3 disparos
   */
  setupScrollDepth() {
    // REGRA: ScrollDepth dispara APENAS em 50%, 75%, 90%
    
    // Verificar se está no browser antes de configurar
    if (typeof window === 'undefined') {
      return;
    }
    
    const handleScrollDepth = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPosition = window.scrollY;
      const scrollPercentage = Math.round((scrollPosition / scrollHeight) * 100);

      // Verificar cada threshold
      this.events.ScrollDepth.thresholds.forEach((threshold, index) => {
        if (
          scrollPercentage >= threshold && 
          !this.events.ScrollDepth.fired[index]
        ) {
          this.fireScrollDepth(threshold, index);
        }
      });
    };

    // Adicionar listener único para scroll
    window.addEventListener('scroll', handleScrollDepth, { passive: true });
    this.activeListeners.scrollDepth = true;
    
    if (this.debug) {
      console.log('📜 ScrollDepth configurado: 50%, 75%, 90%');
    }
  }

  /**
   * Dispara ScrollDepth específico
   */
  fireScrollDepth(threshold, index) {
    if (this.events.ScrollDepth.fired[index]) {
      return false; // Já foi disparado
    }

    if (typeof window !== 'undefined' && window.trackMetaEvent) {
      window.trackMetaEvent('ScrollDepth', { 
        percent: threshold,
        scroll_direction: 'down',
        page_height: document.documentElement.scrollHeight,
        viewport_height: window.innerHeight,
        time_to_scroll: Math.floor((Date.now() - performance.timing.navigationStart) / 1000)
      });
      
      // Marcar como disparado
      this.events.ScrollDepth.fired[index] = true;
      this.events.ScrollDepth.timestamps[index] = Date.now();
      
      if (this.debug) {
        console.log(`📜 ScrollDepth ${threshold}% disparado (${index + 1}/3)`);
      }
      
      return true;
    }
    
    return false;
  }

  /**
   * Limpa listeners do ViewContent
   */
  clearViewContentListeners(timer, scrollListenerAdded) {
    if (timer) {
      clearTimeout(timer);
      this.activeListeners.timer = null;
    }
    
    if (scrollListenerAdded) {
      // Remover listener específico do ViewContent
      window.removeEventListener('scroll', this.handleScrollForViewContent);
      this.activeListeners.scroll = false;
    }
  }

  /**
   * Limpa todos os listeners
   */
  clearAllListeners() {
    if (this.activeListeners.timer) {
      clearTimeout(this.activeListeners.timer);
      this.activeListeners.timer = null;
    }
    
    // Não removemos scroll listeners genéricos para não afetar outros componentes
    // A verificação lógica impede múltiplos disparos
  }

  /**
   * Verifica status atual dos eventos
   */
  getStatus() {
    return {
      viewContent: {
        fired: this.events.ViewContent.fired,
        trigger: this.events.ViewContent.trigger,
        timestamp: this.events.ViewContent.timestamp
      },
      scrollDepth: {
        fired: this.events.ScrollDepth.fired,
        thresholds: this.events.ScrollDepth.thresholds,
        timestamps: this.events.ScrollDepth.timestamps,
        totalFired: this.events.ScrollDepth.fired.filter(f => f).length
      },
      activeListeners: this.activeListeners
    };
  }

  /**
   * Força disparo manual (para testes)
   */
  forceFireViewContent(triggerType = 'manual', triggerData = {}) {
    if (this.debug) {
      console.log(`🔧 Forçando ViewContent manual: ${triggerType}`);
    }
    
    // Resetar para permitir disparo manual
    const originalState = { ...this.events.ViewContent };
    this.events.ViewContent.fired = false;
    
    const result = this.setupViewContent();
    
    // Disparar imediatamente
    setTimeout(() => {
      if (typeof window !== 'undefined' && window.trackMetaEvent) {
        window.trackMetaEvent('ViewContent', {
          content_name: 'Sistema 4 Fases - Ebook Trips',
          content_ids: ['I101398692S'],
          value: 39.90,
          currency: 'BRL',
          content_type: 'product',
          custom_data: {
            trigger_type: triggerType,
            ...triggerData
          }
        });
        
        this.events.ViewContent.fired = true;
        this.events.ViewContent.timestamp = Date.now();
        this.events.ViewContent.trigger = triggerType;
      }
    }, 100);
    
    return result;
  }

  /**
   * Força disparo manual de ScrollDepth (para testes)
   */
  forceFireScrollDepth(threshold) {
    const index = this.events.ScrollDepth.thresholds.indexOf(threshold);
    if (index === -1) {
      console.warn(`Threshold ${threshold}% não é válido. Use: 50, 75, 90`);
      return false;
    }
    
    if (this.debug) {
      console.log(`🔧 Forçando ScrollDepth manual: ${threshold}%`);
    }
    
    return this.fireScrollDepth(threshold, index);
  }
}

// Instância global do controlador
const eventController = new EventController();

/**
 * Funções de controle para uso global
 */
export function initializeEventController() {
  eventController.initialize();
}

export function getEventStatus() {
  return eventController.getStatus();
}

export function forceViewContent(triggerType, triggerData = {}) {
  return eventController.forceFireViewContent(triggerType, triggerData);
}

export function forceScrollDepth(threshold) {
  return eventController.forceScrollDepth(threshold);
}

export function resetEventController() {
  eventController.reset();
}

// Exportar para uso global em desenvolvimento
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.eventController = eventController;
  window.initializeEventController = initializeEventController;
  window.getEventStatus = getEventStatus;
  window.forceViewContent = forceViewContent;
  window.forceScrollDepth = forceScrollDepth;
  window.resetEventController = resetEventController;
  
  // Função de debug
  window.debugEventController = () => {
    console.group('🎯 EventController Debug');
    console.log('Status atual:', getEventStatus());
    console.log('Regras ativas:');
    console.log('  - ViewContent: Apenas 1 disparo por página');
    console.log('  - ScrollDepth: Exatamente 3 disparos (50%, 75%, 90%)');
    console.groupEnd();
  };
}