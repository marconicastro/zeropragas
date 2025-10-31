/**
 * 🖥️ DETECÇÃO DE DISPOSITIVO E BROWSER
 */

import type { DeviceData } from './types';

/**
 * Detecta tipo de dispositivo baseado no viewport
 */
function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Detecta nome do browser
 */
function getBrowserName(): string {
  if (typeof navigator === 'undefined') return 'unknown';
  
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Chrome')) return 'chrome';
  if (userAgent.includes('Firefox')) return 'firefox';
  if (userAgent.includes('Safari')) return 'safari';
  if (userAgent.includes('Edge')) return 'edge';
  if (userAgent.includes('Opera')) return 'opera';
  
  return 'unknown';
}

/**
 * Detecta sistema operacional
 */
function getOperatingSystem(): string {
  if (typeof navigator === 'undefined') return 'unknown';
  
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Windows')) return 'windows';
  if (userAgent.includes('Mac')) return 'macos';
  if (userAgent.includes('Linux')) return 'linux';
  if (userAgent.includes('Android')) return 'android';
  if (userAgent.includes('iOS')) return 'ios';
  
  return 'unknown';
}

/**
 * Obtém tipo de conexão (se disponível)
 */
function getConnectionType(): string {
  if (typeof navigator === 'undefined') return 'unknown';
  
  const connection = (navigator as any).connection;
  if (connection && connection.effectiveType) {
    return connection.effectiveType;
  }
  
  return 'unknown';
}

/**
 * Coleta todos os dados de dispositivo
 */
export function getDeviceData(): DeviceData {
  return {
    device_type: getDeviceType(),
    screen_width: typeof window !== 'undefined' ? window.screen.width : 1920,
    screen_height: typeof window !== 'undefined' ? window.screen.height : 1080,
    viewport_width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    viewport_height: typeof window !== 'undefined' ? window.innerHeight : 1080,
    pixel_ratio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
    browser: getBrowserName(),
    operating_system: getOperatingSystem(),
    language: typeof navigator !== 'undefined' ? navigator.language : 'pt-BR',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    connection_type: getConnectionType()
  };
}
