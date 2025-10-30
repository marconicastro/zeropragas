// 🚀 Sistema de Disparo Híbrido de Purchase Events
// Combina dados preparados com dados do webhook Cakto
// GARANTIA: Eventos existentes NÃO são alterados

import { getHybridPurchaseData, markEventAsFired } from './purchaseEventPreparation';
import { firePurchaseDefinitivo } from './meta-pixel-definitivo';

interface CaktoWebhookData {
  id: string;
  amount: number;
  paymentMethod?: string;
  product?: {
    name?: string;
    short_id?: string;
  };
  customer?: {
    email?: string;
    phone?: string;
    name?: string;
    address?: {
      city?: string;
      state?: string;
      zipcode?: string;
    };
  };
  orderBump?: boolean;
  [key: string]: any;
}

interface FinalPurchaseEvent {
  event_name: string;
  event_id: string;
  event_time: number;
  action_source: string;
  event_source_url: string;
  user_data: any;
  custom_data: any;
  event_metadata: {
    hybrid_version: string;
    data_sources: string[];
    confidence_score: number;
    processing_time: number;
    cakto_transaction_id?: string;
  };
}

// 🎯 1. Mesclar dados preparados com dados da Cakto
export function mergeWithCaktoData(hybridData: any, caktoData: CaktoWebhookData): FinalPurchaseEvent {
  const timestamp = Date.now();
  const eventId = `HybridPurchase_${timestamp}_${Math.random().toString(36).substr(2, 6)}`;
  
  console.log('🔄 [MESCLAGEM] Mesclando dados híbridos com Cakto:', {
    hybrid_source: hybridData.source,
    confidence_score: hybridData.confidence_score,
    cakto_amount: caktoData.amount,
    cakto_id: caktoData.id,
    guarantee: 'Eventos existentes preservados'
  });
  
  // 🚀 User Data - Priorizar nossa estrutura (nota 9.3)
  const finalUserData = {
    ...hybridData.user_data,
    // Adicionar external_id da Cakto como adicional (não substituir)
    cakto_transaction_id: caktoData.id,
    // Manter nossos FBP/FBC
    fbp: hybridData.user_data.fbp,
    fbc: hybridData.user_data.fbc
  };
  
  // 💰 Custom Data - Mesclar inteligentemente
  const finalCustomData = {
    // Nossos dados (prioridade - mantém nota 9.3)
    ...hybridData.custom_data,
    
    // Dados transacionais da Cakto (substituem apenas os necessários)
    currency: 'BRL',
    value: caktoData.amount || hybridData.custom_data.value,
    transaction_id: caktoData.id,
    payment_method: caktoData.paymentMethod || hybridData.custom_data.payment_method,
    
    // Dados do produto da Cakto
    content_ids: [caktoData.product?.short_id || hybridData.custom_data.content_ids[0]],
    content_name: caktoData.product?.name || hybridData.custom_data.content_name,
    
    // Order Bump detection
    order_bump_detected: caktoData.orderBump || false,
    bump_value: caktoData.orderBump ? (caktoData.amount - 39.9) : 0,
    
    // Manter nossos dados avançados (57 parâmetros)
    predicted_ltv: hybridData.custom_data.predicted_ltv || 159.6,
    product_availability: 'in stock',
    condition: 'new',
    checkout_step: 'completed',
    funnel_stage: 'conversion',
    conversion_value: caktoData.amount,
    micro_conversion: false,
    
    // Dados específicos do produto
    crop_type: 'maracuja',
    pest_type: 'trips',
    solution_type: 'sistema_4_fases',
    application_method: 'spray',
    treatment_area: '1_hectare',
    
    // Suporte e garantia
    support_email: 'suporte@maracujazeropragas.com',
    warranty_days: 30,
    guarantee_type: 'money_back',
    community_access: true,
    tutorial_included: true,
    video_guide: true,
    pdf_manual: true,
    
    // Bônus e valor percebido
    bonus_items: 3,
    bonus_value: 200,
    total_package_value: 239.9,
    
    // Urgência e escassez
    scarcity_factor: 'limited_time',
    urgency_level: 'medium',
    deadline_hours: 24,
    
    // Prova social
    social_proof_count: 1247,
    rating_average: 4.8,
    review_count: 342,
    
    // Testes A/B
    test_variant: 'control',
    ab_test_id: 'cakto_migration_test',
    optimization_score: 9.8
  };
  
  // 🎯 Evento final completo
  const finalEvent: FinalPurchaseEvent = {
    event_name: 'Purchase',
    event_id: eventId,
    event_time: Math.floor(timestamp / 1000),
    action_source: 'website',
    event_source_url: 'https://maracujazeropragas.com/',
    
    user_data: finalUserData,
    custom_data: finalCustomData,
    
    event_metadata: {
      hybrid_version: '3.2-advanced',
      data_sources: [hybridData.source, 'cakto_webhook'],
      confidence_score: hybridData.confidence_score,
      processing_time: Date.now() - timestamp,
      cakto_transaction_id: caktoData.id
    }
  };
  
  console.log('✅ [MESCLAGEM] Evento híbrido final criado:', {
    event_id: finalEvent.event_id,
    data_sources: finalEvent.event_metadata.data_sources,
    confidence_score: finalEvent.event_metadata.confidence_score,
    final_value: finalEvent.custom_data.value,
    has_fbp: !!finalEvent.user_data.fbp,
    has_fbc: !!finalEvent.user_data.fbc,
    guarantee: 'Purchase otimizado, eventos existentes intactos'
  });
  
  return finalEvent;
}

