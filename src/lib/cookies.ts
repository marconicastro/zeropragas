/**
 * Utilitários para manipulação de cookies e geolocalização
 * Essencial para capturar fbc, fbp e dados de localização para rastreamento
 */

/**
 * Obtém o valor de um cookie pelo nome
 * @param name Nome do cookie
 * @returns Valor do cookie ou null se não existir
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

/**
 * Obtém todos os cookies de rastreamento do Facebook
 * @returns Objeto com fbc, fbp e outros dados relevantes
 */
export function getFacebookCookies(): {
  fbc: string | null;
  fbp: string | null;
} {
  const fbc = getCookie('_fbc');
  const fbp = getCookie('_fbp');
  
  // DEBUG: Log detalhado dos cookies
  console.log('🔍 DEBUG - Status dos cookies Facebook:');
  console.log('- _fbc:', fbc || '❌ Não encontrado');
  console.log('- _fbp:', fbp || '❌ Não encontrado');
  console.log('- Todos os cookies:', document.cookie);
  
  return {
    fbc: fbc,
    fbp: fbp
  };
}

/**
 * Garante que o cookie _fbp (Facebook Pixel ID) exista
 * Se não existir, cria um novo no formato padrão do Facebook
 */
export function ensureFbpCookie(): void {
  if (typeof window === 'undefined') return;
  
  // Verificar se já temos o cookie _fbp
  const existingFbp = getCookie('_fbp');
  if (existingFbp) {
    console.log('✅ Cookie _fbp já existe:', existingFbp);
    return;
  }
  
  // Criar o cookie _fbp no formato padrão do Facebook
  // Formato: fb.1.{timestamp}.{random}
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const fbpValue = `fb.1.${timestamp}.${random}`;
  
  // Definir o cookie com expiração de 90 dias
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 90);
  
  document.cookie = `_fbp=${fbpValue}; expires=${expirationDate.toUTCString()}; path=/; domain=${window.location.hostname}; SameSite=Lax`;
  
  console.log('🎯 Cookie _fbp criado com sucesso:', fbpValue);
  
  // Verificar se o cookie foi salvo corretamente
  setTimeout(() => {
    const savedFbp = getCookie('_fbp');
    console.log('✅ Cookie _fbp salvo e recuperado:', savedFbp);
  }, 100);
}

/**
 * Captura o fbclid da URL e cria o cookie _fbc
 * Esta função deve ser chamada no carregamento da página
 */
export function captureFbclid(): void {
  if (typeof window === 'undefined') return;
  
  console.log('🔍 Verificando fbclid na URL...');
  console.log('- URL completa:', window.location.href);
  console.log('- Parâmetros da URL:', window.location.search);
  
  // Verificar se já temos o cookie _fbc
  const existingFbc = getCookie('_fbc');
  if (existingFbc) {
    console.log('✅ Cookie _fbc já existe:', existingFbc);
    return;
  }
  
  // Capturar fbclid da URL
  const urlParams = new URLSearchParams(window.location.search);
  const fbclid = urlParams.get('fbclid');
  
  console.log('📊 fbclid capturado da URL:', fbclid);
  
  if (fbclid) {
    // Criar o cookie _fbc no formato correto
    // Formato: fb.1.{timestamp}.{fbclid}
    const timestamp = Date.now();
    const fbcValue = `fb.1.${timestamp}.${fbclid}`;
    
    // Definir o cookie com expiração de 90 dias
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 90);
    
    document.cookie = `_fbc=${fbcValue}; expires=${expirationDate.toUTCString()}; path=/; domain=${window.location.hostname}; SameSite=Lax`;
    
    console.log('🎯 Cookie _fbc criado com sucesso:', fbcValue);
    console.log('📊 fbclid capturado:', fbclid);
    console.log('🔍 Verificando se o cookie foi salvo...');
    
    // Verificar se o cookie foi salvo corretamente
    setTimeout(() => {
      const savedFbc = getCookie('_fbc');
      console.log('✅ Cookie _fbc salvo e recuperado:', savedFbc);
    }, 100);
    
  } else {
    console.log('ℹ️ Nenhum fbclid encontrado na URL - usuário pode ter acessado diretamente');
    console.log('🔍 Parâmetros disponíveis na URL:');
    for (const [key, value] of urlParams.entries()) {
      console.log(`   - ${key}: ${value}`);
    }
  }
}

