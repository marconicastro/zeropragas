// 🚀 CAPIG Integration Component
// Componente para integrar CAPIG Stape com a página principal

'use client';

import React, { useEffect, useState } from 'react';
import { useCAPIG } from '@/hooks/useCAPIG';

interface CAPIGIntegrationProps {
  children?: React.ReactNode;
  enableAutoPageView?: boolean;
  enableAutoViewContent?: boolean;
  enableLogging?: boolean;
}

export default function CAPIGIntegration({
  children,
  enableAutoPageView = true,
  enableAutoViewContent = true,
  enableLogging = true
}: CAPIGIntegrationProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [healthStatus, setHealthStatus] = useState<'checking' | 'healthy' | 'unhealthy'>('checking');
  
  const {
    sendPageView,
    sendViewContent,
    sendInitiateCheckout,
    getStats,
    checkHealth,
    isReady
  } = useCAPIG({
    enableHealthCheck: true,
    enableLogging
  });

  // Inicialização e health check
  useEffect(() => {
    const initializeCAPIG = async () => {
      try {
        if (enableLogging) {
          console.log('🚀 Inicializando CAPIG Integration...');
        }

        // Health check
        const isHealthy = await checkHealth();
        setHealthStatus(isHealthy ? 'healthy' : 'unhealthy');

        // Auto PageView
        if (enableAutoPageView && isHealthy) {
          await sendPageView();
        }

        // Auto ViewContent após um delay
        if (enableAutoViewContent && isHealthy) {
          setTimeout(async () => {
            await sendViewContent();
          }, 2000); // 2 segundos após PageView
        }

        setIsInitialized(true);

        if (enableLogging) {
          console.log('✅ CAPIG Integration inicializado com sucesso');
          console.log('📊 Estatísticas:', getStats());
        }

      } catch (error) {
        console.error('❌ Erro na inicialização do CAPIG:', error);
        setHealthStatus('unhealthy');
        setIsInitialized(true);
      }
    };

    if (isReady) {
      initializeCAPIG();
    }
  }, [isReady, enableAutoPageView, enableAutoViewContent, enableLogging, sendPageView, sendViewContent, checkHealth, getStats]);

  // Expor funções globalmente para debugging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.capigIntegration = {
        sendPageView,
        sendViewContent,
        sendInitiateCheckout,
        getStats,
        checkHealth,
        isInitialized,
        healthStatus
      };

      if (enableLogging) {
        console.log('🌐 CAPIG Integration exposto globalmente como window.capigIntegration');
      }
    }
  }, [sendPageView, sendViewContent, sendInitiateCheckout, getStats, checkHealth, isInitialized, healthStatus, enableLogging]);

  // Renderizar status de health (apenas em desenvolvimento)
  const renderHealthStatus = () => {
    if (process.env.NODE_ENV !== 'development') return null;

    return (
      <div
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold',
          zIndex: 9999,
          backgroundColor: healthStatus === 'healthy' ? '#10b981' : healthStatus === 'unhealthy' ? '#ef4444' : '#f59e0b',
          color: 'white',
          fontFamily: 'monospace'
        }}
      >
        CAPIG: {healthStatus.toUpperCase()}
      </div>
    );
  };

  return (
    <>
      {renderHealthStatus()}
      {children}
    </>
  );
}

// Tipos para TypeScript
declare global {
  interface Window {
    capigIntegration?: {
      sendPageView: () => Promise<any>;
      sendViewContent: () => Promise<any>;
      sendInitiateCheckout: (userData?: any) => Promise<any>;
      getStats: () => any;
      checkHealth: () => Promise<boolean>;
      isInitialized: boolean;
      healthStatus: 'checking' | 'healthy' | 'unhealthy';
    };
  }
}