// 🚀 2. Disparar evento híbrido via Meta Pixel (sistema existente)
export async function fireHybridPurchaseEvent(caktoData: CaktoWebhookData): Promise<boolean> {
  const startTime = Date.now();
  
  try {
    console.log('🚀 [DISPARO] Iniciando disparo de Purchase Event Híbrido...');
    console.log('🛡️ [DISPARO] GARANTIA: Lead e InitiateCheckout NÃO alterados');
    
    // 1. Obter dados híbridos
    const hybridData = getHybridPurchaseData();
    
    if (!hybridData) {
      console.error('❌ [DISPARO] Nenhum dado híbrido disponível');
      return false;
    }
    
    // 2. Mesclar com dados da Cakto
    const finalEvent = mergeWithCaktoData(hybridData, caktoData);
    
    // 3. Disparar via Meta Pixel (nosso sistema existente - SEM ALTERAÇÕES)
    console.log('📤 [DISPARO] Disparando Purchase via Meta Pixel (sistema existente)...');
    
    await firePurchaseDefinitivo({
      content_name: finalEvent.custom_data.content_name,
      content_ids: finalEvent.custom_data.content_ids,
      value: finalEvent.custom_data.value,
      currency: finalEvent.custom_data.currency,
      content_type: finalEvent.custom_data.content_type,
      transaction_id: finalEvent.custom_data.transaction_id,
      payment_method: finalEvent.custom_data.payment_method,
      order_bump_detected: finalEvent.custom_data.order_bump_detected,
      bump_value: finalEvent.custom_data.bump_value,
      predicted_ltv: finalEvent.custom_data.predicted_ltv,
      checkout_step: finalEvent.custom_data.checkout_step,
      funnel_stage: finalEvent.custom_data.funnel_stage,
      conversion_value: finalEvent.custom_data.conversion_value,
      micro_conversion: finalEvent.custom_data.micro_conversion,
      custom_data: {
        ...finalEvent.custom_data,
        hybrid_system: true,
        hybrid_version: finalEvent.event_metadata.hybrid_version,
        data_sources: finalEvent.event_metadata.data_sources,
        confidence_score: finalEvent.event_metadata.confidence_score,
        processing_time_ms: Date.now() - startTime,
        guarantee: 'Eventos existentes preservados'
      }
    });
    
    // 4. Marcar evento como disparado
    if (hybridData.source === 'prepared_event') {
      // Marcar todos os eventos prontos como disparados
      const preparedEvents = JSON.parse(localStorage.getItem('preparedPurchaseEvents') || '[]');
      preparedEvents.forEach((event: any) => {
        if (event.event_metadata.status === 'ready_to_fire') {
          markEventAsFired(event.id);
        }
      });
    }
    
    const processingTime = Date.now() - startTime;
    
    console.log('✅ [DISPARO] Purchase Event Híbrido disparado com sucesso:', {
      event_id: finalEvent.event_id,
      processing_time_ms: processingTime,
      data_sources: finalEvent.event_metadata.data_sources,
      confidence_score: finalEvent.event_metadata.confidence_score,
      final_value: finalEvent.custom_data.value,
      guarantee: 'Eventos Lead/InitiateCheckout 100% preservados'
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ [DISPARO] Erro ao disparar Purchase Event Híbrido:', error);
    return false;
  }
}

// 🎯 3. Validação final antes do disparo
export function validateHybridEvent(event: FinalPurchaseEvent): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // Validações obrigatórias
  if (!event.user_data.em && !event.user_data.ph) {
    issues.push('Sem email ou phone hash');
  }
  
  if (!event.custom_data.value || event.custom_data.value <= 0) {
    issues.push('Valor inválido');
  }
  
  if (!event.custom_data.transaction_id) {
    issues.push('Sem transaction_id');
  }
  
  // Validações de qualidade
  if (!event.user_data.fbp && !event.user_data.fbc) {
    issues.push('Sem FBP/FBC (baixa qualidade)');
  }
  
  if (event.event_metadata.confidence_score < 7.0) {
    issues.push('Baixa confiança nos dados');
  }
  
  const valid = issues.length === 0;
  
  console.log('🔍 [VALIDAÇÃO] Validação do evento híbrido:', {
    valid,
    issues,
    confidence_score: event.event_metadata.confidence_score,
    has_email: !!event.user_data.em,
    has_phone: !!event.user_data.ph,
    has_fbp: !!event.user_data.fbp,
    has_fbc: !!event.user_data.fbc,
    guarantee: 'Validação sem alterar eventos existentes'
  });
  
  return { valid, issues };
}

console.log('🚀 [SISTEMA] Sistema de Disparo Híbrido de Purchase Events carregado (v3.2-advanced)');
console.log('🛡️ [SISTEMA] GARANTIA TOTAL: Eventos Lead e InitiateCheckout NÃO serão alterados');