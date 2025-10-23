/**
 * SISTEMA DE VALIDAÇÃO NÃO INVASIVO
 * Apenas MONITORA eventos existentes sem alterar nada
 */

import { isHashedData } from './secure-hash-system.js';

/**
 * Classe para monitoramento passivo de eventos
 * Não interfere nos eventos existentes
 */
class EventMonitor {
  constructor() {
    this.monitoredEvents = [];
    this.complianceScores = {};
    this.isActive = false;
    this.originalFbq = null;
  }

  /**
   * Ativa monitoramento sem alterar comportamento
   */
  startMonitoring() {
    if (this.isActive || typeof window === 'undefined' || !window.fbq) {
      console.warn('Monitoramento já ativo ou fbq não disponível');
      return;
    }

    console.log('🔍 Iniciando monitoramento NÃO INVASIVO de eventos...');
    
    // Guarda função original
    this.originalFbq = window.fbq;
    
    // Intercepta APENAS para monitorar
    window.fbq = (...args) => {
      // Monitora o evento
      this.monitorEvent(args);
      
      // Executa função original SEM ALTERAÇÕES
      return this.originalFbq.apply(window, args);
    };
    
    this.isActive = true;
    console.log('✅ Monitoramento ativo (não invasivo)');
  }

  /**
   * Para monitoramento e restaura função original
   */
  stopMonitoring() {
    if (!this.isActive) return;
    
    if (this.originalFbq) {
      window.fbq = this.originalFbq;
    }
    
    this.isActive = false;
    console.log('⏹️ Monitoramento parado');
  }

  /**
   * Monitora evento sem interferir
   */
  monitorEvent(args) {
    try {
      const [command, eventName, parameters = {}] = args;
      
      if (command === 'track' || command === 'trackCustom') {
        const eventData = {
          eventName,
          parameters,
          timestamp: Date.now(),
          command
        };
        
        // Análise de conformidade
        const compliance = this.analyzeCompliance(eventData);
        
        // Salva para relatório
        this.monitoredEvents.push({
          ...eventData,
          compliance
        });
        
        // Atualiza score
        this.updateComplianceScore(eventName, compliance);
        
        // Log apenas em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
          this.logEventAnalysis(eventData, compliance);
        }
        
        // Mantém apenas últimos 100 eventos
        if (this.monitoredEvents.length > 100) {
          this.monitoredEvents.shift();
        }
      }
    } catch (error) {
      console.warn('Erro no monitoramento:', error);
    }
  }

  /**
   * Analisa conformidade do evento
   */
  analyzeCompliance(eventData) {
    const { eventName, parameters } = eventData;
    const issues = [];
    const warnings = [];
    let score = 100;

    // 1. Verifica hash de dados do usuário
    if (parameters.user_data) {
      Object.entries(parameters.user_data).forEach(([key, value]) => {
        if (['em', 'ph', 'fn', 'ln', 'ct', 'st', 'zp', 'country'].includes(key)) {
          if (value && !isHashedData(value)) {
            issues.push(`${key} não está hasheado`);
            score -= 10;
          }
        }
      });
    } else {
      warnings.push('user_data ausente');
      score -= 5;
    }

    // 2. Verifica valor zero
    if (parameters.value === 0 || parameters.value === '0') {
      issues.push('Valor zero detectado');
      score -= 25;
    }

    // 3. Verifica parâmetros essenciais
    const requiredParams = ['currency'];
    requiredParams.forEach(param => {
      if (!parameters[param]) {
        warnings.push(`${param} ausente`);
        score -= 5;
      }
    });

    // 4. Verifica conteúdo
    if (!parameters.content_name) {
      warnings.push('content_name ausente');
      score -= 3;
    }

    // 5. Verifica LTV para Lead
    if (eventName === 'Lead' && !parameters.predicted_ltv) {
      warnings.push('predicted_ltv ausente (afeta qualidade)');
      score -= 10;
    }

    return {
      score: Math.max(0, score),
      issues,
      warnings,
      grade: this.getGrade(score)
    };
  }

  /**
   * Converte score numérico em grade
   */
  getGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Atualiza score de conformidade por evento
   */
  updateComplianceScore(eventName, compliance) {
    if (!this.complianceScores[eventName]) {
      this.complianceScores[eventName] = {
        totalScore: 0,
        count: 0,
        issues: [],
        warnings: []
      };
    }

    this.complianceScores[eventName].totalScore += compliance.score;
    this.complianceScores[eventName].count++;
    this.complianceScores[eventName].issues.push(...compliance.issues);
    this.complianceScores[eventName].warnings.push(...compliance.warnings);
  }

  /**
   * Log detalhado para desenvolvimento
   */
  logEventAnalysis(eventData, compliance) {
    const { eventName, parameters } = eventData;
    
    if (compliance.issues.length > 0) {
      console.group(`🚨 EVENTO COM PROBLEMAS: ${eventName}`);
      console.error('Issues:', compliance.issues);
      console.warn('Warnings:', compliance.warnings);
      console.log('Score:', compliance.score, `(${compliance.grade})`);
      console.log('Parâmetros:', parameters);
      console.groupEnd();
    } else if (compliance.warnings.length > 0) {
      console.group(`⚠️ EVENTO COM ALERTAS: ${eventName}`);
      console.warn('Warnings:', compliance.warnings);
      console.log('Score:', compliance.score, `(${compliance.grade})`);
      console.groupEnd();
    } else {
      console.log(`✅ EVENTO CONFORME: ${eventName} (${compliance.score}/100 - ${compliance.grade})`);
    }
  }

  /**
   * Gera relatório completo
   */
  generateReport() {
    const report = {
      summary: {
        totalEvents: this.monitoredEvents.length,
        activeMonitoring: this.isActive,
        generatedAt: new Date().toISOString()
      },
      byEvent: {},
      overallIssues: [],
      overallWarnings: []
    };

    // Agrupa por evento
    Object.entries(this.complianceScores).forEach(([eventName, data]) => {
      const avgScore = Math.round(data.totalScore / data.count);
      
      report.byEvent[eventName] = {
        count: data.count,
        averageScore: avgScore,
        grade: this.getGrade(avgScore),
        uniqueIssues: [...new Set(data.issues)],
        uniqueWarnings: [...new Set(data.warnings)]
      };

      report.overallIssues.push(...data.issues);
      report.overallWarnings.push(...data.warnings);
    });

    // Remove duplicatas
    report.overallIssues = [...new Set(report.overallIssues)];
    report.overallWarnings = [...new Set(report.overallWarnings)];

    return report;
  }

  /**
   * Exibe relatório no console
   */
  showReport() {
    const report = this.generateReport();
    
    console.group('📊 RELATÓRIO DE CONFORMIDADE (NÃO INVASIVO)');
    
    console.log('\n📈 RESUMO:');
    console.log(`Total de eventos monitorados: ${report.summary.totalEvents}`);
    console.log(`Monitoramento ativo: ${report.summary.activeMonitoring ? 'Sim' : 'Não'}`);
    
    console.log('\n🎯 POR EVENTO:');
    Object.entries(report.byEvent).forEach(([eventName, data]) => {
      console.log(`\n${eventName}:`);
      console.log(`  - Quantidade: ${data.count}`);
      console.log(`  - Score médio: ${data.averageScore}/100 (${data.grade})`);
      if (data.uniqueIssues.length > 0) {
        console.log(`  - Issues: ${data.uniqueIssues.join(', ')}`);
      }
      if (data.uniqueWarnings.length > 0) {
        console.log(`  - Warnings: ${data.uniqueWarnings.join(', ')}`);
      }
    });
    
    if (report.overallIssues.length > 0) {
      console.log('\n🚨 ISSUES GERAIS:');
      report.overallIssues.forEach(issue => console.log(`  - ${issue}`));
    }
    
    if (report.overallWarnings.length > 0) {
      console.log('\n⚠️ WARNINGS GERAIS:');
      report.overallWarnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    console.groupEnd();
    
    return report;
  }

  /**
   * Limpa dados de monitoramento
   */
  clearData() {
    this.monitoredEvents = [];
    this.complianceScores = {};
    console.log('🗑️ Dados de monitoramento limpos');
  }
}