/**
 * Captura parâmetros UTM da URL e os armazena em localStorage e cookies
 * Esta função deve ser chamada no carregamento da página
 */
export function captureUTMParameters(): void {
  if (typeof window === 'undefined') return;
  
  console.log('🚀 Capturando parâmetros UTM...');
  
  // Capturar parâmetros UTM da URL
  const urlParams = new URLSearchParams(window.location.search);
  const utmParams = {
    utm_source: urlParams.get('utm_source'),
    utm_medium: urlParams.get('utm_medium'),
    utm_campaign: urlParams.get('utm_campaign'),
    utm_content: urlParams.get('utm_content'),
    utm_term: urlParams.get('utm_term')
  };
  
  // Armazenar no localStorage (duração mais longa)
  Object.entries(utmParams).forEach(([key, value]) => {
    if (value) {
      localStorage.setItem(key, value);
      console.log(`✅ UTM ${key} armazenado no localStorage:`, value);
    }
  });
  
  // Armazenar em cookies como backup (30 dias)
  Object.entries(utmParams).forEach(([key, value]) => {
    if (value) {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 30);
      document.cookie = `${key}=${value}; expires=${expirationDate.toUTCString()}; path=/; domain=${window.location.hostname}; SameSite=Lax`;
      console.log(`✅ UTM ${key} armazenado em cookie:`, value);
    }
  });
  
  // Log de status dos UTMs
  console.log('📊 Status dos parâmetros UTM:');
  Object.keys(utmParams).forEach(key => {
    const value = utmParams[key as keyof typeof utmParams];
    console.log(`   - ${key}:`, value || 'Não encontrado');
  });
}

/**
 * Obtém parâmetros UTM armazenados (localStorage优先, cookie fallback)
 * @returns Objeto com os parâmetros UTM
 */
export function getStoredUTMParameters(): {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
} {
  const utmParams = {
    utm_source: null as string | null,
    utm_medium: null as string | null,
    utm_campaign: null as string | null,
    utm_content: null as string | null,
    utm_term: null as string | null
  };
  
  if (typeof window === 'undefined') return utmParams;
  
  // Tentar obter do localStorage primeiro
  Object.keys(utmParams).forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      utmParams[key as keyof typeof utmParams] = value;
    }
  });
  
  // Fallback para cookies
  Object.keys(utmParams).forEach(key => {
    if (!utmParams[key as keyof typeof utmParams]) {
      const value = getCookie(key);
      if (value) {
        utmParams[key as keyof typeof utmParams] = value;
      }
    }
  });
  
  return utmParams;
}

/**
 * Adiciona campos ocultos de UTM a um formulário
 * @param form Elemento do formulário onde adicionar os campos
 */
export function addUTMHiddenFields(form: HTMLFormElement): void {
  if (typeof window === 'undefined') return;
  
  const utmParams = getStoredUTMParameters();
  
  Object.entries(utmParams).forEach(([key, value]) => {
    if (value) {
      // Verificar se campo já existe
      let input = form.querySelector(`input[name="${key}"]`) as HTMLInputElement;
      if (!input) {
        input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.id = key;
        form.appendChild(input);
      }
      input.value = value;
      console.log(`📝 Campo UTM ${key} adicionado ao formulário:`, value);
    }
  });
}

/**
 * Constrói URL com parâmetros UTM
 * @param baseUrl URL base
 * @param additionalParams Parâmetros adicionais para incluir
 * @returns URL completa com parâmetros UTM
 */
export function buildURLWithUTM(baseUrl: string, additionalParams: Record<string, string> = {}): string {
  if (typeof window === 'undefined') return baseUrl;
  
  const url = new URL(baseUrl);
  const utmParams = getStoredUTMParameters();
  
  // Adicionar parâmetros UTM
  Object.entries(utmParams).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });
  
  // Adicionar parâmetros adicionais
  Object.entries(additionalParams).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });
  
  console.log('🔗 URL construída com UTM:', url.toString());
  return url.toString();
}

/**
 * Função para inicializar a captura de parâmetros de rastreamento
 * Deve ser chamada no carregamento da página
 */
