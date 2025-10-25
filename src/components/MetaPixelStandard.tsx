'use client';

import { useEffect } from 'react';
import { fireStandardEvent, compareEventQuality } from '@/lib/meta-pixel-standard';

interface MetaPixelStandardProps {
  /** Eventos para configurar */
  events?: Array<{
    name: string;
    params?: Record<string, any>;
    trigger?: string; // selector do elemento que dispara
  }>;
  /** Habilitar modo debug */
  debug?: boolean;
}

export function MetaPixelStandard({ events = [], debug = false }: MetaPixelStandardProps) {
  useEffect(() => {
    // Inicializa o sistema padronizado
    initializeStandardPixel();
    
    // Configura eventos personalizados
    events.forEach(event => {
      setupEventTrigger(event);
    });
    
    // Debug mode
    if (debug) {
      window.compareMetaQuality = compareEventQuality;
      console.log('🔍 Modo debug ativado. Use window.compareMetaQuality() para analisar.');
    }
    
  }, [events, debug]);
  
  return null;
}

function initializeStandardPixel() {
  // Garante que o fbq está disponível
  if (typeof window !== 'undefined' && window.fbq) {
    console.log('✅ Meta Pixel Standard inicializado');
  }
}

function setupEventTrigger(event: { name: string; params?: Record<string, any>; trigger?: string }) {
  if (!event.trigger) return;
  
  const element = document.querySelector(event.trigger);
  if (!element) {
    console.warn(`⚠️ Elemento não encontrado: ${event.trigger}`);
    return;
  }
  
  element.addEventListener('click', (e) => {
    e.preventDefault();
    fireStandardEvent(event.name, event.params);
  });
}

// Exemplos de uso:
export const LEAD_FORM_CONFIG = {
  events: [
    {
      name: 'Lead',
      trigger: '#lead-form-submit',
      params: {
        lead_type: 'newsletter',
        content_name: 'Formulário Newsletter'
      }
    }
  ]
};

export const CHECKOUT_CONFIG = {
  events: [
    {
      name: 'InitiateCheckout',
      trigger: '#checkout-button',
      params: {
        content_name: 'Botão Finalizar Compra',
        checkout_step: 1
      }
    }
  ]
};

export const PURCHASE_CONFIG = {
  events: [
    {
      name: 'Purchase',
      trigger: '#purchase-confirm',
      params: {
        content_name: 'Compra Confirmada',
        payment_method: 'credit_card'
      }
    }
  ]
};