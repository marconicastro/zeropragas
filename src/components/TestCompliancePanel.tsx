'use client';

import { useState, useEffect } from 'react';

/**
 * COMPONENTE DE TESTE ISOLADO
 * Não interfere no layout ou funcionamento existente
 * Apenas para desenvolvimento e testes
 */
export function TestCompliancePanel() {
  const [isVisible, setIsVisible] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [monitoringStatus, setMonitoringStatus] = useState(null);

  useEffect(() => {
    // Apenas em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      // Adiciona listener para tecla de atalho
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'T') {
          setIsVisible(!isVisible);
        }
      };

      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [isVisible]);

  // Atualiza status do monitoramento
  const updateMonitoringStatus = () => {
    if (window.getMonitoringStatus) {
      setMonitoringStatus(window.getMonitoringStatus());
    }
  };

  useEffect(() => {
    if (isVisible) {
      updateMonitoringStatus();
      const interval = setInterval(updateMonitoringStatus, 2000);
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  // Funções de teste
  const runHashTest = async () => {
    try {
      const result = await window.testHashSystem();
      setTestResults({
        type: 'hash',
        status: 'success',
        data: result,
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (error) {
      setTestResults({
        type: 'hash',
        status: 'error',
        error: error.message,
        timestamp: new Date().toLocaleTimeString()
      });
    }
  };

  const runImprovedLeadTest = async () => {
    try {
      const result = await window.fireImprovedLead({
        lead_type: 'contact',
        test_mode: true
      });
      setTestResults({
        type: 'improved-lead',
        status: 'success',
        data: result,
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (error) {
      setTestResults({
        type: 'improved-lead',
        status: 'error',
        error: error.message,
        timestamp: new Date().toLocaleTimeString()
      });
    }
  };

  const runComparisonTest = async () => {
    try {
      const result = await window.compareLeadVersions({
        lead_type: 'newsletter',
        test_mode: true
      });
      setTestResults({
        type: 'comparison',
        status: 'success',
        data: result,
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (error) {
      setTestResults({
        type: 'comparison',
        status: 'error',
        error: error.message,
        timestamp: new Date().toLocaleTimeString()
      });
    }
  };

  const runMonitoringTest = async () => {
    try {
      await window.testMonitoringSystem();
      setTestResults({
        type: 'monitoring',
        status: 'success',
        data: 'Teste de monitoramento concluído',
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (error) {
      setTestResults({
        type: 'monitoring',
        status: 'error',
        error: error.message,
        timestamp: new Date().toLocaleTimeString()
      });
    }
  };

  const toggleMonitoring = () => {
    if (window.startEventMonitoring && window.stopEventMonitoring) {
      if (monitoringStatus?.active) {
        window.stopEventMonitoring();
      } else {
        window.startEventMonitoring();
      }
      updateMonitoringStatus();
    }
  };

  const showReport = () => {
    if (window.showComplianceReport) {
      const report = window.showComplianceReport();
      setTestResults({
        type: 'report',
        status: 'success',
        data: report,
        timestamp: new Date().toLocaleTimeString()
      });
    }
  };

  const clearData = () => {
    if (window.clearMonitoringData) {
      window.clearMonitoringData();
      setTestResults({
        type: 'clear',
        status: 'success',
        data: 'Dados limpos',
        timestamp: new Date().toLocaleTimeString()
      });
    }
  };

  // Só renderiza em desenvolvimento
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-xs">
          <div className="flex items-center gap-2">
            <div className="text-blue-500 text-lg">🧪</div>
            <div className="text-xs text-blue-800">
              <div className="font-semibold">Painel de Testes</div>
              <div>Pressione <kbd className="bg-blue-100 px-1 rounded">Ctrl+Shift+T</kbd></div>
            </div>
            <button 
              onClick={() => setIsVisible(true)}
              className="ml-auto text-blue-600 underline text-xs"
            >
              Abrir
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">🧪 Painel de Testes - Conformidade Meta</h2>
            <button 
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Testes não invasivos - Não alteram o funcionamento existente
          </div>
        </div>

        <div className="p-4">
          {/* Status do Monitoramento */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-sm mb-2">📊 Status do Monitoramento</h3>
            {monitoringStatus ? (
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="font-medium">Ativo:</span>
                  <span className={`ml-2 ${monitoringStatus.active ? 'text-green-600' : 'text-red-600'}`}>
                    {monitoringStatus.active ? 'Sim' : 'Não'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Eventos:</span>
                  <span className="ml-2">{monitoringStatus.eventsCount}</span>
                </div>
                <div>
                  <span className="font-medium">Última atualização:</span>
                  <span className="ml-2">{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-500">Carregando status...</div>
            )}
          </div>

          {/* Botões de Teste */}
          <div className="mb-6">
            <h3 className="font-semibold text-sm mb-3">🧪 Testes Disponíveis</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <button
                onClick={runHashTest}
                className="bg-blue-500 text-white text-sm px-3 py-2 rounded hover:bg-blue-600"
              >
                Testar Hash
              </button>
              <button
                onClick={runImprovedLeadTest}
                className="bg-green-500 text-white text-sm px-3 py-2 rounded hover:bg-green-600"
              >
                Lead Melhorado
              </button>
              <button
                onClick={runComparisonTest}
                className="bg-purple-500 text-white text-sm px-3 py-2 rounded hover:bg-purple-600"
              >
                Comparar Leads
              </button>
              <button
                onClick={runMonitoringTest}
                className="bg-orange-500 text-white text-sm px-3 py-2 rounded hover:bg-orange-600"
              >
                Testar Monitoramento
              </button>
              <button
                onClick={toggleMonitoring}
                className={`text-white text-sm px-3 py-2 rounded ${
                  monitoringStatus?.active 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {monitoringStatus?.active ? 'Parar' : 'Iniciar'} Monitoramento
              </button>
              <button
                onClick={showReport}
                className="bg-indigo-500 text-white text-sm px-3 py-2 rounded hover:bg-indigo-600"
              >
                Ver Relatório
              </button>
            </div>
          </div>

          {/* Resultados dos Testes */}
          {testResults && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">📈 Resultados</h3>
                <button 
                  onClick={() => setTestResults(null)}
                  className="text-gray-400 hover:text-gray-600 text-xs"
                >
                  Limpar
                </button>
              </div>
              <div className={`p-3 rounded-lg text-xs ${
                testResults.status === 'success' 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">
                    {testResults.type === 'hash' && 'Teste de Hash'}
                    {testResults.type === 'improved-lead' && 'Lead Melhorado'}
                    {testResults.type === 'comparison' && 'Comparação'}
                    {testResults.type === 'monitoring' && 'Monitoramento'}
                    {testResults.type === 'report' && 'Relatório'}
                    {testResults.type === 'clear' && 'Limpeza'}
                  </span>
                  <span className="text-gray-500">{testResults.timestamp}</span>
                </div>
                
                {testResults.status === 'success' ? (
                  <div>
                    <div className="text-green-700 font-medium mb-1">✅ Sucesso</div>
                    {typeof testResults.data === 'object' ? (
                      <pre className="whitespace-pre-wrap text-xs bg-white p-2 rounded border">
                        {JSON.stringify(testResults.data, null, 2)}
                      </pre>
                    ) : (
                      <div>{testResults.data}</div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="text-red-700 font-medium mb-1">❌ Erro</div>
                    <div>{testResults.error}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Instruções */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-semibold text-sm mb-2">📋 Instruções</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <div>• <kbd className="bg-gray-100 px-1 rounded">Ctrl+Shift+T</kbd> - Abrir/fechar painel</div>
              <div>• Testes são <strong>não invasivos</strong> - não alteram o funcionamento existente</div>
              <div>• Monitoramento apenas observa eventos sem interferir</div>
              <div>• Use o modo de desenvolvimento para testes seguros</div>
              <div>• Compare Leads para ver a diferença entre atual vs melhorado</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de dica flutuante
export function TestTooltip() {
  const [showTip, setShowTip] = useState(true);
  
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const timer = setTimeout(() => setShowTip(false), 15000);
      return () => clearTimeout(timer);
    }
  }, []);
  
  if (!showTip || process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="fixed bottom-4 left-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 max-w-xs z-40">
      <div className="flex items-start gap-2">
        <div className="text-yellow-500 text-lg">💡</div>
        <div className="text-xs text-yellow-800">
          <div className="font-semibold mb-1">Novo Sistema de Testes</div>
          <div>Pressione <kbd className="bg-yellow-100 px-1 rounded">Ctrl+Shift+T</kbd> para abrir o painel de testes de conformidade Meta.</div>
          <div className="mt-1 text-yellow-600">Sistema não invasivo - não altera nada existente!</div>
          <button 
            onClick={() => setShowTip(false)}
            className="mt-2 text-yellow-600 underline"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}