export function initializeTracking(): void {
  if (typeof window === 'undefined') return;
  
  console.log('🚀 Inicializando captura de parâmetros de rastreamento...');
  
  // ⚡ CRÍTICO: Garantir que _fbp exista sempre
  ensureFbpCookie();
  
  // Capturar fbclid e criar cookie _fbc
  captureFbclid();
  
  // Capturar parâmetros UTM
  captureUTMParameters();
  
  // Log de status dos cookies
  const { fbc, fbp } = getFacebookCookies();
  const utmParams = getStoredUTMParameters();
  console.log('📊 Status dos cookies de rastreamento:');
  console.log('   - _fbc:', fbc || 'Não encontrado');
  console.log('   - _fbp:', fbp || 'Não encontrado');
  console.log('📊 Status dos parâmetros UTM:');
  Object.keys(utmParams).forEach(key => {
    const value = utmParams[key as keyof typeof utmParams];
    console.log(`   - ${key}:`, value || 'Não encontrado');
  });
}

/**
 * Obtém o endereço IP do usuário
 * @returns Promise com o IP ou null se não for possível obter
 */
export async function getUserIP(): Promise<string | null> {
  try {
    console.log('🌍 Buscando endereço IP do usuário...');
    
    // Tentar múltiplas APIs para obter o IP
    const apis = [
      'https://api.ipify.org?format=json',
      'https://ipapi.co/json/',
      'https://api.ip.sb/ip',
      'https://httpbin.org/ip'
    ];
    
    for (const api of apis) {
      try {
        const response = await fetch(api, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache',
          timeout: 5000
        });
        
        if (response.ok) {
          const data = await response.json();
          const ip = data.ip || data.ip_address || (typeof data === 'string' ? data.trim() : null);
          
          if (ip && /^\d+\.\d+\.\d+\.\d+$/.test(ip)) {
            console.log('✅ Endereço IP obtido com sucesso:', ip);
            return ip;
          }
        }
      } catch (error) {
        console.log(`❌ Falha na API ${api}:`, error.message);
        continue;
      }
    }
    
    console.log('⚠️ Não foi possível obter o endereço IP');
    return null;
    
  } catch (error) {
    console.error('❌ Erro ao buscar endereço IP:', error);
    return null;
  }
}

/**
 * Obtém o Google Analytics Client ID
 * @returns GA Client ID ou null se não existir
 */
export function getGoogleClientId(): string | null {
  const gaCookie = getCookie('_ga');
  if (!gaCookie) return null;
  
  // Formato do cookie _ga: GA1.2.123456789.1234567890
  const parts = gaCookie.split('.');
  if (parts.length >= 4) {
    return parts.slice(2).join('.');
  }
  
  return null;
}

/**
 * Obtém dados pessoais do formulário automaticamente
 * Captura nome, sobrenome, email e telefone dos campos do formulário sem precisar de campos adicionais
 * @returns Objeto com dados pessoais ou null se não encontrar
 */
