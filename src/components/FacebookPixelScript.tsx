'use client';

import { useEffect } from 'react';

interface FacebookPixelScriptProps {
  pixelId: string;
}

export default function FacebookPixelScript({ pixelId = '714277868320104' }: FacebookPixelScriptProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    console.log('🚀 FacebookPixelScript: Starting initialization...');

    // Check if fbq is already available
    if (window.fbq) {
      console.log('ℹ️ FacebookPixelScript: fbq already exists, skipping initialization');
      return;
    }

    // Create the fbq function
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

    console.log('✅ FacebookPixelScript: fbq function created');

    // Load the Facebook Pixel script
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    script.onload = () => {
      console.log('✅ FacebookPixelScript: Facebook Pixel script loaded');
      
      // Initialize the pixel
      window.fbq('init', pixelId);
      console.log(`✅ FacebookPixelScript: Pixel ${pixelId} initialized`);
      
      // Send PageView
      window.fbq('track', 'PageView');
      console.log('✅ FacebookPixelScript: PageView sent');
    };

    script.onerror = () => {
      console.error('❌ FacebookPixelScript: Failed to load Facebook Pixel script');
    };

    // Insert the script into the head
    const head = document.head || document.getElementsByTagName('head')[0];
    head.appendChild(script);
    console.log('📝 FacebookPixelScript: Script added to head');

  }, [pixelId]);

  return null;
}