'use client';

import { useState } from 'react';
import { 
  fireCAPIOnlyPageView, 
  fireCAPIOnlyViewContent, 
  fireCAPIOnlyScrollDepth, 
  fireCAPIOnlyCTAClick, 
  fireCAPIOnlyLead, 
  fireCAPIOnlyInitiateCheckout,
  fireAllCAPIOnlyEvents,
  getCurrentMode 
} from '@/lib/capi-only-tracking';

export default function CAPIOnlyTest() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [currentMode, setCurrentMode] = useState(getCurrentMode());

  const addResult = (result: any) => {
    setResults(prev => [result, ...prev].slice(0, 10)); // Mantém últimos 10 resultados
  };

  const testSingleEvent = async (eventName: string, eventFunction: () => Promise<any>) => {
    setLoading(true);
    try {
      const result = await eventFunction();
      addResult({
        timestamp: new Date().toLocaleTimeString(),
        eventName,
        success: result.success,
        mode: result.mode,
        eventId: result.eventId,
        error: result.error
      });
    } catch (error) {
      addResult({
        timestamp: new Date().toLocaleTimeString(),
        eventName,
        success: false,
        error: error.message
      });
    }
    setLoading(false);
  };

  const testAllEvents = async () => {
    setLoading(true);
    try {
      await fireAllCAPIOnlyEvents();
      addResult({
        timestamp: new Date().toLocaleTimeString(),
        eventName: 'TODOS_OS_EVENTOS',
        success: true,
        mode: 'CAPI-ONLY',
        message: 'Todos os eventos enviados com sucesso'
      });
    } catch (error) {
      addResult({
        timestamp: new Date().toLocaleTimeString(),
        eventName: 'TODOS_OS_EVENTOS',
        success: false,
        error: error.message
      });
    }
    setLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  const refreshMode = () => {
    setCurrentMode(getCurrentMode());
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">🚀 Teste CAPI-ONLY Mode</h1>
        
        {/* Status do Modo Atual */}
        <div className={`p-4 rounded-lg mb-6 ${
          currentMode.browserPixelEnabled 
            ? 'bg-yellow-50 border border-yellow-200' 
            : 'bg-green-50 border border-green-200'
        }`}>
          <h2 className="text-lg font-semibold mb-2">📊 Status Atual</h2>
          <div className="space-y-1">
            <p><strong>Modo:</strong> {currentMode.mode}</p>
            <p><strong>Browser Pixel:</strong> {currentMode.browserPixelEnabled ? '✅ ATIVO' : '❌ INATIVO'}</p>
            <p><strong>Descrição:</strong> {currentMode.description}</p>
          </div>
          <button
            onClick={refreshMode}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            🔄 Atualizar Status
          </button>
        </div>

        {/* Botões de Teste */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          <button
            onClick={() => testSingleEvent('PageView', () => fireCAPIOnlyPageView())}
            disabled={loading || currentMode.browserPixelEnabled}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
          >
            📄 PageView
          </button>
          
          <button
            onClick={() => testSingleEvent('ViewContent', () => fireCAPIOnlyViewContent())}
            disabled={loading || currentMode.browserPixelEnabled}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400 transition-colors"
          >
            👁️ ViewContent
          </button>
          
          <button
            onClick={() => testSingleEvent('ScrollDepth', () => fireCAPIOnlyScrollDepth(50))}
            disabled={loading || currentMode.browserPixelEnabled}
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:bg-gray-400 transition-colors"
          >
            📜 ScrollDepth
          </button>
          
          <button
            onClick={() => testSingleEvent('CTAClick', () => fireCAPIOnlyCTAClick('Comprar Agora'))}
            disabled={loading || currentMode.browserPixelEnabled}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 transition-colors"
          >
            🖱️ CTAClick
          </button>
          
          <button
            onClick={() => testSingleEvent('Lead', () => fireCAPIOnlyLead())}
            disabled={loading || currentMode.browserPixelEnabled}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-gray-400 transition-colors"
          >
            🎯 Lead
          </button>
          
          <button
            onClick={() => testSingleEvent('InitiateCheckout', () => fireCAPIOnlyInitiateCheckout())}
            disabled={loading || currentMode.browserPixelEnabled}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400 transition-colors"
          >
            🛒 InitiateCheckout
          </button>
        </div>

        {/* Botão Master */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={testAllEvents}
            disabled={loading || currentMode.browserPixelEnabled}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 transition-all font-semibold"
          >
            {loading ? '⏳ Enviando...' : '🚀 Enviar TODOS os Eventos'}
          </button>
          
          <button
            onClick={clearResults}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            🗑️ Limpar Resultados
          </button>
        </div>

        {/* Alerta se Browser Pixel estiver ativo */}
        {currentMode.browserPixelEnabled && (
          <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-lg mb-6">
            <p className="text-yellow-800">
              ⚠️ <strong>Atenção:</strong> O Browser Pixel está ATIVO. 
              Para testar o modo CAPI-ONLY, defina <code>NEXT_PUBLIC_BROWSER_PIXEL=false</code> no arquivo .env
            </p>
          </div>
        )}

        {/* Resultados */}
        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800">📊 Resultados dos Testes</h3>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {results.map((result, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border ${
                    result.success 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{result.eventName}</p>
                      <p className="text-sm text-gray-600">{result.timestamp}</p>
                      {result.mode && <p className="text-sm"><strong>Modo:</strong> {result.mode}</p>}
                      {result.eventId && <p className="text-sm"><strong>Event ID:</strong> {result.eventId}</p>}
                      {result.message && <p className="text-sm text-green-700">{result.message}</p>}
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-semibold ${
                      result.success 
                        ? 'bg-green-200 text-green-800' 
                        : 'bg-red-200 text-red-800'
                    }`}>
                      {result.success ? '✅ SUCESSO' : '❌ ERRO'}
                    </div>
                  </div>
                  {result.error && (
                    <p className="text-sm text-red-700 mt-2"><strong>Erro:</strong> {result.error}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instruções */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">📋 Como Funciona</h3>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Quando <code>NEXT_PUBLIC_BROWSER_PIXEL=false</code>, o sistema entra em modo CAPI-ONLY</li>
            <li>Os eventos são enviados diretamente para nossa API <code>/api/capi-events</code></li>
            <li>A API formata os dados e envia para o CAPI Gateway da Stape</li>
            <li>O CAPI Gateway processa e envia para a API do Facebook</li>
            <li>Todos os dados geográficos e informações do usuário são preservados</li>
          </ol>
        </div>
      </div>
    </div>
  );
}