export function getFormPersonalData(): {
  fn: string;
  ln: string;
  em: string;
  ph: string;
} | null {
  if (typeof document === 'undefined') return null;
  
  console.log('🔍 Procurando dados pessoais no formulário...');
  
  // Mapeamento de possíveis nomes de campos para nome
  const nameFields = ['name', 'nome', 'firstname', 'first_name', 'fn'];
  // Mapeamento de possíveis nomes de campos para sobrenome
  const lastNameFields = ['lastname', 'last_name', 'sobrenome', 'ln'];
  // Mapeamento de possíveis nomes de campos para email
  const emailFields = ['email', 'e-mail', 'mail', 'em'];
  // Mapeamento de possíveis nomes de campos para telefone
  const phoneFields = ['phone', 'telefone', 'celular', 'mobile', 'ph', 'whatsapp'];
  
  let fn = '';
  let ln = '';
  let em = '';
  let ph = '';
  
  // Procurar campos de nome
  for (const fieldName of nameFields) {
    const input = document.querySelector(`input[name*="${fieldName}"], input[id*="${fieldName}"]`) as HTMLInputElement;
    if (input && input.value.trim()) {
      fn = input.value.trim();
      console.log(`✅ Nome encontrado no campo "${fieldName}":`, fn);
      break;
    }
  }
  
  // Procurar campos de sobrenome
  for (const fieldName of lastNameFields) {
    const input = document.querySelector(`input[name*="${fieldName}"], input[id*="${fieldName}"]`) as HTMLInputElement;
    if (input && input.value.trim()) {
      ln = input.value.trim();
      console.log(`✅ Sobrenome encontrado no campo "${fieldName}":`, ln);
      break;
    }
  }
  
  // Procurar campos de email
  for (const fieldName of emailFields) {
    const input = document.querySelector(`input[name*="${fieldName}"], input[id*="${fieldName}"]`) as HTMLInputElement;
    if (input && input.value.trim()) {
      em = input.value.trim();
      console.log(`✅ Email encontrado no campo "${fieldName}":`, em);
      break;
    }
  }
  
  // Procurar campos de telefone
  for (const fieldName of phoneFields) {
    const input = document.querySelector(`input[name*="${fieldName}"], input[id*="${fieldName}"]`) as HTMLInputElement;
    if (input && input.value.trim()) {
      ph = input.value.trim();
      console.log(`✅ Telefone encontrado no campo "${fieldName}":`, ph);
      break;
    }
  }
  
  // Se encontrou pelo menos um dado pessoal, retornar o objeto
  if (fn || ln || em || ph) {
    console.log('🎯 Dados pessoais capturados do formulário:', { fn, ln, em, ph });
    return {
      fn: fn || '',
      ln: ln || '',
      em: em || '',
      ph: ph || ''
    };
  }
  
  console.log('ℹ️ Nenhum dado pessoal encontrado no formulário');
  return null;
}

/**
 * Obtém dados pessoais de ALTA QUALIDADE incluindo captura de dados do formulário
 * @returns Promise com dados pessoais da melhor fonte disponível
 */
export async function getHighQualityPersonalData(): Promise<{
  fn: string;
  ln: string;
  em: string;
  ph: string;
}> {
  // 1. Tentar obter dados do formulário (mais precisos se disponíveis)
  const formData = getFormPersonalData();
  if (formData) {
    console.log('🌍 Usando dados pessoais do formulário:', formData);
    return formData;
  }
  
  // 2. Retornar objeto vazio se não encontrar dados do formulário
  console.log('ℹ️ Nenhum dado pessoal encontrado, retornando valores vazios');
  return {
    fn: '',
    ln: '',
    em: '',
    ph: ''
  };
}

/**
 * Obtém dados de localização do formulário automaticamente
 * Captura cidade, estado e CEP dos campos do formulário sem precisar de campos adicionais
 * @returns Objeto com dados de localização ou null se não encontrar
 */
export function getFormLocationData(): {
  city: string;
  state: string;
  zip: string;
  country: string;
} | null {
  if (typeof document === 'undefined') return null;
  
  console.log('🔍 Procurando dados de localização no formulário...');
  
  // Mapeamento de possíveis nomes de campos para cidade
  const cityFields = ['city', 'cidade', 'localidade', 'location', 'municipio'];
  // Mapeamento de possíveis nomes de campos para estado
  const stateFields = ['state', 'estado', 'uf', 'province', 'provincia'];
  // Mapeamento de possíveis nomes de campos para CEP
  const zipFields = ['zip', 'cep', 'postalcode', 'codigo_postal'];
  
  let city = '';
  let state = '';
  let zip = '';
  
  // Procurar campos de cidade
  for (const fieldName of cityFields) {
    const input = document.querySelector(`input[name*="${fieldName}"], input[id*="${fieldName}"]`) as HTMLInputElement;
    if (input && input.value.trim()) {
      city = input.value.trim();
      console.log(`✅ Cidade encontrada no campo "${fieldName}":`, city);
      break;
    }
  }
  
  // Procurar campos de estado
  for (const fieldName of stateFields) {
    const input = document.querySelector(`input[name*="${fieldName}"], input[id*="${fieldName}"], select[name*="${fieldName}"], select[id*="${fieldName}"]`) as HTMLInputElement | HTMLSelectElement;
    if (input && input.value.trim()) {
      state = input.value.trim();
      console.log(`✅ Estado encontrado no campo "${fieldName}":`, state);
      break;
    }
  }
  
  // Procurar campos de CEP
  for (const fieldName of zipFields) {
    const input = document.querySelector(`input[name*="${fieldName}"], input[id*="${fieldName}"]`) as HTMLInputElement;
    if (input && input.value.trim()) {
      zip = input.value.trim();
      console.log(`✅ CEP encontrado no campo "${fieldName}":`, zip);
      break;
    }
  }
  
  // Se encontrou pelo menos um dado de localização, retornar o objeto
  if (city || state || zip) {
    console.log('🎯 Dados de localização capturados do formulário:', { city, state, zip });
    return {
      city: city || '',
      state: state || '',
      zip: zip || '',
      country: 'BR' // Padrão Brasil
    };
  }
  
  console.log('ℹ️ Nenhum dado de localização encontrado no formulário');
  return null;
}

