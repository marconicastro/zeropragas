'use client';

import { useState, useEffect } from 'react';
import { validateFacebookCompliance, testCompliance } from '@/lib/facebook-compliance-fix';

interface FacebookComplianceCheckerProps {
  /** Mostrar em modo desenvolvimento */
  showInDev?: boolean;
  /** Posição do checker */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export function FacebookComplianceChecker({ 
  showInDev = true, 
  position = 'top-right' 
}: FacebookComplianceCheckerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [lastEvent, setLastEvent] = useState<any>(null);
  const [complianceScore, setComplianceScore] = useState(0);

  useEffect(() => {
    // Só mostra em desenvolvimento se configurado
    if (showInDev && process.env.NODE_ENV === 'development') {
      setIsVisible(true);
      
      // Intercepta eventos fbq para análise
      interceptFbqEvents();
      
      // Adiciona listener para tecla de atalho
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'F') {
          setIsVisible(!isVisible);
        }
      };
      
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [showInDev, isVisible]);

  const interceptFbqEvents = () => {
    if (typeof window !== 'undefined' && window.fbq) {
      const originalTrack = window.fbq;
      
      window.fbq = function(...args: any[]) {
        // Analisa o evento
        if (args[0] === 'track' || args[0] === 'trackCustom') {
          const eventName = args[1];
          const eventData = args[2] || {};
          
          const validation = validateFacebookCompliance(eventData);
          setLastEvent({
            name: eventName,
            data: eventData,
            validation,
            timestamp: new Date().toLocaleTimeString()
          });
          
          setComplianceScore(validation.score);
          
          // Log no console
          if (validation.issues.length > 0) {
            console.group(`🚨 EVENTO NÃO CONFORME: ${eventName}`);
            console.error('Issues:', validation.issues);
            console.warn('Warnings:', validation.warnings);
            console.log('Data:', eventData);
            console.groupEnd();
          } else {
            console.log(`✅ EVENTO CONFORME: ${eventName} (${validation.score}/100)`);
          }
        }
        
        // Executa o fbq original
        return originalTrack.apply(this, args);
      };
    }
  };

  const runComplianceTest = async () => {
    await testCompliance();
  };

  const getPositionClasses = () => {
    const positions = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4', 
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4'
    };
    return positions[position];
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed z-50 ${getPositionClasses()} bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-800">🔍 Facebook Compliance</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
      
      {/* Score de Conformidade */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-600">Score Geral:</span>
          <span className={`text-xs font-bold ${
            complianceScore >= 90 ? 'text-green-600' :
            complianceScore >= 70 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {complianceScore}/100
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all ${
              complianceScore >= 90 ? 'bg-green-500' :
              complianceScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${complianceScore}%` }}
          />
        </div>
      </div>
      
      {/* Último Evento */}
      {lastEvent && (
        <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold">{lastEvent.name}</span>
            <span className="text-gray-500">{lastEvent.timestamp}</span>
          </div>
          
          {lastEvent.validation.issues.length > 0 && (
            <div className="mt-1 text-red-600">
              <div className="font-semibold">❌ Issues:</div>
              {lastEvent.validation.issues.map((issue: string, i: number) => (
                <div key={i} className="ml-2">• {issue}</div>
              ))}
            </div>
          )}
          
          {lastEvent.validation.warnings.length > 0 && (
            <div className="mt-1 text-yellow-600">
              <div className="font-semibold">⚠️ Warnings:</div>
              {lastEvent.validation.warnings.map((warning: string, i: number) => (
                <div key={i} className="ml-2">• {warning}</div>
              ))}
            </div>
          )}
          
          {lastEvent.validation.issues.length === 0 && (
            <div className="mt-1 text-green-600 font-semibold">
              ✅ Evento Conforme
            </div>
          )}
        </div>
      )}
      
      {/* Ações */}
      <div className="flex gap-2">
        <button
          onClick={runComplianceTest}
          className="flex-1 bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-blue-600"
        >
          Testar Completo
        </button>
        <button
          onClick={() => setLastEvent(null)}
          className="flex-1 bg-gray-500 text-white text-xs px-2 py-1 rounded hover:bg-gray-600"
        >
          Limpar
        </button>
      </div>
      
      {/* Informações */}
      <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
        <div>• Ctrl+Shift+F para toggle</div>
        <div>• Analisa eventos em tempo real</div>
        <div>• Verifica conformidade Facebook</div>
      </div>
    </div>
  );
}

// Componente de dica flutuante
export function ComplianceTooltip() {
  const [showTip, setShowTip] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setShowTip(false), 10000);
    return () => clearTimeout(timer);
  }, []);
  
  if (!showTip || process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="fixed bottom-4 left-4 bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-xs z-40">
      <div className="flex items-start gap-2">
        <div className="text-blue-500 text-lg">💡</div>
        <div className="text-xs text-blue-800">
          <div className="font-semibold mb-1">Dica de Conformidade</div>
          <div>Pressione <kbd className="bg-blue-100 px-1 rounded">Ctrl+Shift+F</kbd> para abrir o verificador de conformidade do Facebook.</div>
          <button 
            onClick={() => setShowTip(false)}
            className="mt-2 text-blue-600 underline"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}