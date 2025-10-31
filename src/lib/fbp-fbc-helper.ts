/**
 * 🎯 FBP/FBC HELPER
 * 
 * Funções para capturar e gerenciar cookies FBP e FBC do Meta Pixel
 * 
 * FBP = Facebook Browser Pixel (identifica o navegador)
 * FBC = Facebook Click ID (identifica clique em anúncio)
 * 
 * ESSENCIAL para Quality Score 9.5+
 */

/**
 * Captura valor de um cookie específico
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift();
    return cookieValue || null;
  }
  
  return null;
}

/**
 * Captura FBP (_fbp cookie)
 * Formato: fb.1.1234567890.1234567890
 */
export function getFBP(): string | null {
  const fbp = getCookie('_fbp');
  
  if (fbp) {
    console.log('✅ FBP capturado:', fbp);
    return fbp;
  }
  
  console.warn('⚠️ FBP não encontrado - Meta Pixel pode não estar carregado');
  return null;
}

/**
 * Captura FBC (_fbc cookie)
 * Formato: fb.1.1234567890.IwAR123...
 * Só existe se usuário veio de um anúncio do Facebook
 */
export function getFBC(): string | null {
  const fbc = getCookie('_fbc');
  
  if (fbc) {
    console.log('✅ FBC capturado:', fbc);
    console.log('🎯 Usuário veio de um anúncio do Facebook!');
    return fbc;
  }
  
  // Tentar extrair fbclid da URL (caso cookie não exista ainda)
  if (typeof window !== 'undefined') {
    const fbclid = getFBCLIDFromURL();
    if (fbclid) {
      console.log('✅ FBC construído da URL:', fbclid);
      return fbclid;
    }
  }
  
  console.log('ℹ️  FBC não encontrado - Usuário não veio de anúncio do Facebook');
  return null;
}

/**
 * Extrai fbclid da URL e constrói FBC
 * Formato da URL: ?fbclid=IwAR123...
 */
export function getFBCLIDFromURL(): string | null {
  if (typeof window === 'undefined') return null;
  
  const params = new URLSearchParams(window.location.search);
  const fbclid = params.get('fbclid');
  
  if (fbclid) {
    // Construir FBC no formato esperado
    const timestamp = Math.floor(Date.now() / 1000);
    const domain = window.location.hostname.split('.').slice(-2).join('.');
    
    // Formato: fb.{domain_level}.{timestamp}.{fbclid}
    const fbc = `fb.1.${timestamp}.${fbclid}`;
    
    console.log('🔧 FBC construído da URL:', fbc);
    return fbc;
  }
  
  return null;
}

/**
 * Captura AMBOS FBP e FBC
 * Retorna objeto com ambos os valores
 */
export function getMetaPixelCookies(): { fbp: string | null; fbc: string | null } {
  const fbp = getFBP();
  const fbc = getFBC();
  
  console.group('📊 Meta Pixel Cookies Capturados');
  console.log('FBP (Browser ID):', fbp || '❌ Não encontrado');
  console.log('FBC (Click ID):', fbc || '❌ Não encontrado');
  console.groupEnd();
  
  return { fbp, fbc };
}

/**
 * Verifica se Meta Pixel está carregado
 */
export function isMetaPixelLoaded(): boolean {
  if (typeof window === 'undefined') return false;
  
  const hasFBP = getCookie('_fbp') !== null;
  const hasFBQ = typeof (window as any).fbq !== 'undefined';
  
  const isLoaded = hasFBP || hasFBQ;
  
  if (!isLoaded) {
    console.warn('⚠️ Meta Pixel não está carregado!');
    console.warn('   Certifique-se que o Meta Pixel está inicializado antes de capturar FBP/FBC');
  }
  
  return isLoaded;
}

/**
 * Aguarda Meta Pixel carregar (com timeout)
 * Útil para garantir que FBP está disponível
 */
export async function waitForMetaPixel(maxWaitMs: number = 5000): Promise<boolean> {
  const startTime = Date.now();
  
  return new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      const fbp = getCookie('_fbp');
      const elapsed = Date.now() - startTime;
      
      if (fbp) {
        console.log('✅ Meta Pixel carregado e FBP disponível!');
        clearInterval(checkInterval);
        resolve(true);
        return;
      }
      
      if (elapsed >= maxWaitMs) {
        console.warn(`⚠️ Timeout aguardando Meta Pixel (${maxWaitMs}ms)`);
        clearInterval(checkInterval);
        resolve(false);
        return;
      }
    }, 100);
  });
}

/**
 * Captura FBP/FBC com retry e aguarda Meta Pixel
 * Função robusta para usar no form
 */
export async function captureMetaPixelCookiesRobust(): Promise<{ fbp: string | null; fbc: string | null }> {
  console.log('🔍 Capturando FBP/FBC de forma robusta...');
  
  // Verificar imediatamente
  let cookies = getMetaPixelCookies();
  
  // Se FBP não existe, aguardar um pouco
  if (!cookies.fbp) {
    console.log('⏳ Aguardando Meta Pixel carregar...');
    await waitForMetaPixel(3000);
    cookies = getMetaPixelCookies();
  }
  
  return cookies;
}

/**
 * Valida formato do FBP
 */
export function isValidFBP(fbp: string | null): boolean {
  if (!fbp) return false;
  
  // Formato esperado: fb.{domain}.{timestamp}.{random}
  const pattern = /^fb\.\d+\.\d+\.\d+$/;
  return pattern.test(fbp);
}

/**
 * Valida formato do FBC
 */
export function isValidFBC(fbc: string | null): boolean {
  if (!fbc) return false;
  
  // Formato esperado: fb.{domain}.{timestamp}.{fbclid}
  const pattern = /^fb\.\d+\.\d+\..+$/;
  return pattern.test(fbc);
}