/**
 * Obtém dados de localização de ALTA QUALIDADE incluindo captura de dados do formulário
 * @returns Promise com dados de localização da melhor fonte disponível
 */
export async function getHighQualityLocationData(): Promise<{
  city: string;
  state: string;
  zip: string;
  country: string;
}> {
  // 1. Tentar obter dados do formulário (mais preciso se disponível)
  const formData = getFormLocationData();
  if (formData) {
    console.log('🌍 Usando dados do formulário:', formData);
    return formData;
  }
  
  // 2. Tentar obter dados em cache (rápido e confiável)
  const cachedGeoData = getCachedGeographicData();
  if (cachedGeoData) {
    console.log('🌍 Usando dados geográficos em cache:', cachedGeoData);
    return {
      city: cachedGeoData.city,
      state: cachedGeoData.state,
      zip: cachedGeoData.zip,
      country: cachedGeoData.country
    };
  }
  
  // 3. Fallback para API externa
  console.log('🌍 Buscando dados de localização via API externa...');
  return await getLocationData();
}

/**
 * Cache para dados geográficos para evitar múltiplas chamadas de API
 */
let geographicCache: {
  city: string;
  state: string;
  zip: string;
  country: string;
  timestamp: number;
} | null = null;

/**
 * Obtém dados de localização usando cache ou múltiplas APIs com fallback
 * @returns Promise com dados de localização
 */
export async function getLocationData(): Promise<{
  city: string;
  state: string;
  zip: string;
  country: string;
}> {
  // Verificar se temos dados em cache (válidos por 30 minutos)
  if (geographicCache && (Date.now() - geographicCache.timestamp) < 30 * 60 * 1000) {
    console.log('✅ Usando dados geográficos em cache:', geographicCache);
    return {
      city: geographicCache.city,
      state: geographicCache.state,
      zip: geographicCache.zip,
      country: geographicCache.country
    };
  }

  console.log('🌍 Buscando novos dados geográficos...');
  
  // Tentar múltiplas APIs em sequência
  const apis = [
    // API 1: ipapi.co (mais precisa)
    async () => {
      try {
        const response = await fetch('https://ipapi.co/json/', {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache',
          timeout: 5000
        });
        
        if (response.ok) {
          const data = await response.json();
          return {
            city: data.city || '',
            state: data.region_code || '',
            zip: data.postal || '',
            country: data.country || 'BR'
          };
        }
      } catch (error) {
        console.warn('⚠️ Falha na API ipapi.co:', error);
      }
      return null;
    },
    
    // API 2: ip-api.com (fallback)
    async () => {
      try {
        const response = await fetch('http://ip-api.com/json/', {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache',
          timeout: 5000
        });
        
        if (response.ok) {
          const data = await response.json();
          return {
            city: data.city || '',
            state: data.region || '',
            zip: data.zip || '',
            country: data.countryCode || 'BR'
          };
        }
      } catch (error) {
        console.warn('⚠️ Falha na API ip-api.com:', error);
      }
      return null;
    },
    
    // API 3: geoip-js (fallback client-side)
    async () => {
      try {
        // Tentar usar a geolocalização do navegador
        if (typeof navigator !== 'undefined' && navigator.geolocation) {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              enableHighAccuracy: false
            });
          });
          
          // Reverse geocoding básico (aproximado)
          const { latitude, longitude } = position.coords;
          
          // Para o Brasil, podemos fazer algumas suposições baseadas nas coordenadas
          if (latitude > -34 && latitude < 5 && longitude > -74 && longitude < -34) {
            return {
              city: 'Desconhecida',
              state: 'BR',
              zip: '00000000',
              country: 'BR'
            };
          }
        }
      } catch (error) {
        console.warn('⚠️ Falha na geolocalização do navegador:', error);
      }
      return null;
    }
  ];

  // Tentar cada API em sequência
  for (const api of apis) {
    const result = await api();
    if (result && (result.city || result.state || result.zip)) {
      console.log('✅ Dados de localização obtidos com sucesso:', result);
      
      // Armazenar em cache
      geographicCache = {
        city: result.city,
        state: result.state,
        zip: result.zip,
        country: result.country,
        timestamp: Date.now()
      };
      
      return result;
    }
  }

  // Fallback final com dados padrão do Brasil
  console.warn('⚠️ Usando fallback de localização padrão (Brasil)');
  const fallbackData = {
    city: 'São Paulo',      // Cidade mais populosa como fallback
    state: 'SP',            // Estado mais populoso como fallback
    zip: '01310-100',       // CEP central de São Paulo
    country: 'BR'           // Garantir Brasil
  };
  
  // Armazenar fallback em cache também
  geographicCache = {
    city: fallbackData.city,
    state: fallbackData.state,
    zip: fallbackData.zip,
    country: fallbackData.country,
    timestamp: Date.now()
  };
  
  return fallbackData;
}

