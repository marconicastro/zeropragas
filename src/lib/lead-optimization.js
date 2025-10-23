/**
 * Otimização Específica para Evento Lead
 * Meta: Elevar nota de 6.9 para 9.3+
 */

import { getUserPersistentData, hashData } from './user-data-utils';

/**
 * Dispara Lead com dados completos (como InitiateCheckout)
 */
export function fireOptimizedLead(customParams = {}) {
  try {
    // 1. Busca dados completos do usuário
    const userData = getUserPersistentData();
    
    // 2. Enriquece com dados do formulário
    const formData = getFormData();
    
    // 3. Combina tudo
    const completeUserData = {
      ...userData,
      ...formData,
      // Hash todos os dados PII
      em: hashData(userData.email || formData.email),
      ph: hashData(userData.phone || formData.phone),
      fn: hashData(userData.firstName || formData.firstName),
      ln: hashData(userData.lastName || formData.lastName),
      ct: hashData(userData.city || formData.city),
      st: hashData(userData.state || formData.state),
      zp: hashData(userData.zipCode || formData.zipCode),
      country: hashData(userData.country || 'br')
    };
    
    // 4. Parâmetros otimizados para Lead
    const leadParams = {
      // Dados completos do usuário (como InitiateCheckout)
      ...completeUserData,
      
      // Contexto rico
      content_name: 'Formulário de Lead Otimizado',
      content_category: 'lead_generation',
      content_type: 'form',
      
      // Valor mais realista
      value: calculateLeadValue(formData),
      currency: 'BRL',
      
      // Previsão de LTV (aumenta qualidade)
      predicted_ltv: calculatePredictedLTV(formData),
      
      // Dados de comportamento
      lead_source: getLeadSource(),
      lead_type: formData.leadType || 'newsletter',
      form_position: getFormPosition(),
      time_on_page: getTimeOnPage(),
      scroll_depth: getMaxScrollDepth(),
      
      // Metadados de qualidade
      user_engagement: calculateEngagementScore(),
      device_info: getDeviceInfo(),
      session_quality: getSessionQuality()
    };
    
    // 5. Dispara o evento otimizado
    fbq('track', 'Lead', {
      ...leadParams,
      ...customParams
    });
    
    console.log('✅ Lead otimizado disparado (nota alvo: 9.3+):', leadParams);
    
    // 6. Salva analytics para comparação
    saveLeadAnalytics(leadParams);
    
  } catch (error) {
    console.error('❌ Erro ao disparar Lead otimizado:', error);
  }
}

/**
 * Calcula valor realista do lead baseado no contexto
 */
function calculateLeadValue(formData) {
  const baseValues = {
    'newsletter': 5.00,
    'contact': 15.00,
    'demo_request': 50.00,
    'proposal': 100.00,
    'consultation': 75.00
  };
  
  const leadType = formData.leadType || 'newsletter';
  const baseValue = baseValues[leadType] || 5.00;
  
  // Ajusta baseado na qualidade dos dados
  const dataCompleteness = calculateDataCompleteness(formData);
  const engagementBonus = calculateEngagementBonus();
  
  return baseValue * (1 + dataCompleteness + engagementBonus);
}

/**
 * Calcula LTV previsto (aumenta muito a qualidade)
 */
function calculatePredictedLTV(formData) {
  const leadType = formData.leadType || 'newsletter';
  
  const ltvMultipliers = {
    'newsletter': 8.5,      // R$42.50 LTV
    'contact': 12.0,        // R$180.00 LTV
    'demo_request': 25.0,   // R$1,250.00 LTV
    'proposal': 35.0,       // R$3,500.00 LTV
    'consultation': 20.0    // R$1,500.00 LTV
  };
  
  const baseValue = calculateLeadValue(formData);
  return baseValue * (ltvMultipliers[leadType] || 8.5);
}

/**
 * Calcula score de completude dos dados (0-1)
 */
function calculateDataCompleteness(formData) {
  const requiredFields = ['email', 'name', 'phone'];
  const optionalFields = ['company', 'jobTitle', 'city', 'state'];
  
  const requiredComplete = requiredFields.filter(field => formData[field]).length;
  const optionalComplete = optionalFields.filter(field => formData[field]).length;
  
  const requiredScore = requiredComplete / requiredFields.length * 0.7;
  const optionalScore = optionalComplete / optionalFields.length * 0.3;
  
  return requiredScore + optionalScore;
}

/**
 * Calcula bônus de engajamento
 */
function calculateEngagementBonus() {
  const timeOnPage = getTimeOnPage();
  const scrollDepth = getMaxScrollDepth();
  const pageViews = getSessionPageViews();
  
  let bonus = 0;
  
  // Bônus por tempo na página
  if (timeOnPage > 120) bonus += 0.2;      // 2+ minutos
  else if (timeOnPage > 60) bonus += 0.1;   // 1+ minuto
  
  // Bônus por scroll
  if (scrollDepth > 75) bonus += 0.2;       // 75%+ scroll
  else if (scrollDepth > 50) bonus += 0.1;  // 50%+ scroll
  
  // Bônus por páginas visitadas
  if (pageViews > 3) bonus += 0.2;          // 3+ páginas
  else if (pageViews > 1) bonus += 0.1;     // 1+ página
  
  return Math.min(bonus, 0.5); // Máximo 50% de bônus
}

/**
 * Obtém dados do formulário atual
 */
