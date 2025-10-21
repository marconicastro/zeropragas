/**
 * Utilitários de validação para Facebook Pixel
 * Garante que os eventos estejam no formato correto antes de enviar
 */

/**
 * Valida e corrige o formato dos eventos do Facebook Pixel
 * @param eventData Dados do evento a serem validados
 * @returns Dados validados e corrigidos
 */
export function validateAndFixFacebookEvent(eventData: any): any {
  const validatedData = { ...eventData };
  
  // Garantir que custom_data exista
  if (!validatedData.custom_data) {
    validatedData.custom_data = {};
  }
  
  // Corrigir content_ids - deve ser array, não string JSON
  if (validatedData.custom_data.content_ids) {
    const contentIds = validatedData.custom_data.content_ids;
    if (typeof contentIds === 'string') {
      try {
        // Tentar parsear string JSON
        const parsed = JSON.parse(contentIds);
        validatedData.custom_data.content_ids = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        // Se não for JSON válido, converter para array
        validatedData.custom_data.content_ids = [contentIds];
      }
    } else if (!Array.isArray(contentIds)) {
      // Se não for array nem string, converter para array
      validatedData.custom_data.content_ids = [contentIds];
    }
  }
  
  // Corrigir items - deve ser array, não string JSON
  if (validatedData.custom_data.items) {
    const items = validatedData.custom_data.items;
    if (typeof items === 'string') {
      try {
        // Tentar parsear string JSON
        const parsed = JSON.parse(items);
        validatedData.custom_data.items = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        // Se não for JSON válido, converter para array
        validatedData.custom_data.items = [items];
      }
    } else if (!Array.isArray(items)) {
      // Se não for array nem string, converter para array
      validatedData.custom_data.items = [items];
    }
  }
  
  // Corrigir contents - deve ser array, não string JSON
  if (validatedData.custom_data.contents) {
    const contents = validatedData.custom_data.contents;
    if (typeof contents === 'string') {
      try {
        // Tentar parsear string JSON
        const parsed = JSON.parse(contents);
        validatedData.custom_data.contents = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        // Se não for JSON válido, converter para array
        validatedData.custom_data.contents = [contents];
      }
    } else if (!Array.isArray(contents)) {
      // Se não for array nem string, converter para array
      validatedData.custom_data.contents = [contents];
    }
  }
  
  // Garantir que num_items seja string
  if (validatedData.custom_data.num_items !== undefined) {
    validatedData.custom_data.num_items = String(validatedData.custom_data.num_items);
  }
  
  // Garantir que value seja número
  if (validatedData.custom_data.value !== undefined) {
    validatedData.custom_data.value = Number(validatedData.custom_data.value);
  }
  
  return validatedData;
}

/**
 * Verifica se um evento está no formato correto para o Facebook Pixel
 * @param eventData Dados do evento a serem verificados
 * @returns Objeto com validação e problemas encontrados
 */
export function validateFacebookEventFormat(eventData: any): {
  isValid: boolean;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  if (!eventData.custom_data) {
    issues.push('custom_data não encontrado');
    recommendations.push('Adicione custom_data ao evento');
    return { isValid: false, issues, recommendations };
  }
  
  // Verificar content_ids
  if (eventData.custom_data.content_ids) {
    const contentIds = eventData.custom_data.content_ids;
    if (typeof contentIds === 'string') {
      issues.push('content_ids é string JSON (deve ser array)');
      recommendations.push('Converta content_ids para array: ["item-id"]');
    } else if (!Array.isArray(contentIds)) {
      issues.push('content_ids não é array');
      recommendations.push('content_ids deve ser um array de strings');
    }
  }
  
  // Verificar items
  if (eventData.custom_data.items) {
    const items = eventData.custom_data.items;
    if (typeof items === 'string') {
      issues.push('items é string JSON (deve ser array)');
      recommendations.push('Converta items para array: [{item_id: "..."}]');
    } else if (!Array.isArray(items)) {
      issues.push('items não é array');
      recommendations.push('items deve ser um array de objetos');
    }
  }
  
  // Verificar contents
  if (eventData.custom_data.contents) {
    const contents = eventData.custom_data.contents;
    if (typeof contents === 'string') {
      issues.push('contents é string JSON (deve ser array)');
      recommendations.push('Converta contents para array: [{id: "..."}]');
    } else if (!Array.isArray(contents)) {
      issues.push('contents não é array');
      recommendations.push('contents deve ser um array de objetos');
    }
  }
  
  // Verificar num_items
  if (eventData.custom_data.num_items !== undefined) {
    if (typeof eventData.custom_data.num_items !== 'string') {
      issues.push('num_items não é string');
      recommendations.push('num_items deve ser string: "1"');
    }
  }
  
  // Verificar value
  if (eventData.custom_data.value !== undefined) {
    if (typeof eventData.custom_data.value !== 'number') {
      issues.push('value não é número');
      recommendations.push('value deve ser número: 39.90');
    }
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    recommendations
  };
}