/**
 * Obtém dados geográficos em cache (para uso imediato)
 */
export function getCachedGeographicData(): {
  city: string;
  state: string;
  zip: string;
  country: string;
} | null {
  if (geographicCache && (Date.now() - geographicCache.timestamp) < 30 * 60 * 1000) {
    return {
      city: geographicCache.city,
      state: geographicCache.state,
      zip: geographicCache.zip,
      country: geographicCache.country
    };
  }
  return null;
}

/**
 * Função para validar qualidade dos dados com feedback detalhado
 * @param data Dados a serem validados
 * @returns Objeto com score, problemas e recomendações
 */
export function validateDataQuality(data: any): {
  score: number;
  issues: string[];
  recommendations: string[];
  isValid: boolean;
} {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 0;
  
  // Validar FBC (mais importante - 30 pontos)
  if (!data.fbc) {
    issues.push('FBC não encontrado');
    recommendations.push('Verifique se o fbclid está na URL ou se o cookie _fbc existe');
  } else {
    score += 30;
  }
  
  // Validar FBP (importante - 20 pontos)
  if (!data.fbp) {
    issues.push('FBP não encontrado');
    recommendations.push('Verifique se o cookie _fbp existe');
  } else {
    score += 20;
  }
  
  // Validar dados de localização (10 pontos cada)
  if (!data.ct || data.ct.length < 2) {
    issues.push('Cidade inválida ou ausente');
    recommendations.push('Use API de geolocalização ou dados do formulário');
  } else {
    score += 10;
  }
  
  if (!data.st || data.st.length < 2) {
    issues.push('Estado inválido ou ausente');
    recommendations.push('Verifique o formato do estado (2 letras)');
  } else {
    score += 10;
  }
  
  if (!data.zp || data.zp.length < 8) {
    issues.push('CEP inválido ou ausente');
    recommendations.push('Use CEP válido com 8 dígitos');
  } else {
    score += 10;
  }
  
  // Validar external_id (10 pontos)
  if (!data.external_id) {
    issues.push('External ID não encontrado');
    recommendations.push('Gere external_id a partir do email ou outro identificador único');
  } else {
    score += 10;
  }
  
  // Validar GA Client ID (bônus - 10 pontos)
  if (!data.ga_client_id) {
    issues.push('GA Client ID não encontrado');
    recommendations.push('Verifique se o Google Analytics está configurado corretamente');
  } else {
    score += 10;
  }
  
  // Validar dados do usuário (se disponíveis)
  if (data.em && data.em.includes('@')) {
    score += 5; // Bônus para email
  }
  if (data.ph && data.ph.length >= 10) {
    score += 5; // Bônus para telefone
  }
  if (data.fn && data.fn.length > 1) {
    score += 3; // Bônus para nome
  }
  if (data.ln && data.ln.length > 1) {
    score += 2; // Bônus para sobrenome
  }
  
  const maxScore = 130; // Score máximo possível com todos os bônus
  const isValid = score >= 70; // Considerar válido se score >= 70%
  
  return {
    score: Math.round((score / maxScore) * 100),
    issues,
    recommendations,
    isValid
  };
}

