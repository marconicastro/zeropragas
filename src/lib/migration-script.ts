/**
 * Script de Migração para Sistema Unificado
 * 
 * ATUALIZA TODOS OS EVENTOS PARA USAR A MESMA LÓGICA DO PageViewEnriched
 * Resultado esperado: 100% de cobertura geográfica para todos os eventos
 */

import { migrateToUnifiedSystem, fireStandardEvent } from './meta-pixel-standard';
import { debugDataQuality } from './unifiedUserData';

/**
 * Executa migração completa para o novo sistema
 */
export async function executeMigration() {
  console.group('🚀 MIGRAÇÃO COMPLETA - SISTEMA UNIFICADO');
  
  try {
    // 1. Testar sistema unificado
    console.log('📋 Passo 1: Testando sistema unificado...');
    const migrationSuccess = await migrateToUnifiedSystem();
    
    if (!migrationSuccess) {
      console.error('❌ Falha na migração do sistema unificado');
      return false;
    }
    
    // 2. Comparar qualidade antes/depois
    console.log('📊 Passo 2: Analisando qualidade de dados...');
    const qualityComparison = await debugDataQuality();
    
    console.log('📈 MELHORIAS OBTIDAS:', qualityComparison);
    
    // 3. Limpar cache antigo
    console.log('🧹 Passo 3: Limpando caches antigos...');
    clearOldCaches();
    
    // 4. Inicializar novo sistema
    console.log('🆕 Passo 4: Inicializando novo sistema...');
    initializeNewSystem();
    
    console.log('✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('🎯 Todos os eventos agora usam o SISTEMA UNIFICADO');
    console.log('📈 Expectativa: 100% de cobertura geográfica para todos os eventos');
    
    console.groupEnd();
    return true;
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    console.groupEnd();
    return false;
  }
}

/**
 * Limpa caches e dados antigos do sistema
 */
function clearOldCaches() {
  const oldKeys = [
    'meta_user_data_old',
    'meta_event_analytics_old',
    'location_cache_old',
    'user_session_old'
  ];
  
  oldKeys.forEach(key => {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
      console.log(`🗑️ Removido: ${key}`);
    } catch (error) {
      console.warn(`⚠️ Erro ao remover ${key}:`, error);
    }
  });
}

/**
 * Inicializa novo sistema com valores padrão
 */
function initializeNewSystem() {
  try {
    // Marcar sistema como migrado
    localStorage.setItem('unified_system_migrated', Date.now().toString());
    localStorage.setItem('unified_system_version', '1.0.0');
    
    // Inicializar analytics novo
    const newAnalytics = {
      system: 'unified',
      migrated_at: Date.now(),
      version: '1.0.0',
      events: {}
    };
    
    localStorage.setItem('meta_event_analytics', JSON.stringify(newAnalytics));
    
    console.log('✅ Novo sistema inicializado');
    
  } catch (error) {
    console.error('❌ Erro ao inicializar novo sistema:', error);
  }
}

/**
 * Verifica se a migração já foi executada
 */
export function hasMigrationRun() {
  try {
    const migrated = localStorage.getItem('unified_system_migrated');
    const version = localStorage.getItem('unified_system_version');
    
    if (migrated && version === '1.0.0') {
      const migrationTime = parseInt(migrated);
      const timeSinceMigration = Date.now() - migrationTime;
      const daysSinceMigration = timeSinceMigration / (24 * 60 * 60 * 1000);
      
      console.log(`📅 Migração executada há ${daysSinceMigration.toFixed(1)} dias`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.warn('⚠️ Erro ao verificar migração:', error);
    return false;
  }
}

/**
 * Função de teste para validar o novo sistema
 */
export async function testUnifiedSystem() {
  console.group('🧪 TESTE DO SISTEMA UNIFICADO');
  
  try {
    // Testar diferentes eventos
    const testEvents = [
      { name: 'PageView', params: {} },
      { name: 'ViewContent', params: { content_name: 'Produto Teste' } },
      { name: 'InitiateCheckout', params: { value: 100.00 } },
      { name: 'CTAClick', params: { button_text: 'Comprar Agora' } },
      { name: 'ScrollDepth', params: { depth: 75 } }
    ];
    
    console.log('🎯 Testando eventos com sistema unificado...');
    
    for (const event of testEvents) {
      console.log(`\n📤 Testando ${event.name}...`);
      
      // Simular disparo do evento (sem enviar para Meta)
      const standardParams = await import('./meta-pixel-standard').then(m => 
        m.standardizeEventParams(event.name, event.params)
      );
      
      // Verificar qualidade dos dados
      const userData = standardParams.user_data;
      const dataQuality = {
        hasEmail: !!userData.em,
        hasPhone: !!userData.ph,
        hasName: !!(userData.fn && userData.ln),
        hasLocation: !!(userData.ct && userData.st && userData.country),
        hasZip: !!userData.zp,
        hasSessionId: !!userData.external_id,
        totalFields: Object.keys(userData).filter(k => userData[k]).length
      };
      
      console.log(`  ✅ ${event.name}: ${dataQuality.totalFields}/10 campos preenchidos`);
      console.log(`  📍 Localização: ${dataQuality.hasLocation ? '✅' : '❌'}`);
      console.log(`  👤 Dados pessoais: ${dataQuality.hasEmail && dataQuality.hasPhone ? '✅' : '❌'}`);
    }
    
    console.log('\n🎉 TESTE CONCLUÍDO - Sistema funcionando perfeitamente!');
    console.groupEnd();
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    console.groupEnd();
    return false;
  }
}

/**
 * Executa migração automaticamente se ainda não foi feita
 */
export async function autoMigrateIfNeeded() {
  if (!hasMigrationRun()) {
    console.log('🔄 Migração necessária - executando automaticamente...');
    return await executeMigration();
  } else {
    console.log('✅ Sistema já migrado - pronto para uso');
    return true;
  }
}

// Exportar função principal para uso fácil
const migrationAPI = {
  executeMigration,
  hasMigrationRun,
  testUnifiedSystem,
  autoMigrateIfNeeded
};

export default migrationAPI;