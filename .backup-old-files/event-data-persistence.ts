/**
 * SISTEMA DE PERSISTÊNCIA DE DADOS ENTRE EVENTOS
 * 
 * Garante que dados coletados em qualquer evento sejam
 * automaticamente persistidos para os próximos eventos
 * 
 * PROBLEMA RESOLVIDO:
 * - ViewContent (58% dados pessoais) → Persiste → Próximos eventos (90%+)
 * - ScrollDepth (68% dados pessoais) → Persiste → Próximos eventos (90%+)
 * - CTAClick (75% dados pessoais) → Persiste → Próximos eventos (90%+)
 */

import { saveUserData } from './userDataPersistence';
import { getBestAvailableLocation } from './locationData';

// Interface para dados coletados em eventos
interface EventCollectedData {
  email?: string;
  phone?: string;
  fullName?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
  source: string;
  timestamp: number;
  confidence: number; // 0-100
}

/**
 * Extrai dados de parâmetros de eventos
 */
function extractDataFromEventParams(eventName: string, params: any): EventCollectedData {
  const extracted: EventCollectedData = {
    source: eventName,
    timestamp: Date.now(),
    confidence: 50 // Base confidence
  };

  // Extrai dados de user_data (se existir)
  if (params.user_data) {
    // Dados não hasheados (se disponíveis)
    if (params.email_original) extracted.email = params.email_original;
    if (params.phone_original) extracted.phone = params.phone_original;
    if (params.fullName_original) extracted.fullName = params.fullName_original;
    if (params.city_original) extracted.city = params.city_original;
    if (params.state_original) extracted.state = params.state_original;
    if (params.zip_original) extracted.zip = params.zip_original;
    if (params.country_original) extracted.country = params.country_original;
  }

  // Extrai de custom_data (se existir)
  if (params.custom_data) {
    if (params.custom_data.email) extracted.email = params.custom_data.email;
    if (params.custom_data.phone) extracted.phone = params.custom_data.phone;
    if (params.custom_data.fullName) extracted.fullName = params.custom_data.fullName;
    if (params.custom_data.city) extracted.city = params.custom_data.city;
    if (params.custom_data.state) extracted.state = params.custom_data.state;
    if (params.custom_data.zip) extracted.zip = params.custom_data.zip;
    if (params.custom_data.country) extracted.country = params.custom_data.country;
  }

  // Extrai dados diretos (fallback)
  if (params.email && !extracted.email) extracted.email = params.email;
  if (params.phone && !extracted.phone) extracted.phone = params.phone;
  if (params.fullName && !extracted.fullName) extracted.fullName = params.fullName;
  if (params.city && !extracted.city) extracted.city = params.city;
  if (params.state && !extracted.state) extracted.state = params.state;
  if (params.zip && !extracted.zip) extracted.zip = params.zip;
  if (params.country && !extracted.country) extracted.country = params.country;

  // Calcula confiança baseada na quantidade de dados
  const dataFields = Object.keys(extracted).filter(key => 
    !['source', 'timestamp', 'confidence'].includes(key) && extracted[key as keyof EventCollectedData]
  );
  extracted.confidence = Math.min(95, 50 + (dataFields.length * 10));

  return extracted;
}

/**
 * Complementa dados com geolocalização automática
 */
async function complementWithGeoData(data: EventCollectedData): Promise<EventCollectedData> {
  // Se não tem dados geográficos, obtém da API
  if (!data.city || !data.state || !data.zip) {
    try {
      const geoData = await getBestAvailableLocation();
      
      // Preenche lacunas com dados da API
      if (!data.city && geoData.city) data.city = geoData.city;
      if (!data.state && geoData.state) data.state = geoData.state;
      if (!data.zip && geoData.zip) data.zip = geoData.zip;
      if (!data.country && geoData.country) data.country = geoData.country;
      
      // Aumenta confiança se obteve dados geográficos
      if (geoData.source !== 'default_brazil') {
        data.confidence = Math.min(95, data.confidence + 15);
      }
    } catch (error) {
      console.warn('Erro ao obter geolocalização para persistência:', error);
    }
  }
  
  return data;
}

/**
 * Salva dados coletados em eventos para persistência
 */