/**
 * Obtém todos os parâmetros de rastreamento necessários
 * @returns Objeto completo com todos os dados de rastreamento
 */
export async function getAllTrackingParams(): Promise<{
  fbc: string | null;
  fbp: string | null;
  ga_client_id: string | null;
  external_id: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
}> {
  const facebookCookies = getFacebookCookies();
  const gaClientId = getGoogleClientId();
  const locationData = await getLocationData();
  
  // Gerar external_id baseado no email se disponível (será sobrescrito quando houver email real)
  const external_id = null; // Será preenchido dinamicamente
  
  return {
    ...facebookCookies,
    ga_client_id: gaClientId,
    external_id,
    ...locationData
  };
}

/**
 * Salva dados pessoais no localStorage para uso futuro
 * @param personalData Dados pessoais para salvar
 */
export function savePersonalDataToLocalStorage(personalData: {
  fn: string;
  ln: string;
  em: string;
  ph: string;
}): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('user_personal_data', JSON.stringify(personalData));
    console.log('💾 Dados pessoais salvos no localStorage:', personalData);
  } catch (error) {
    console.error('❌ Erro ao salvar dados pessoais no localStorage:', error);
  }
}

/**
 * Obtém dados pessoais do localStorage
 * @returns Dados pessoais salvos ou objeto vazio
 */
export function getPersonalDataFromLocalStorage(): {
  fn: string;
  ln: string;
  em: string;
  ph: string;
} {
  if (typeof window === 'undefined') {
    return { fn: '', ln: '', em: '', ph: '' };
  }
  
  try {
    const stored = localStorage.getItem('user_personal_data');
    if (stored) {
      const personalData = JSON.parse(stored);
      console.log('📂 Dados pessoais recuperados do localStorage:', personalData);
      return personalData;
    }
  } catch (error) {
    console.error('❌ Erro ao recuperar dados pessoais do localStorage:', error);
  }
  
  return { fn: '', ln: '', em: '', ph: '' };
}

/**
 * Obtém dados pessoais de ALTA QUALIDADE com múltiplas fontes
 * Prioridade: Formulário > localStorage > Vazio
 * @returns Promise com dados pessoais da melhor fonte disponível
 */
export async function getEnhancedPersonalData(): Promise<{
  fn: string;
  ln: string;
  em: string;
  ph: string;
}> {
  // 1. Tentar obter dados do formulário (mais precisos se disponíveis)
  const formData = getFormPersonalData();
  if (formData && (formData.fn || formData.ln || formData.em || formData.ph)) {
    console.log('🌍 Usando dados pessoais do formulário:', formData);
    // Salvar no localStorage para uso futuro
    savePersonalDataToLocalStorage(formData);
    return formData;
  }
  
  // 2. Tentar obter dados do localStorage
  const localStorageData = getPersonalDataFromLocalStorage();
  if (localStorageData.fn || localStorageData.ln || localStorageData.em || localStorageData.ph) {
    console.log('📂 Usando dados pessoais do localStorage:', localStorageData);
    return localStorageData;
  }
  
  // 3. Retornar objeto vazio se não encontrar dados
  console.log('ℹ️ Nenhum dado pessoal encontrado, retornando valores vazios');
  return {
    fn: '',
    ln: '',
    em: '',
    ph: ''
  };
}

const cookies = {
  getCookie,
  getFacebookCookies,
  getGoogleClientId,
  getFormPersonalData,
  getHighQualityPersonalData,
  getFormLocationData,
  getHighQualityLocationData,
  savePersonalDataToLocalStorage,
  getPersonalDataFromLocalStorage,
  getEnhancedPersonalData,
  getLocationData,
  getCachedGeographicData,
  validateDataQuality,
  getAllTrackingParams,
  captureFbclid,
  captureUTMParameters,
  getStoredUTMParameters,
  addUTMHiddenFields,
  buildURLWithUTM,
  initializeTracking
};

export default cookies;