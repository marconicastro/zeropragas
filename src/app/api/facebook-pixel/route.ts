import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';

// Função para criar hash SHA-256
function sha256(str: string): string {
  return createHash('sha256').update(str.normalize('NFKC')).digest('hex');
}

// Função para retry com backoff exponencial
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ Tentativa ${attempt}/${maxRetries} falhou:`, error.message);
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

// Função para classificar erros do Facebook
function classifyFacebookError(error: any): { type: string; retryable: boolean; message: string } {
  if (!error || !error.error) {
    return {
      type: 'unknown',
      retryable: true,
      message: 'Erro desconhecido'
    };
  }
  
  const errorCode = error.error.code;
  const errorSubcode = error.error.error_subcode;
  const errorMessage = error.error.message || '';
  
  // Erros não retryable - problemas de autenticação ou permissão
  if (errorCode === 190) { // Invalid OAuth access token
    return {
      type: 'auth_error',
      retryable: false,
      message: 'Token de acesso inválido ou expirado'
    };
  }
  
  if (errorCode === 200) { // Permission denied
    return {
      type: 'permission_error',
      retryable: false,
      message: 'Permissão negada para o Pixel'
    };
  }
  
  if (errorCode === 100) { // Invalid parameter
    return {
      type: 'validation_error',
      retryable: false,
      message: 'Parâmetros inválidos na requisição'
    };
  }
  
  // Erros retryable - problemas de rede, rate limit, etc.
  if (errorCode === 4) { // Application throttle
    return {
      type: 'rate_limit',
      retryable: true,
      message: 'Limite de taxa excedido'
    };
  }
  
  if (errorCode === 1) { // API unknown
    return {
      type: 'api_error',
      retryable: true,
      message: 'Erro temporário da API'
    };
  }
  
  if (errorMessage.includes('timeout') || errorMessage.includes('connection')) {
    return {
      type: 'network_error',
      retryable: true,
      message: 'Erro de conexão ou timeout'
    };
  }
  
  // Padrão: considerar retryable para erros desconhecidos
  return {
    type: 'unknown',
    retryable: true,
    message: errorMessage || 'Erro desconhecido'
  };
}

// Função para log detalhado de erro
function logDetailedError(event_name: string, error: any, attempt: number) {
  const errorClassification = classifyFacebookError(error);
  
  console.group(`🚨 Erro no evento ${event_name} (Tentativa ${attempt})`);
  console.error('Tipo:', errorClassification.type);
  console.error('Retryable:', errorClassification.retryable);
  console.error('Mensagem:', errorClassification.message);
  console.error('Resposta completa:', error);
  console.groupEnd();
  
  return errorClassification;
}

// Função para enviar evento para Facebook com retry
async function sendEventToFacebook(eventData: any, maxRetries: number = 3): Promise<{ success: boolean; result?: any; error?: any }> {
  const { event_name, pixel_id } = eventData;
  
  try {
    const response = await retryWithBackoff(async () => {
      const facebookResponse = await fetch(`https://graph.facebook.com/v23.0/${pixel_id}/events?access_token=${process.env.FACEBOOK_ACCESS_TOKEN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
      });
      
      if (!facebookResponse.ok) {
        const errorResult = await facebookResponse.json();
        throw errorResult;
      }
      
      return facebookResponse.json();
    }, maxRetries);
    
    return {
      success: true,
      result: response
    };
    
  } catch (error) {
    const errorClassification = logDetailedError(event_name, error, maxRetries);
    
    return {
      success: false,
      error: {
        ...error,
        classification: errorClassification
      }
    };
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substr(2, 9);
  
  try {
    const body = await request.json();
    
    console.log(`📥 [${requestId}] Recebido dados do Facebook Pixel:`, JSON.stringify(body, null, 2));
    
    // Extrair dados do evento
    const { event_name, event_id, pixel_id, user_data, custom_data } = body;
    
    // Preparar dados do usuário com hash SHA-256
    const hashedUserData = {
      // Dados do usuário com hash - OBRIGATÓRIO para Facebook
      ...(user_data.em && { em: sha256(user_data.em.toLowerCase().trim()) }),
      ...(user_data.ph && { ph: sha256(user_data.ph.replace(/\D/g, '')) }),
      ...(user_data.fn && { fn: sha256(user_data.fn.trim()) }),
      ...(user_data.ln && { ln: sha256(user_data.ln.trim()) }),
      ...(user_data.ct && { ct: sha256(user_data.ct.trim()) }),
      ...(user_data.st && { st: sha256(user_data.st.trim().toUpperCase()) }),
      ...(user_data.zp && { zp: sha256(user_data.zp.replace(/\D/g, '')) }),
      ...(user_data.country && { country: sha256(user_data.country) }),
      
      // Dados de rastreamento - SEM hash (não precisam)
      ...(user_data.client_ip_address && { client_ip_address: user_data.client_ip_address }),
      ...(user_data.client_user_agent && { client_user_agent: user_data.client_user_agent }),
      ...(user_data.fbc && { fbc: user_data.fbc }),
      ...(user_data.fbp && { fbp: user_data.fbp }),
      ...(user_data.external_id && { external_id: user_data.external_id }),
    };
    
    // Preparar dados no formato EXATO que o Facebook API espera
    const facebookEventData = {
      event_name,
      event_id,
      pixel_id,
      data: [{
        event_name: event_name,
        event_id: event_id,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        user_data: hashedUserData,
        custom_data: {
          // Dados customizados - GARANTIR QUE ARRAYS SEJAM ARRAYS, NÃO STRINGS
          currency: custom_data.currency || 'BRL',
          value: custom_data.value || 39.90,
          content_name: custom_data.content_name || 'E-book Sistema de Controle de Trips',
          content_category: custom_data.content_category || 'E-book',
          
          // ✅ CRÍTICO: Garantir que content_ids seja ARRAY, não string JSON
          content_ids: Array.isArray(custom_data.content_ids) 
            ? custom_data.content_ids 
            : typeof custom_data.content_ids === 'string'
              ? [custom_data.content_ids] // Se for string simples, converter para array
              : custom_data.content_ids || ['ebook-controle-trips'],
          
          num_items: String(custom_data.num_items || '1'),
          
          // ✅ CRÍTICO: Garantir que items seja ARRAY, não string JSON
          items: Array.isArray(custom_data.items)
            ? custom_data.items
            : typeof custom_data.items === 'string'
              ? [custom_data.items] // Se for string simples, converter para array
              : custom_data.items || [{
                  item_id: 'ebook-controle-trips',
                  item_name: 'E-book Sistema de Controle de Trips',
                  quantity: 1,
                  price: 39.90,
                  item_category: 'E-book',
                  item_brand: 'Maracujá Zero Pragas',
                  currency: 'BRL'
                }],
        },
        event_source_url: request.headers.get('referer') || 'https://www.maracujazeropragas.com',
        referrer_url: request.headers.get('referer') || 'https://www.maracujazeropragas.com',
      }]
    };
    
    // Log dos dados formatados para depuração
    console.log(`📤 [${requestId}] Dados formatados para Facebook API:`, JSON.stringify(facebookEventData, null, 2));
    console.log(`🔐 [${requestId}] Dados do usuário com hash:`, {
      em: user_data.em ? `${user_data.em} -> ${hashedUserData.em}` : 'N/A',
      ph: user_data.ph ? `${user_data.ph} -> ${hashedUserData.ph}` : 'N/A',
      fn: user_data.fn ? `${user_data.fn} -> ${hashedUserData.fn}` : 'N/A',
      ln: user_data.ln ? `${user_data.ln} -> ${hashedUserData.ln}` : 'N/A',
      ct: user_data.ct ? `${user_data.ct} -> ${hashedUserData.ct}` : 'N/A',
      st: user_data.st ? `${user_data.st} -> ${hashedUserData.st}` : 'N/A',
      zp: user_data.zp ? `${user_data.zp} -> ${hashedUserData.zp}` : 'N/A',
      country: user_data.country ? `${user_data.country} -> ${hashedUserData.country}` : 'N/A',
    });
    
    // Enviar para Facebook Conversion API com retry
    const facebookResult = await sendEventToFacebook(facebookEventData, 3);
    
    const processingTime = Date.now() - startTime;
    
    if (facebookResult.success) {
      console.log(`✅ [${requestId}] Evento enviado com sucesso para Facebook em ${processingTime}ms:`, facebookResult.result);
      
      // Enviar confirmação para o cliente (opcional - para sincronização)
      try {
          // Enviar confirmação de forma assíncrona (não bloquear a resposta principal)
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        fetch(`${baseUrl}/api/facebook-pixel/confirm`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventId: body.event_id,
            eventName: body.event_name,
            status: 'success'
          })
        }).catch(err => {
          console.log(`⚠️ [${requestId}] Não foi possível enviar confirmação:`, err.message);
        });
      } catch (error) {
        console.log(`⚠️ [${requestId}] Erro ao enviar confirmação:`, error.message);
      }
      
      return NextResponse.json({
        success: true,
        message: 'Evento enviado com sucesso para Facebook',
        facebookResponse: facebookResult.result,
        hashedData: hashedUserData,
        processingTime,
        requestId,
        retryAttempts: 0
      });
    } else {
      const errorClassification = facebookResult.error.classification;
      
      console.error(`❌ [${requestId}] Falha ao enviar evento para Facebook após todas as tentativas:`, facebookResult.error);
      
      // Se o erro não for retryable, retornar status específico
      const status = errorClassification.retryable ? 503 : 400;
      
      return NextResponse.json({
        success: false,
        message: `Erro ao enviar evento para Facebook: ${errorClassification.message}`,
        error: facebookResult.error,
        hashedData: hashedUserData,
        processingTime,
        requestId,
        retryable: errorClassification.retryable,
        errorType: errorClassification.type
      }, { status });
    }
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ [${requestId}] Erro no processamento do evento após ${processingTime}ms:`, error);
    
    return NextResponse.json({
      success: false,
      message: 'Erro interno no servidor',
      error: error.message,
      processingTime,
      requestId
    }, { status: 500 });
  }
}