export async function saveEventDataFromEvent(
  eventName: string, 
  eventParams: any
): Promise<boolean> {
  try {
    console.group(`💾 ${eventName} - Persistência de Dados`);
    
    // 1. Extrai dados do evento
    let extractedData = extractDataFromEventParams(eventName, eventParams);
    console.log('📤 Dados extraídos do evento:', extractedData);
    
    // 2. Complementa com geolocalização (se necessário)
    extractedData = await complementWithGeoData(extractedData);
    console.log('🌍 Dados complementados com geo:', extractedData);
    
    // 3. Verifica se há dados úteis para persistir
    const hasUsefulData = Object.keys(extractedData).some(key => 
      !['source', 'timestamp', 'confidence'].includes(key) && 
      extractedData[key as keyof EventCollectedData]
    );
    
    if (!hasUsefulData) {
      console.log('⚠️ Nenhum dado útil para persistir');
      console.groupEnd();
      return false;
    }
    
    // 4. Prepara dados para persistência
    const persistData = {
      email: extractedData.email,
      phone: extractedData.phone,
      fullName: extractedData.fullName,
      city: extractedData.city,
      state: extractedData.state,
      country: extractedData.country,
      cep: extractedData.zip,
      sessionId: `sess_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: extractedData.timestamp,
      source: `event_${eventName}`,
      confidence: extractedData.confidence
    };
    
    // 5. Salva usando sistema existente
    saveUserData(persistData, false); // Não sobrescreve dados existentes
    
    console.log(`✅ Dados do evento ${eventName} persistidos com sucesso!`);
    console.log(`📊 Confiança: ${extractedData.confidence}%`);
    console.log(`🎯 Campos: ${Object.keys(persistData).filter(k => persistData[k]).length}`);
    
    // 6. Atualiza registro de persistência
    updatePersistenceRecord(eventName, extractedData);
    
    console.groupEnd();
    return true;
    
  } catch (error) {
    console.error(`❌ Erro ao persistir dados do evento ${eventName}:`, error);
    console.groupEnd();
    return false;
  }
}

/**
 * Atualiza registro de persistência para análise
 */
function updatePersistenceRecord(eventName: string, data: EventCollectedData) {
  try {
    const records = JSON.parse(localStorage.getItem('event_persistence_records') || '[]');
    
    const record = {
      eventName,
      timestamp: Date.now(),
      dataFields: Object.keys(data).filter(key => 
        !['source', 'timestamp', 'confidence'].includes(key) && data[key as keyof EventCollectedData]
      ),
      confidence: data.confidence,
      hasGeoData: !!(data.city || data.state || data.zip),
      hasPersonalData: !!(data.email || data.phone || data.fullName)
    };
    
    records.push(record);
    
    // Mantém apenas últimos 20 registros
    if (records.length > 20) {
      records.shift();
    }
    
    localStorage.setItem('event_persistence_records', JSON.stringify(records));
    
  } catch (error) {
    console.warn('Erro ao atualizar registro de persistência:', error);
  }
}

/**
 * Analisa eficiência da persistência de dados
 */
export function analyzePersistenceEfficiency() {
  try {
    const records = JSON.parse(localStorage.getItem('event_persistence_records') || '[]');
    
    console.group('📊 ANÁLISE DE PERSISTÊNCIA DE DADOS');
    
    if (records.length === 0) {
      console.log('⚠️ Nenhum registro de persistência encontrado');
      console.groupEnd();
      return;
    }
    
    // Agrupa por evento
    const eventGroups = records.reduce((groups, record) => {
      if (!groups[record.eventName]) {
        groups[record.eventName] = [];
      }
      groups[record.eventName].push(record);
      return groups;
    }, {});
    
    Object.entries(eventGroups).forEach(([eventName, eventRecords]) => {
      console.log(`\n🎯 ${eventName}:`);
      console.log(`  - Total: ${eventRecords.length}`);
      
      const avgConfidence = eventRecords.reduce((sum, r) => sum + r.confidence, 0) / eventRecords.length;
      console.log(`  - Confiança Média: ${avgConfidence.toFixed(1)}%`);
      
      const withGeoData = eventRecords.filter(r => r.hasGeoData).length;
      console.log(`  - Com Dados Geo: ${withGeoData}/${eventRecords.length} (${(withGeoData/eventRecords.length*100).toFixed(1)}%)`);
      
      const withPersonalData = eventRecords.filter(r => r.hasPersonalData).length;
      console.log(`  - Com Dados Pessoais: ${withPersonalData}/${eventRecords.length} (${(withPersonalData/eventRecords.length*100).toFixed(1)}%)`);
      
      // Status
      const efficiency = (avgConfidence + (withGeoData/eventRecords.length*100) + (withPersonalData/eventRecords.length*100)) / 3;
      console.log(`  - Eficiência: ${efficiency.toFixed(1)}% ${efficiency > 70 ? '✅' : efficiency > 50 ? '⚠️' : '❌'}`);
    });
    
    console.groupEnd();
    
  } catch (error) {
    console.error('Erro ao analisar persistência:', error);
  }
}

/**
 * Wrapper para eventos com persistência automática
 */
export async function fireUnifiedEventWithPersistence(
  eventName: string,
  eventFunction: () => Promise<any>,
  customParams: any = {}
) {
  try {
    // 1. Dispara o evento normalmente
    const result = await eventFunction();
    
    // 2. Extrai parâmetros do resultado (se disponível)
    const eventParams = result?.params || result || customParams;
    
    // 3. Persiste dados coletados
    await saveEventDataFromEvent(eventName, eventParams);
    
    return result;
    
  } catch (error) {
    console.error(`❌ Erro ao disparar evento ${eventName} com persistência:`, error);
    throw error;
  }
}

/**
 * Inicializa sistema de persistência automática
 */
export function initializeEventPersistence() {
  console.log('🔄 SISTEMA DE PERSISTÊNCIA DE EVENTOS INICIALIZADO');
  console.log('💡 Dados coletados em qualquer evento serão automaticamente persistidos');
  
  // Analisa eficiência a cada 5 minutos (em desenvolvimento)
  if (process.env.NODE_ENV === 'development') {
    setInterval(() => {
      analyzePersistenceEfficiency();
    }, 5 * 60 * 1000);
  }
}

// Exporta para uso global
if (typeof window !== 'undefined') {
  window.analyzePersistenceEfficiency = analyzePersistenceEfficiency;
  window.initializeEventPersistence = initializeEventPersistence;
  
  // Auto-inicialização
  setTimeout(() => {
    initializeEventPersistence();
  }, 2000);
}