// Instância global do monitor
const eventMonitor = new EventMonitor();

/**
 * Funções de controle do monitoramento
 */
export function startEventMonitoring() {
  eventMonitor.startMonitoring();
}

export function stopEventMonitoring() {
  eventMonitor.stopMonitoring();
}

export function showComplianceReport() {
  return eventMonitor.showReport();
}

export function clearMonitoringData() {
  eventMonitor.clearData();
}

export function getMonitoringStatus() {
  return {
    active: eventMonitor.isActive,
    eventsCount: eventMonitor.monitoredEvents.length,
    summary: eventMonitor.generateReport().summary
  };
}

/**
 * Função de teste completo
 */
export async function testMonitoringSystem() {
  console.group('🧪 Teste do Sistema de Monitoramento');
  
  // 1. Verifica status
  console.log('\n1️⃣ Status atual:');
  console.log(getMonitoringStatus());
  
  // 2. Inicia monitoramento
  console.log('\n2️⃣ Iniciando monitoramento...');
  startEventMonitoring();
  
  // 3. Simula alguns eventos (apenas para teste)
  console.log('\n3️⃣ Simulando eventos para teste...');
  
  if (window.fbq) {
    // Evento com problemas
    window.fbq('track', 'Lead', {
      value: 0,
      user_data: {
        em: 'test@example.com',  // Não hasheado
        ph: '11987654321'        // Não hasheado
      }
    });
    
    // Evento conforme
    window.fbq('track', 'ViewContent', {
      value: 39.9,
      currency: 'BRL',
      content_name: 'Produto Teste'
    });
  }
  
  // 4. Aguarda um pouco e mostra relatório
  setTimeout(() => {
    console.log('\n4️⃣ Relatório gerado:');
    showComplianceReport();
    
    console.log('\n5️⃣ Parando monitoramento...');
    stopEventMonitoring();
    
    console.groupEnd();
  }, 1000);
}

// Exportar para uso global em desenvolvimento
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.startEventMonitoring = startEventMonitoring;
  window.stopEventMonitoring = stopEventMonitoring;
  window.showComplianceReport = showComplianceReport;
  window.clearMonitoringData = clearMonitoringData;
  window.getMonitoringStatus = getMonitoringStatus;
  window.testMonitoringSystem = testMonitoringSystem;
  window.eventMonitor = eventMonitor; // Acesso direto para debug avançado
}