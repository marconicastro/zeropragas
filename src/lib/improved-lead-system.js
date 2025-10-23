/**
 * SISTEMA DE LEAD MELHORADO - Não interfere no código existente
 * Função PARALELA para teste e implementação gradual
 */

import { prepareHashedUserData, ensureHashed } from './secure-hash-system.js';

/**
 * Função MELHORADA de Lead - Uso OPCIONAL
 * NÃO substitui a função existente, apenas oferece alternativa
 * 
 * @param {Object} customParams - Parâmetros personalizados
 * @param {Object} options - Opções de configuração
 * @returns {Promise<Object>} - Parâmetros enviados
 */
export async function fireImprovedLead(customParams = {}, options = {}) {
  try {
    console.log('🚀 Iniciando Lead MELHORADO (paralelo ao existente)...');
    
    // 1. Obter dados do usuário (mesma lógica existente)
    const userData = await getUserDataForLead();
    
    // 2. Aplicar hash SEGURO nos dados PII
    const hashedUserData = await prepareHashedUserData(userData);
    
    // 3. Calcular valor realista (NÃO ZERO!)
    const leadValue = calculateRealisticLeadValue(customParams);
    const predictedLTV = calculatePredictedLTV(leadValue, customParams);
    
    // 4. Parâmetros MELHORADOS (como InitiateCheckout)
    const improvedLeadParams = {
      // ✅ Dados hasheados (conforme Facebook)
      ...hashedUserData,
      
      // ✅ Valor realista (NÃO ZERO!)
      value: leadValue,
      currency: 'BRL',
      
      // ✅ Conteúdo rico (como InitiateCheckout)
      content_type: 'lead_form',
      content_name: 'Formulário de Contato - Sistema 4 Fases',
      content_category: 'lead_generation',
      content_ids: ['lead_form_main'],
      
      // ✅ LTV previsto (aumenta muito a qualidade)
      predicted_ltv: predictedLTV,
      
      // ✅ Dados de comportamento
      lead_type: customParams.lead_type || 'contact_request',
      lead_source: getLeadSource(),
      form_position: 'main_page',
      
      // ✅ Metadados de qualidade
      time_on_page: getTimeOnPage(),
      scroll_depth: getMaxScrollDepth(),
      page_views: getSessionPageViews(),
      user_engagement: calculateEngagementScore(),
      
      // ✅ Dados de sessão
      session_id: userData.sessionId || 'sess_' + Date.now(),
      event_source: 'website',
      
      // ✅ Metadata para controle
      event_version: 'improved_v2.0',
      data_hashed: true,
      enhanced_quality: true,
      
      // Parâmetros customizados (têm prioridade)
      ...customParams
    };
    
    // 5. Disparar evento MELHORADO
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Lead', improvedLeadParams);
      
      console.log('✅ Lead MELHORADO disparado com sucesso:', {
        value: improvedLeadParams.value,
        predicted_ltv: improvedLeadParams.predicted_ltv,
        hasUserData: !!userData.email,
        dataHashed: improvedLeadParams.data_hashed,
        engagement: improvedLeadParams.user_engagement
      });
      
      // 6. Salvar analytics para comparação
      saveImprovedLeadAnalytics(improvedLeadParams);
      
      return improvedLeadParams;
    } else {
      console.warn('⚠️ Meta Pixel não disponível');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Erro no Lead MELHORADO:', error);
    return null;
  }
}

/**
 * Função de comparação - Lead ATUAL vs MELHORADO
 * Executa ambos para comparação lado a lado
 */
export async function compareLeadVersions(customParams = {}) {
  console.group('📊 COMPARAÇÃO: Lead ATUAL vs MELHORADO');
  
  try {
    // 1. Lead ATUAL (seu código existente)
    console.log('\n🔵 EXECUTANDO Lead ATUAL...');
    const currentParams = {
      value: 0,  // Seu valor atual
      currency: 'BRL',
      content_name: 'Lead - Formulário Preenchido',
      content_category: 'Formulário'
      // ... seus parâmetros atuais
    };
    
    if (window.fbq) {
      window.fbq('track', 'Lead', currentParams);
      console.log('✅ Lead ATUAL disparado:', currentParams);
    }
    
    // 2. Lead MELHORADO
    console.log('\n🟢 EXECUTANDO Lead MELHORADO...');
    const improvedParams = await fireImprovedLead(customParams);
    
    // 3. Comparação
    console.log('\n📈 COMPARAÇÃO:');
    console.log('Valor:', currentParams.value, '→', improvedParams?.value);
    console.log('Hash:', 'Não', '→', improvedParams?.data_hashed ? 'Sim' : 'Não');
    console.log('LTV:', 'Não informado', '→', improvedParams?.predicted_ltv);
    console.log('Parâmetros:', Object.keys(currentParams).length, '→', Object.keys(improvedParams || {}).length);
    
    console.groupEnd();
    
    return {
      current: currentParams,
      improved: improvedParams
    };
    
  } catch (error) {
    console.error('❌ Erro na comparação:', error);
    console.groupEnd();
  }
}

