'use client';

import { useEffect } from 'react';

interface FacebookPixelProps {
  pixelId: string;
}

export default function FacebookPixel({ pixelId = '714277868320104' }: FacebookPixelProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    console.log('🚀 FacebookPixel: Initializing...');

    // Standard Facebook Pixel Base Code
    const loadFacebookPixel = () => {
      if (window.fbq) return;
      
      window.fbq = function(...args: any[]) {
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
      
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      const firstScript = document.getElementsByTagName('script')[0];
      firstScript.parentNode?.insertBefore(script, firstScript);
      
      console.log('✅ FacebookPixel: Base code executed');
    };

    loadFacebookPixel();

    // Initialize Pixel
    window.fbq('init', pixelId);
    console.log(`✅ FacebookPixel: Pixel ${pixelId} initialized`);

    // Send PageView
    window.fbq('track', 'PageView');
    console.log('✅ FacebookPixel: PageView tracked');

  }, [pixelId]);

  return (
    <>
      {/* Facebook Pixel noscript fallback */}
      <noscript>
        <img 
          height="1" 
          width="1" 
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt="Facebook Pixel"
        />
      </noscript>
    </>
  );
}