'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
    _fbq: any;
  }
}

interface FacebookPixelLoaderProps {
  pixelId: string;
}

export default function FacebookPixelLoader({ pixelId = '714277868320104' }: FacebookPixelLoaderProps) {
  useEffect(() => {
    if (typeof window === 'undefined') {
      console.log('❌ FacebookPixelLoader: window is undefined, skipping');
      return;
    }

    console.log('🚀 FacebookPixelLoader: Initializing...');

    // Inicializar fbq se não existir
    if (!window.fbq) {
      console.log('📝 FacebookPixelLoader: Creating fbq function...');
      
      window.fbq = function fbq(...args: any[]) {
        if (window.fbq.callMethod) {
          window.fbq.callMethod(...args);
        } else {
          window.fbq.queue.push(args);
        }
      };
      
      if (!window._fbq) window._fbq = window.fbq;
      window.fbq.push = window.fbq;
      window.fbq.loaded = true;
      window.fbq.version = '2.0';
      window.fbq.queue = [];
      
      console.log('✅ FacebookPixelLoader: fbq function created');
    } else {
      console.log('ℹ️ FacebookPixelLoader: fbq already exists');
    }

    // Carregar o script do Facebook Pixel
    console.log('📝 FacebookPixelLoader: Loading Facebook Pixel script...');
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    script.onload = () => {
      console.log('✅ Facebook Pixel script loaded successfully');
      
      // Inicializar o Pixel
      console.log(`📝 FacebookPixelLoader: Initializing pixel ${pixelId}...`);
      window.fbq('init', pixelId);
      console.log(`✅ Facebook Pixel ${pixelId} initialized`);
      
      // Enviar PageView inicial
      console.log('📝 FacebookPixelLoader: Sending initial PageView...');
      window.fbq('track', 'PageView');
      console.log('✅ Initial PageView sent via fbq()');
    };
    
    script.onerror = () => {
      console.error('❌ FacebookPixelLoader: Failed to load Facebook Pixel script');
    };
    
    document.head.appendChild(script);
    console.log('📝 FacebookPixelLoader: Script added to document head');

    // Adicionar noscript fallback
    const noscript = document.createElement('noscript');
    noscript.innerHTML = `
      <img 
        height="1" 
        width="1" 
        style="display:none"
        src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"
      />
    `;
    document.head.appendChild(noscript);
    console.log('📝 FacebookPixelLoader: Noscript fallback added');

    return () => {
      // Limpar scripts ao desmontar
      console.log('🧹 FacebookPixelLoader: Cleaning up...');
      const scripts = document.head.querySelectorAll('script[src*="connect.facebook.net"]');
      scripts.forEach(script => script.remove());
      
      const noscripts = document.head.querySelectorAll('noscript');
      noscripts.forEach(noscript => noscript.remove());
    };
  }, [pixelId]);

  return null;
}