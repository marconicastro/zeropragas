/**
 * PAINEL DE TESTE PARA CONTROLE DE EVENTOS
 * Valida ViewContent (1x) e ScrollDepth (50%, 75%, 90%)
 */

'use client';

import { useState, useEffect } from 'react';

export function EventControlTestPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const [eventStatus, setEventStatus] = useState(null);
  const [testLog, setTestLog] = useState([]);

  useEffect(() => {
    // Apenas em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      // Adiciona listener para tecla de atalho
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'E') {
          setIsVisible(!isVisible);
        }
      };

      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [isVisible]);

  // Atualiza status dos eventos
  const updateEventStatus = () => {
    if (window.getEventStatus) {
      const status = window.getEventStatus();
      setEventStatus(status);
      
      // Adiciona ao log
      setTestLog(prev => [...prev.slice(-9), {
        timestamp: new Date().toLocaleTimeString(),
        type: 'status',
        message: `Status atualizado: ViewContent=${status.viewContent.fired ? '✅' : '❌'}, ScrollDepth=${status.scrollDepth.totalFired}/3`
      }]);
    }
  };

  useEffect(() => {
    if (isVisible) {
      updateEventStatus();
      const interval = setInterval(updateEventStatus, 5000); // Reduzido para 5 segundos
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  // Funções de teste
  const testViewContent = () => {
    if (window.forceViewContent) {
      window.forceViewContent('manual_test', { test_mode: true });
      setTestLog(prev => [...prev.slice(-9), {
        timestamp: new Date().toLocaleTimeString(),
        type: 'action',
        message: 'ViewContent forçado manualmente'
      }]);
      setTimeout(updateEventStatus, 500);
    }
  };

  const testScroll50 = () => {
    if (window.forceScrollDepth) {
      window.forceScrollDepth(50);
      setTestLog(prev => [...prev.slice(-9), {
        timestamp: new Date().toLocaleTimeString(),
        type: 'action',
        message: 'ScrollDepth 50% forçado manualmente'
      }]);
      setTimeout(updateEventStatus, 500);
    }
  };

  const testScroll75 = () => {
    if (window.forceScrollDepth) {
      window.forceScrollDepth(75);
      setTestLog(prev => [...prev.slice(-9), {
        timestamp: new Date().toLocaleTimeString(),
        type: 'action',
        message: 'ScrollDepth 75% forçado manualmente'
      }]);
      setTimeout(updateEventStatus, 500);
    }
  };

  const testScroll90 = () => {
    if (window.forceScrollDepth) {
      window.forceScrollDepth(90);
      setTestLog(prev => [...prev.slice(-9), {
        timestamp: new Date().toLocaleTimeString(),
        type: 'action',
        message: 'ScrollDepth 90% forçado manualmente'
      }]);
      setTimeout(updateEventStatus, 500);
    }
  };

  const resetEvents = () => {
    if (window.resetEventController) {
      window.resetEventController();
      setTestLog(prev => [...prev.slice(-9), {
        timestamp: new Date().toLocaleTimeString(),
        type: 'action',
        message: 'EventController resetado'
      }]);
      setTimeout(updateEventStatus, 500);
    }
  };

  const debugEvents = () => {
    if (window.debugEventController) {
      window.debugEventController();
      setTestLog(prev => [...prev.slice(-9), {
        timestamp: new Date().toLocaleTimeString(),
        type: 'debug',
        message: 'Debug executado - verifique o console'
      }]);
    }
  };

  // Simula scroll para testar
  const simulateScroll = (percent) => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPosition = (scrollHeight * percent) / 100;
    window.scrollTo({
      top: scrollPosition,
      behavior: 'smooth'
    });
    
    setTestLog(prev => [...prev.slice(-9), {
      timestamp: new Date().toLocaleTimeString(),
      type: 'simulate',
      message: `Scroll simulado para ${percent}%`
    }]);
  };

  // Só renderiza em desenvolvimento
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (!isVisible) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 max-w-xs">
          <div className="flex items-center gap-2">
            <div className="text-green-500 text-lg">🎯</div>
            <div className="text-xs text-green-800">
              <div className="font-semibold">Controle de Eventos</div>
              <div>Pressione <kbd className="bg-green-100 px-1 rounded">Ctrl+Shift+E</kbd></div>
            </div>
            <button 
              onClick={() => setIsVisible(true)}
              className="ml-auto text-green-600 underline text-xs"
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
            <h2 className="text-lg font-bold text-gray-800">🎯 Painel de Controle de Eventos</h2>
            <button 
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Teste ViewContent (1x) e ScrollDepth (50%, 75%, 90%)
          </div>
        </div>

        <div className="p-4">
          {/* Status dos Eventos */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-sm mb-3">📊 Status dos Eventos</h3>
            {eventStatus ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-white rounded border">
                  <div className="font-medium text-sm mb-2">ViewContent</div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className={eventStatus.viewContent.fired ? 'text-green-600' : 'text-red-600'}>
                        {eventStatus.viewContent.fired ? '✅ Disparado' : '❌ Não disparado'}
                      </span>
                    </div>
                    {eventStatus.viewContent.fired && (
                      <>
                        <div className="flex justify-between">
                          <span>Trigger:</span>
                          <span>{eventStatus.viewContent.trigger}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Horário:</span>
                          <span>{new Date(eventStatus.viewContent.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="p-3 bg-white rounded border">
                  <div className="font-medium text-sm mb-2">ScrollDepth</div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>Total disparado:</span>
                      <span>{eventStatus.scrollDepth.totalFired}/3</span>
                    </div>
                    {eventStatus.scrollDepth.thresholds.map((threshold, index) => (
                      <div key={threshold} className="flex justify-between">
                        <span>{threshold}%:</span>
                        <span className={eventStatus.scrollDepth.fired[index] ? 'text-green-600' : 'text-red-600'}>
                          {eventStatus.scrollDepth.fired[index] ? '✅' : '❌'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-500">Carregando status...</div>
            )}
          </div>

          {/* Botões de Teste */}
          <div className="mb-6">
            <h3 className="font-semibold text-sm mb-3">🧪 Testes Manuais</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={testViewContent}
                className="bg-blue-500 text-white text-sm px-3 py-2 rounded hover:bg-blue-600"
              >
                ViewContent
              </button>
              <button
                onClick={testScroll50}
                className="bg-green-500 text-white text-sm px-3 py-2 rounded hover:bg-green-600"
              >
                Scroll 50%
              </button>
              <button
                onClick={testScroll75}
                className="bg-yellow-500 text-white text-sm px-3 py-2 rounded hover:bg-yellow-600"
              >
                Scroll 75%
              </button>
              <button
                onClick={testScroll90}
                className="bg-red-500 text-white text-sm px-3 py-2 rounded hover:bg-red-600"
              >
                Scroll 90%
              </button>
            </div>
          </div>

          {/* Simulação de Scroll */}
          <div className="mb-6">
            <h3 className="font-semibold text-sm mb-3">📜 Simular Scroll</h3>
            <div className="grid grid-cols-4 gap-3">
              <button
                onClick={() => simulateScroll(25)}
                className="bg-gray-500 text-white text-sm px-3 py-2 rounded hover:bg-gray-600"
              >
                25%
              </button>
              <button
                onClick={() => simulateScroll(50)}
                className="bg-gray-500 text-white text-sm px-3 py-2 rounded hover:bg-gray-600"
              >
                50%
              </button>
              <button
                onClick={() => simulateScroll(75)}
                className="bg-gray-500 text-white text-sm px-3 py-2 rounded hover:bg-gray-600"
              >
                75%
              </button>
              <button
                onClick={() => simulateScroll(90)}
                className="bg-gray-500 text-white text-sm px-3 py-2 rounded hover:bg-gray-600"
              >
                90%
              </button>
            </div>
          </div>

          {/* Controle */}
          <div className="mb-6">
            <h3 className="font-semibold text-sm mb-3">⚙️ Controle</h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={resetEvents}
                className="bg-orange-500 text-white text-sm px-3 py-2 rounded hover:bg-orange-600"
              >
                Resetar
              </button>
              <button
                onClick={debugEvents}
                className="bg-purple-500 text-white text-sm px-3 py-2 rounded hover:bg-purple-600"
              >
                Debug
              </button>
              <button
                onClick={updateEventStatus}
                className="bg-indigo-500 text-white text-sm px-3 py-2 rounded hover:bg-indigo-600"
              >
                Atualizar
              </button>
            </div>
          </div>

          {/* Log de Eventos */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">📝 Log de Eventos</h3>
              <button 
                onClick={() => setTestLog([])}
                className="text-gray-400 hover:text-gray-600 text-xs"
              >
                Limpar
              </button>
            </div>
            <div className="bg-gray-50 rounded p-3 max-h-40 overflow-y-auto">
              {testLog.length > 0 ? (
                <div className="space-y-1">
                  {testLog.map((log, index) => (
                    <div key={index} className="text-xs flex items-start gap-2">
                      <span className="text-gray-500">{log.timestamp}</span>
                      <span className={`${
                        log.type === 'action' ? 'text-blue-600' :
                        log.type === 'debug' ? 'text-purple-600' :
                        log.type === 'simulate' ? 'text-green-600' :
                        'text-gray-600'
                      }`}>
                        {log.message}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-gray-500">Nenhum evento registrado</div>
              )}
            </div>
          </div>

          {/* Instruções */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-semibold text-sm mb-2">📋 Regras Validadas</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <div>• <strong>ViewContent:</strong> Apenas 1 disparo por página</div>
              <div>• <strong>ScrollDepth:</strong> Exatamente 3 disparos (50%, 75%, 90%)</div>
              <div>• <strong>Controle:</strong> Sistema centralizado evita duplicidades</div>
              <div>• <strong>Teste:</strong> Use botões para validar comportamento</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de dica flutuante
export function EventControlTooltip() {
  const [showTip, setShowTip] = useState(true);
  
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const timer = setTimeout(() => setShowTip(false), 12000);
      return () => clearTimeout(timer);
    }
  }, []);
  
  if (!showTip || process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="fixed top-20 right-4 bg-green-50 border border-green-200 rounded-lg p-3 max-w-xs z-40">
      <div className="flex items-start gap-2">
        <div className="text-green-500 text-lg">🎯</div>
        <div className="text-xs text-green-800">
          <div className="font-semibold mb-1">Controle de Eventos Ativo</div>
          <div>Pressione <kbd className="bg-green-100 px-1 rounded">Ctrl+Shift+E</kbd> para testar ViewContent e ScrollDepth.</div>
          <div className="mt-1 text-green-600">Regras: ViewContent (1x) e Scroll (50%, 75%, 90%)</div>
          <button 
            onClick={() => setShowTip(false)}
            className="mt-2 text-green-600 underline"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}