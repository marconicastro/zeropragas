'use client';

import { useEffect } from 'react';

// Declaração global para tipagem do fbq
declare global {
  interface Window {
    fbq: (command: string, eventName: string, parameters?: object, options?: object) => void;
    _fbq: any[];
  }
}

// Função auxiliar para rastreamento de eventos Meta
export const trackMetaEvent = (eventName: string, parameters?: object) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, parameters);
  }
};

interface MetaPixelProps {
  pixelId?: string;
}

const MetaPixel: React.FC<MetaPixelProps> = ({ pixelId = '642933108377475' }) => {
  useEffect(() => {
    // Inicialização do Meta Pixel com configuração otimizada para CAPI Gateway
    (function(f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function(...args: any[]) {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        n.callMethod ? n.callMethod(...args) : n.queue.push(args);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e) as HTMLScriptElement;
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      if (s.parentNode) {
        s.parentNode.insertBefore(t, s);
      }
    })(
      window,
      document,
      'script',
      'https://connect.facebook.net/en_US/fbevents.js'
    );

    // Configuração do Pixel com CAPI Gateway
    if (window.fbq) {
      window.fbq('init', pixelId);
      
      // Desativar configuração automática de cookies de terceiros
      window.fbq('set', 'autoConfig', false, pixelId);
      
      // Definir agente como stape para CAPI Gateway
      window.fbq('set', 'agent', 'stape');
      
      // Configurar endpoint do CAPI Gateway
      window.fbq('set', 'server_event_uri', 'https://capig.maracujazeropragas.com/');
      
      // Disparar PageView inicial
      window.fbq('track', 'PageView');
    }
    
  }, [pixelId]);

  return null; // Componente puramente funcional, sem renderização
};

export default MetaPixel;