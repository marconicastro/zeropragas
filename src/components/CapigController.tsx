'use client';

import { useEffect, useState } from 'react';
import { sendCapigEvent, testCapigComplete, getCapigAnalytics } from '@/lib/capig-gateway';

interface CapigControllerProps {
  /** Habilitar modo debug */
  debug?: boolean;
  /** Mostrar painel de controle */
  showPanel?: boolean;
  /** Posição do painel */
  panelPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export function CapigController({ 
  debug = false, 
  showPanel = process.env.NODE_ENV === 'development',
  panelPosition = 'top-right'
}: CapigControllerProps) {
  const [isVisible, setIsVisible] = useState(showPanel);
  const [lastEvents, setLastEvents] = useState<any[]>([]);
  const [capigStatus, setCapigStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Setup listeners
    setupEventListeners();
    
    // Debug mode
    if (debug) {
      console.log('🚀 CAPIG Controller initialized');
      setupDebugMode();
    }
  }, [debug]);

  const setupEventListeners = () => {
    // Adicionar listener para capturar eventos
    const originalTrackMetaEvent = window.trackMetaEvent;
    
    if (originalTrackMetaEvent) {
      window.trackMetaEvent = async (eventName: string, parameters?: any) => {
        try {
          setCapigStatus('sending');
          
          // Chamar função original (que agora é CAPIG)
          const result = await originalTrackMetaEvent(eventName, parameters);
          
          setCapigStatus('success');
          updateLastEvents(eventName, parameters, result);
          
          return result;
        } catch (error) {
          setCapigStatus('error');
          console.error(`❌ Erro no evento ${eventName}:`, error);
          updateLastEvents(eventName, parameters, { error: error.message });
        }
      };
    }
  };

  const setupDebugMode = () => {
    // Adicionar funções globais para debug
    (window as any).testCapigComplete = testCapigComplete;
    (window as any).getCapigAnalytics = getCapigAnalytics;
    
    // Atalho de teclado
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        setIsVisible(!isVisible);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    
    console.log('🔧 Debug CAPIG: Ctrl+Shift+C para toggle painel');
  };

  const updateLastEvents = (eventName: string, parameters: any, result: any) => {
    const newEvent = {
      eventName,
      parameters,
      result,
      timestamp: new Date().toLocaleTimeString(),
      success: !result.error
    };
    
    setLastEvents(prev => [newEvent, ...prev.slice(0, 4)]);
  };

  const runCompleteTest = async () => {
    try {
      setCapigStatus('sending');
      await testCapigComplete();
      setCapigStatus('success');
      
      // Atualiza analytics
      const analytics = getCapigAnalytics();
      setLastEvents(analytics.slice(-5).reverse());
      
    } catch (error) {
      setCapigStatus('error');
      console.error('Erro no teste completo:', error);
    }
  };

  const getPositionClasses = () => {
    const positions = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4'
    };
    return positions[panelPosition];
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed z-50 ${getPositionClasses()} bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-800">🚀 CAPIG Controller</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
      
      {/* Status */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-600">Status:</span>
          <span className={`text-xs font-bold ${
            capigStatus === 'success' ? 'text-green-600' :
            capigStatus === 'sending' ? 'text-yellow-600' :
            capigStatus === 'error' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {capigStatus.toUpperCase()}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className={`h-2 rounded-full transition-all ${
            capigStatus === 'success' ? 'bg-green-500 w-full' :
            capigStatus === 'sending' ? 'bg-yellow-500 w-1/2' :
            capigStatus === 'error' ? 'bg-red-500 w-full' : 'bg-gray-400 w-1/4'
          }`} />
        </div>
      </div>
      
      {/* Últimos Eventos */}
      <div className="mb-3">
        <div className="text-xs font-semibold text-gray-700 mb-1">Últimos Eventos:</div>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {lastEvents.length === 0 ? (
            <div className="text-xs text-gray-500">Nenhum evento ainda</div>
          ) : (
            lastEvents.map((event, i) => (
              <div key={i} className="text-xs p-1 bg-gray-50 rounded">
                <div className="flex justify-between">
                  <span className="font-semibold">{event.eventName}</span>
                  <span className="text-gray-500">{event.timestamp}</span>
                </div>
                <div className={event.success ? 'text-green-600' : 'text-red-600'}>
                  {event.success ? '✅ Enviado' : '❌ Falha'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Ações */}
      <div className="flex gap-2">
        <button
          onClick={runCompleteTest}
          disabled={capigStatus === 'sending'}
          className="flex-1 bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          Testar Tudo
        </button>
        <button
          onClick={() => setLastEvents([])}
          className="flex-1 bg-gray-500 text-white text-xs px-2 py-1 rounded hover:bg-gray-600"
        >
          Limpar
        </button>
      </div>
      
      {/* Informações */}
      <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
        <div>• Ctrl+Shift+C para toggle</div>
        <div>• Todos os eventos via CAPIG</div>
        <div>• 100% conformidade Meta</div>
      </div>
    </div>
  );
}

// Componente de dica
export function CapigTooltip() {
  const [showTip, setShowTip] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setShowTip(false), 10000);
    return () => clearTimeout(timer);
  }, []);
  
  if (!showTip || process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg p-3 max-w-xs z-40">
      <div className="flex items-start gap-2">
        <div className="text-green-500 text-lg">🚀</div>
        <div className="text-xs text-green-800">
          <div className="font-semibold mb-1">CAPIG Ativado</div>
          <div>Todos os eventos agora são enviados 100% via CAPIG com conformidade total!</div>
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

// Default export for compatibility
export default CapigController;