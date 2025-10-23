'use client';

import { useEffect, useRef, useState } from 'react';
import { trackMetaEvent } from './MetaPixel';

interface ScrollTrackingProps {
  enabled?: boolean;
  thresholds?: number[];
}

const ScrollTracking: React.FC<ScrollTrackingProps> = ({ 
  enabled = true, 
  thresholds = [25, 50, 75, 90] 
}) => {
  const [scrollDepth, setScrollDepth] = useState(0);
  const firedEvents = useRef<Set<number>>(new Set());
  const viewContentFired = useRef(false);
  const startTime = useRef(Date.now());

  useEffect(() => {
    if (!enabled) return;

    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      
      // Calcular porcentagem de scroll
      const scrollPercent = Math.round(
        ((scrollTop + windowHeight) / documentHeight) * 100
      );

      setScrollDepth(scrollPercent);

      // Verificar thresholds
      thresholds.forEach(threshold => {
        if (scrollPercent >= threshold && !firedEvents.current.has(threshold)) {
          firedEvents.current.add(threshold);
          
          // Disparar eventos conforme as regras
          if (threshold === 25 && !viewContentFired.current) {
            // 🎯 ViewContent SÓ no 25%
            viewContentFired.current = true;
            
            trackMetaEvent('ViewContent', {
              content_name: 'Page Engagement - 25%',
              content_category: 'engagement',
              scroll_depth: threshold,
              time_on_page: Math.floor((Date.now() - startTime.current) / 1000),
              engagement_type: 'scroll_milestone',
              page_height: documentHeight,
              viewport_height: windowHeight,
              scroll_velocity: calculateScrollVelocity()
            });
            
            console.log('🎯 ViewContent disparado no scroll 25%');
          }
          
          // 📊 ScrollEvent para todos os thresholds
          trackMetaEvent('ScrollEvent', {
            content_name: `Scroll ${threshold}%`,
            content_category: 'engagement',
            scroll_depth: threshold,
            time_on_page: Math.floor((Date.now() - startTime.current) / 1000),
            engagement_type: 'scroll_tracking',
            page_height: documentHeight,
            viewport_height: windowHeight,
            scroll_velocity: calculateScrollVelocity(),
            is_viewcontent: threshold === 25
          });
          
          console.log(`📊 ScrollEvent disparado no ${threshold}%`);
        }
      });
    };

    // Throttle para não disparar muitos eventos
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    
    // Limpar eventos ao desmontar
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [enabled, thresholds]);

  // Calcular velocidade do scroll
  const calculateScrollVelocity = (): number => {
    // Implementação simples - pode ser melhorada
    return Math.random() * 5; // pixels por frame (simulado)
  };

  // Reset para testes
  const resetTracking = () => {
    firedEvents.current.clear();
    viewContentFired.current = false;
    startTime.current = Date.now();
    setScrollDepth(0);
    console.log('🔄 Scroll tracking resetado');
  };

  if (!enabled) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded-lg text-xs z-50 max-w-xs">
      <div className="font-semibold mb-2">📊 Scroll Tracking</div>
      <div className="space-y-1">
        <div>Scroll: {scrollDepth}%</div>
        <div>ViewContent: {viewContentFired.current ? '✅' : '❌'}</div>
        <div>Eventos: {Array.from(firedEvents.current).sort((a, b) => a - b).join(', ')}%</div>
      </div>
      <button
        onClick={resetTracking}
        className="mt-2 px-2 py-1 bg-blue-600 rounded text-xs hover:bg-blue-700"
      >
        Reset
      </button>
    </div>
  );
};

export default ScrollTracking;