/**
 * Log de depuração para eventos do Facebook Pixel
 * @param eventName Nome do evento
 * @param eventData Dados do evento
 */
export function debugFacebookEvent(eventName: string, eventData: any): void {
  if (process.env.NODE_ENV === 'production') return;
  
  console.group(`🔍 Facebook Pixel Debug - ${eventName}`);
  
  const validation = validateFacebookEventFormat(eventData);
  
  if (validation.isValid) {
    console.log('✅ Evento está no formato CORRETO');
  } else {
    console.error('❌ Evento tem problemas de formato:');
    validation.issues.forEach(issue => console.error(`   - ${issue}`));
    console.log('💡 Recomendações:');
    validation.recommendations.forEach(rec => console.log(`   - ${rec}`));
  }
  
  console.log('📊 Dados do evento:', JSON.stringify(eventData, null, 2));
  console.groupEnd();
  
  return validation.isValid;
}

/**
 * Exemplos de formatos corretos para referência
 */
export const FACEBOOK_EVENT_EXAMPLES = {
  initiate_checkout: {
    event: 'initiate_checkout',
    event_id: 'unique-event-id',
    custom_data: {
      currency: 'BRL',
      value: 39.90,
      content_name: 'E-book Sistema de Controle de Trips - Maracujá',
      content_category: 'E-book',
      content_ids: ['ebook-controle-trips'], // ✅ ARRAY
      num_items: '1', // ✅ STRING
      items: [ // ✅ ARRAY
        {
          item_id: 'ebook-controle-trips',
          item_name: 'E-book Sistema de Controle de Trips',
          quantity: 1,
          price: 39.90,
          item_category: 'E-book',
          item_brand: 'Maracujá Zero Pragas',
          currency: 'BRL'
        }
      ]
    },
    user_data: {
      em: 'email@example.com',
      ph: '11999999999',
      fn: 'Nome',
      ln: 'Sobrenome',
      ct: 'São Paulo',
      st: 'SP',
      zp: '01310100',
      country: 'BR',
      fbc: 'fb.1.1234567890.abc123',
      fbp: 'fb.1.1234567890.1234567890'
    }
  },
  
  view_content: {
    event: 'view_content',
    event_id: 'unique-event-id',
    custom_data: {
      currency: 'BRL',
      value: 39.90,
      content_name: 'E-book Sistema de Controle de Trips - Maracujá',
      content_category: 'E-book',
      content_ids: ['6080425'], // ✅ ARRAY
      num_items: '1', // ✅ STRING
      contents: [ // ✅ ARRAY
        {
          id: '6080425',
          quantity: 1,
          item_price: 39.90
        }
      ]
    },
    user_data: {
      em: 'email@example.com',
      ph: '11999999999',
      fn: 'Nome',
      ln: 'Sobrenome',
      ct: 'São Paulo',
      st: 'SP',
      zp: '01310100',
      country: 'BR',
      fbc: 'fb.1.1234567890.abc123',
      fbp: 'fb.1.1234567890.1234567890'
    }
  }
};

const facebookPixelValidation = {
  validateAndFixFacebookEvent,
  validateFacebookEventFormat,
  debugFacebookEvent,
  FACEBOOK_EVENT_EXAMPLES
};

export default facebookPixelValidation;