function getFormData() {
  try {
    const forms = document.querySelectorAll('form');
    const latestForm = forms[forms.length - 1];
    
    if (!latestForm) return {};
    
    const formData = new FormData(latestForm);
    const data = {};
    
    // Extrai dados do formulário
    for (let [key, value] of formData.entries()) {
      data[key] = value;
    }
    
    // Mapeia campos comuns
    return {
      email: data.email || data.email_address || data.user_email,
      phone: data.phone || data.telephone || data.user_phone,
      firstName: data.firstName || data.first_name || data.name?.split(' ')[0],
      lastName: data.lastName || data.last_name || (data.name?.split(' ').length > 1 ? data.name.split(' ').slice(1).join(' ') : ''),
      company: data.company || data.company_name,
      jobTitle: data.jobTitle || data.job_title || data.position,
      city: data.city,
      state: data.state || data.region,
      zipCode: data.zipCode || data.postal_code || data.cep,
      leadType: data.leadType || data.lead_type || data.form_type || 'newsletter'
    };
    
  } catch (error) {
    console.warn('Erro ao obter dados do formulário:', error);
    return {};
  }
}

/**
 * Obtém fonte do lead
 */
function getLeadSource() {
  const utmSource = new URLSearchParams(window.location.search).get('utm_source');
  const referrer = document.referrer;
  
  if (utmSource) return `utm_${utmSource}`;
  if (referrer) return `referral_${new URL(referrer).hostname}`;
  return 'organic_direct';
}

/**
 * Obtém posição do formulário na página
 */
function getFormPosition() {
  const forms = document.querySelectorAll('form');
  const targetForm = forms[forms.length - 1];
  
  if (!targetForm) return 'unknown';
  
  const rect = targetForm.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const formTop = rect.top + scrollTop;
  
  const pageHeight = document.documentElement.scrollHeight;
  const position = (formTop / pageHeight) * 100;
  
  if (position < 25) return 'top';
  if (position < 50) return 'middle';
  if (position < 75) return 'bottom';
  return 'footer';
}

/**
 * Obtém tempo na página (segundos)
 */
function getTimeOnPage() {
  return Math.floor((Date.now() - performance.timing.navigationStart) / 1000);
}

/**
 * Obtém scroll máximo alcançado
 */
function getMaxScrollDepth() {
  return Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
}

/**
 * Obtém número de páginas na sessão
 */
function getSessionPageViews() {
  try {
    const pageViews = sessionStorage.getItem('page_views') || '1';
    return parseInt(pageViews);
  } catch {
    return 1;
  }
}

/**
 * Calcula score de engajamento do usuário
 */
function calculateEngagementScore() {
  const timeOnPage = getTimeOnPage();
  const scrollDepth = getMaxScrollDepth();
  const pageViews = getSessionPageViews();
  const hasInteractions = getUserInteractions();
  
  let score = 0;
  
  // Tempo (40%)
  if (timeOnPage > 180) score += 40;
  else if (timeOnPage > 120) score += 30;
  else if (timeOnPage > 60) score += 20;
  else if (timeOnPage > 30) score += 10;
  
  // Scroll (30%)
  if (scrollDepth > 75) score += 30;
  else if (scrollDepth > 50) score += 20;
  else if (scrollDepth > 25) score += 10;
  
  // Páginas (20%)
  if (pageViews > 3) score += 20;
  else if (pageViews > 1) score += 10;
  
  // Interações (10%)
  if (hasInteractions > 5) score += 10;
  else if (hasInteractions > 2) score += 5;
  
  return Math.min(score, 100);
}

/**
 * Obtém informações do dispositivo
 */
function getDeviceInfo() {
  return {
    device_type: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
    browser: getBrowserName(),
    os: getOperatingSystem(),
    screen_resolution: `${screen.width}x${screen.height}`,
    viewport_size: `${window.innerWidth}x${window.innerHeight}`
  };
}

/**
 * Obtém qualidade da sessão
 */
function getSessionQuality() {
  const duration = getTimeOnPage();
  const bounce = getSessionPageViews() === 1;
  const engagement = calculateEngagementScore();
  
  if (engagement > 80 && duration > 180) return 'high';
  if (engagement > 50 && duration > 60) return 'medium';
  return 'low';
}

/**
 * Salva analytics do lead para comparação
 */
function saveLeadAnalytics(params) {
  try {
    const analytics = JSON.parse(localStorage.getItem('lead_analytics') || '[]');
    
    analytics.push({
      timestamp: Date.now(),
      params: Object.keys(params),
      dataCompleteness: calculateDataCompleteness(params),
      engagementScore: calculateEngagementScore(),
      predictedLtv: params.predicted_ltv,
      value: params.value
    });
    
    // Mantém apenas últimos 50 registros
    if (analytics.length > 50) {
      analytics.shift();
    }
    
    localStorage.setItem('lead_analytics', JSON.stringify(analytics));
    
  } catch (error) {
    console.warn('Erro ao salvar analytics do lead:', error);
  }
}

// Helper functions
function getBrowserName() {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Chrome')) return 'chrome';
  if (userAgent.includes('Firefox')) return 'firefox';
  if (userAgent.includes('Safari')) return 'safari';
  if (userAgent.includes('Edge')) return 'edge';
  return 'unknown';
}

function getOperatingSystem() {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Windows')) return 'windows';
  if (userAgent.includes('Mac')) return 'macos';
  if (userAgent.includes('Linux')) return 'linux';
  if (userAgent.includes('Android')) return 'android';
  if (userAgent.includes('iOS')) return 'ios';
  return 'unknown';
}

function getUserInteractions() {
  try {
    return parseInt(sessionStorage.getItem('user_interactions') || '0');
  } catch {
    return 0;
  }
}