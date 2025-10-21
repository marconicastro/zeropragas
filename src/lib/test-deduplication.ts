/**
 * ARQUIVO DE TESTE PARA VALIDAR DEDUPLICAÇÃO
 * Execute este arquivo no console do navegador para testar
 */

import { eventManager } from './eventManager';

export function testDeduplication() {
  console.group('🧪 TESTE DE DEDUPLICAÇÃO DE EVENTOS');
  
  // Limpar cache antes do teste
  eventManager.clearCache();
  
  // Testar ViewContent
  console.log('📊 Testando ViewContent...');
  eventManager.sendViewContent({
    em: 'test@email.com',
    ph: '11999999999',
    fn: 'Test',
    ln: 'User'
  });
  
  // Tentar enviar o mesmo evento imediatamente (deve ser bloqueado)
  setTimeout(() => {
    console.log('🔄 Tentando enviar ViewContent duplicado...');
    eventManager.sendViewContent({
      em: 'test@email.com',
      ph: '11999999999',
      fn: 'Test',
      ln: 'User'
    });
  }, 100);
  
  // Testar InitiateCheckout
  setTimeout(() => {
    console.log('🛒 Testando InitiateCheckout...');
    eventManager.sendInitiateCheckout({
      em: 'test@email.com',
      ph: '11999999999',
      fn: 'Test',
      ln: 'User'
    });
  }, 200);
  
  // Tentar enviar InitiateCheckout duplicado
  setTimeout(() => {
    console.log('🔄 Tentando enviar InitiateCheckout duplicado...');
    eventManager.sendInitiateCheckout({
      em: 'test@email.com',
      ph: '11999999999',
      fn: 'Test',
      ln: 'User'
    });
  }, 300);
  
  // Mostrar estatísticas finais
  setTimeout(() => {
    console.log('📈 Estatísticas finais:', eventManager.getCacheStats());
    console.log('🎯 Canal primário:', eventManager.getPrimaryChannel());
    console.groupEnd();
  }, 500);
}

// Função para testar via console
if (typeof window !== 'undefined') {
  (window as any).testDeduplication = testDeduplication;
  console.log('🧪 Função de teste disponível: testDeduplication()');
}