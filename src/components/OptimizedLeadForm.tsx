'use client';

import { useState, useEffect } from 'react';
import { fireOptimizedLead } from '@/lib/lead-optimization';

interface OptimizedLeadFormProps {
  /** Tipo de lead para cálculo de valor */
  leadType?: 'newsletter' | 'contact' | 'demo_request' | 'proposal' | 'consultation';
  /** Campos personalizados */
  customFields?: Array<{
    name: string;
    label: string;
    type: 'text' | 'email' | 'tel' | 'select';
    required?: boolean;
    options?: string[];
  }>;
  /** Texto do botão */
  buttonText?: string;
  /** Classes customizadas */
  className?: string;
}

export function OptimizedLeadForm({ 
  leadType = 'newsletter',
  customFields = [],
  buttonText = 'Enviar',
  className = ''
}: OptimizedLeadFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    company: '',
    leadType,
    ...Object.fromEntries(customFields.map(f => [f.name, '']))
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Rastreia interações do usuário
    trackUserInteractions();
    
    // Rastreia scroll depth
    trackScrollDepth();
    
    // Rastreia tempo na página
    trackTimeOnPage();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // 1. Validação básica
      if (!formData.email || !formData.name) {
        throw new Error('Preencha os campos obrigatórios');
      }
      
      // 2. Enriquece dados com comportamento
      const enrichedData = {
        ...formData,
        formPosition: getFormPosition(),
        timeOnPage: getTimeOnPage(),
        scrollDepth: getMaxScrollDepth(),
        pageViews: getSessionPageViews(),
        deviceInfo: getDeviceInfo(),
        leadSource: getLeadSource()
      };
      
      // 3. Dispara Lead otimizado
      fireOptimizedLead(enrichedData);
      
      // 4. Sucesso
      setSubmitted(true);
      
      // 5. Opcional: Redirecionar ou mostrar mensagem
      setTimeout(() => {
        if (leadType === 'demo_request' || leadType === 'consultation') {
          window.location.href = '/obrigado';
        }
      }, 2000);
      
    } catch (error) {
      console.error('Erro no formulário:', error);
      alert('Erro ao enviar formulário. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Rastreia interações
    incrementUserInteractions();
  };

  if (submitted) {
    return (
      <div className={`p-6 bg-green-50 border border-green-200 rounded-lg text-center ${className}`}>
        <div className="text-green-600 text-lg font-semibold mb-2">
          ✅ Formulário enviado com sucesso!
        </div>
        <div className="text-green-700">
          Em breve entraremos em contato.
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {/* Campo Nome */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nome Completo *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Seu nome completo"
        />
      </div>

      {/* Campo Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          E-mail *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="seu@email.com"
        />
      </div>

      {/* Campo Telefone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Telefone
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="(00) 00000-0000"
        />
      </div>

      {/* Campo Empresa (se não for newsletter) */}
      {leadType !== 'newsletter' && (
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
            Empresa
          </label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nome da sua empresa"
          />
        </div>
      )}

      {/* Campos Customizados */}
      {customFields.map((field) => (
        <div key={field.name}>
          <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
            {field.label} {field.required && '*'}
          </label>
          {field.type === 'select' ? (
            <select
              id={field.name}
              name={field.name}
              value={formData[field.name]}
              onChange={handleInputChange}
              required={field.required}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione...</option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={field.type}
              id={field.name}
              name={field.name}
              value={formData[field.name]}
              onChange={handleInputChange}
              required={field.required}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={field.label}
            />
          )}
        </div>
      ))}

      {/* Campo Hidden para Lead Type */}
      <input type="hidden" name="leadType" value={leadType} />

      {/* Botão de Envio */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? 'Enviando...' : buttonText}
      </button>

      {/* Indicador de Qualidade (Debug) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
          <div className="font-semibold mb-1">📊 Qualidade do Lead:</div>
          <div>Completude: {calculateDataCompleteness(formData) * 100}%</div>
          <div>Engajamento: {calculateEngagementScore()}/100</div>
          <div>Valor Estimado: R$ {calculateLeadValue(formData).toFixed(2)}</div>
          <div>LTV Previsto: R$ {calculatePredictedLTV(formData).toFixed(2)}</div>
        </div>
      )}
    </form>
  );
}

// Helper functions (importadas da lib de otimização)
function trackUserInteractions() {
  let interactions = 0;
  
  const events = ['click', 'scroll', 'keydown', 'mousemove'];
  const trackInteraction = () => {
    interactions++;
    try {
      sessionStorage.setItem('user_interactions', interactions.toString());
    } catch {}
  };
  
  events.forEach(event => {
    document.addEventListener(event, trackInteraction, { passive: true });
  });
}

function trackScrollDepth() {
  let maxScroll = 0;
  
  const updateScrollDepth = () => {
    const scroll = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
    maxScroll = Math.max(maxScroll, scroll);
    
    try {
      sessionStorage.setItem('max_scroll_depth', maxScroll.toString());
    } catch {}
  };
  
  window.addEventListener('scroll', updateScrollDepth, { passive: true });
}

function trackTimeOnPage() {
  const startTime = Date.now();
  
  window.addEventListener('beforeunload', () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    try {
      sessionStorage.setItem('time_on_page', timeSpent.toString());
    } catch {}
  });
}

function incrementUserInteractions() {
  try {
    const current = parseInt(sessionStorage.getItem('user_interactions') || '0');
    sessionStorage.setItem('user_interactions', (current + 1).toString());
  } catch {}
}

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

function getTimeOnPage() {
  try {
    const timeOnPage = sessionStorage.getItem('time_on_page');
    return timeOnPage ? parseInt(timeOnPage) : Math.floor((Date.now() - performance.timing.navigationStart) / 1000);
  } catch {
    return Math.floor((Date.now() - performance.timing.navigationStart) / 1000);
  }
}

function getMaxScrollDepth() {
  try {
    return parseInt(sessionStorage.getItem('max_scroll_depth') || '0');
  } catch {
    return 0;
  }
}

function getSessionPageViews() {
  try {
    return parseInt(sessionStorage.getItem('page_views') || '1');
  } catch {
    return 1;
  }
}

function getDeviceInfo() {
  return {
    device_type: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
    browser: getBrowserName(),
    os: getOperatingSystem()
  };
}

function getLeadSource() {
  const utmSource = new URLSearchParams(window.location.search).get('utm_source');
  const referrer = document.referrer;
  
  if (utmSource) return `utm_${utmSource}`;
  if (referrer) return `referral_${new URL(referrer).hostname}`;
  return 'organic_direct';
}

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

// Funções de cálculo (simplificadas para o componente)
function calculateDataCompleteness(data: any) {
  const requiredFields = ['email', 'name'];
  const optionalFields = ['phone', 'company'];
  
  const requiredComplete = requiredFields.filter(field => data[field]).length;
  const optionalComplete = optionalFields.filter(field => data[field]).length;
  
  const requiredScore = requiredComplete / requiredFields.length * 0.7;
  const optionalScore = optionalComplete / optionalFields.length * 0.3;
  
  return requiredScore + optionalScore;
}

function calculateEngagementScore() {
  const timeOnPage = getTimeOnPage();
  const scrollDepth = getMaxScrollDepth();
  const pageViews = getSessionPageViews();
  
  let score = 0;
  
  if (timeOnPage > 180) score += 40;
  else if (timeOnPage > 120) score += 30;
  else if (timeOnPage > 60) score += 20;
  else if (timeOnPage > 30) score += 10;
  
  if (scrollDepth > 75) score += 30;
  else if (scrollDepth > 50) score += 20;
  else if (scrollDepth > 25) score += 10;
  
  if (pageViews > 3) score += 20;
  else if (pageViews > 1) score += 10;
  
  return Math.min(score, 100);
}

function calculateLeadValue(data: any) {
  const baseValues = {
    'newsletter': 5.00,
    'contact': 15.00,
    'demo_request': 50.00,
    'proposal': 100.00,
    'consultation': 75.00
  };
  
  const leadType = data.leadType || 'newsletter';
  const baseValue = baseValues[leadType] || 5.00;
  
  const dataCompleteness = calculateDataCompleteness(data);
  const engagementBonus = calculateEngagementScore() / 100 * 0.5;
  
  return baseValue * (1 + dataCompleteness + engagementBonus);
}

function calculatePredictedLTV(data: any) {
  const ltvMultipliers = {
    'newsletter': 8.5,
    'contact': 12.0,
    'demo_request': 25.0,
    'proposal': 35.0,
    'consultation': 20.0
  };
  
  const leadType = data.leadType || 'newsletter';
  const baseValue = calculateLeadValue(data);
  return baseValue * (ltvMultipliers[leadType] || 8.5);
}