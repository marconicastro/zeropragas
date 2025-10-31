/**
 * ⚡ MÉTRICAS DE PERFORMANCE
 */

import type { PerformanceData } from './types';

/**
 * Coleta métricas de performance da página
 */
export function getPerformanceData(): PerformanceData {
  if (typeof performance === 'undefined') {
    return {
      page_load_time: 0,
      dom_content_loaded: 0,
      first_contentful_paint: 0
    };
  }
  
  // Page load time
  const pageLoadTime = Math.round(performance.now());
  
  // DOM Content Loaded
  let domContentLoaded = 0;
  if (performance.timing) {
    domContentLoaded = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
  }
  
  // First Contentful Paint
  let firstContentfulPaint = 0;
  if ((performance as any).getEntriesByType) {
    const paintEntries = (performance as any).getEntriesByType('paint');
    if (paintEntries && paintEntries.length > 0) {
      firstContentfulPaint = paintEntries[0]?.startTime || 0;
    }
  }
  
  return {
    page_load_time: pageLoadTime,
    dom_content_loaded: domContentLoaded,
    first_contentful_paint: firstContentfulPaint
  };
}