/**
 * Funções auxiliares (reutilizam lógica existente quando possível)
 */

async function getUserDataForLead() {
  // Tenta obter dados persistidos (sua lógica existente)
  try {
    const persistentData = localStorage.getItem('meta_user_data');
    if (persistentData) {
      return JSON.parse(persistentData);
    }
  } catch (error) {
    console.warn('Erro ao obter dados persistidos:', error);
  }
  
  // Dados padrão para teste
  return {
    email: 'marconicastro04@gmail.com',
    phone: '77998276042',
    fullName: 'MARCONI AUGUSTO DE CASTRO',
    city: 'sua_cidade',
    state: 'seu_estado',
    cep: 'seu_cep',
    sessionId: 'sess_' + Date.now()
  };
}

function calculateRealisticLeadValue(customParams) {
  const baseValues = {
    'newsletter': 5.00,
    'contact': 15.00,
    'demo_request': 50.00,
    'proposal': 100.00,
    'consultation': 75.00
  };
  
  const leadType = customParams.lead_type || 'contact';
  return baseValues[leadType] || 15.00;
}

function calculatePredictedLTV(leadValue, customParams) {
  const multipliers = {
    'newsletter': 8.5,
    'contact': 12.0,
    'demo_request': 25.0,
    'proposal': 35.0,
    'consultation': 20.0
  };
  
  const leadType = customParams.lead_type || 'contact';
  return leadValue * (multipliers[leadType] || 12.0);
}

function getLeadSource() {
  const utmSource = new URLSearchParams(window.location.search).get('utm_source');
  const referrer = document.referrer;
  
  if (utmSource) return `utm_${utmSource}`;
  if (referrer) return `referral_${new URL(referrer).hostname}`;
  return 'organic_direct';
}

function getTimeOnPage() {
  return Math.floor((Date.now() - performance.timing.navigationStart) / 1000);
}

function getMaxScrollDepth() {
  return Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
}

function getSessionPageViews() {
  try {
    return parseInt(sessionStorage.getItem('page_views') || '1');
  } catch {
    return 1;
  }
}

function calculateEngagementScore() {
  const timeOnPage = getTimeOnPage();
  const scrollDepth = getMaxScrollDepth();
  const pageViews = getSessionPageViews();
  
  let score = 0;
  
  if (timeOnPage > 120) score += 40;
  else if (timeOnPage > 60) score += 30;
  else if (timeOnPage > 30) score += 20;
  else if (timeOnPage > 15) score += 10;
  
  if (scrollDepth > 75) score += 30;
  else if (scrollDepth > 50) score += 20;
  else if (scrollDepth > 25) score += 10;
  
  if (pageViews > 3) score += 20;
  else if (pageViews > 1) score += 10;
  
  return Math.min(score, 100);
}

function saveImprovedLeadAnalytics(params) {
  try {
    const analytics = JSON.parse(localStorage.getItem('improved_lead_analytics') || '[]');
    
    analytics.push({
      timestamp: Date.now(),
      value: params.value,
      predicted_ltv: params.predicted_ltv,
      engagement: params.user_engagement,
      data_hashed: params.data_hashed,
      lead_type: params.lead_type
    });
    
    // Mantém apenas últimos 50 registros
    if (analytics.length > 50) {
      analytics.shift();
    }
    
    localStorage.setItem('improved_lead_analytics', JSON.stringify(analytics));
    
  } catch (error) {
    console.warn('Erro ao salvar analytics melhorado:', error);
  }
}

/**
 * Funções de teste e debug
 */
export async function testImprovedLeadSystem() {
  console.group('🧪 Teste do Sistema de Lead MELHORADO');
  
  // Teste 1: Hash
  console.log('\n1️⃣ Testando sistema de hash...');
  const { testHashSystem } = await import('./secure-hash-system.js');
  await testHashSystem();
  
  // Teste 2: Lead básico
  console.log('\n2️⃣ Testando Lead básico...');
  await fireImprovedLead({ lead_type: 'contact' });
  
  // Teste 3: Comparação
  console.log('\n3️⃣ Comparando versões...');
  await compareLeadVersions({ lead_type: 'newsletter' });
  
  // Teste 4: Analytics
  console.log('\n4️⃣ Verificando analytics...');
  const analytics = JSON.parse(localStorage.getItem('improved_lead_analytics') || '[]');
  console.log('Analytics salvos:', analytics.length, 'registros');
  
  console.groupEnd();
}

// Exportar para uso global em desenvolvimento
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.fireImprovedLead = fireImprovedLead;
  window.compareLeadVersions = compareLeadVersions;
  window.testImprovedLeadSystem = testImprovedLeadSystem;
}