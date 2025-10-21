'use client';
import { useEffect, useRef, useState } from 'react';
import { eventManager } from '@/lib/eventManager';
import { getHighQualityPersonalData, getHighQualityLocationData, getAllTrackingParams } from '@/lib/cookies';

interface EngagementMetrics {
  scrollDepth: number;
  timeOnPage: number;
  clicks: number;
  formInteractions: number;
  scrollEventsSent: Set<number>;
  timeEventsSent: Set<number>;
}

/**
 * Componente Avançado de Rastreamento de Engajamento
 * 
 * Este componente monitora automaticamente:
 * - Profundidade de scroll (25%, 50%, 75%, 90%)
 * - Tempo na página (15s, 30s, 60s, 120s)
 * - Cliques em botões importantes
 * - Interações com formulários
 * - Foco em campos de email
 * - Saida da página
 * - Visibilidade da página
 * 
 * Todos os eventos são enviados via EventManager para GTM, Server-side e API
 */
export default function EngagementTracker() {
  const metricsRef = useRef<EngagementMetrics>({
    scrollDepth: 0,
    timeOnPage: 0,
    clicks: 0,
    formInteractions: 0,
    scrollEventsSent: new Set(),
    timeEventsSent: new Set()
  });

  const [isActive, setIsActive] = useState(true);
  const startTimeRef = useRef(Date.now());
  const lastScrollTimeRef = useRef(0);

  // Função para capturar dados do usuário
  const getUserData = async () => {
    try {
      const [personalData, locationData, trackingParams] = await Promise.all([
        getHighQualityPersonalData(),
        getHighQualityLocationData(),
        getAllTrackingParams()
      ]);

      return {
        ...personalData,
        ...locationData,
        ...trackingParams
      };
    } catch (error) {
      console.error('Erro ao obter dados do usuário:', error);
      return {};
    }
  };

  // Monitorar scroll depth
  useEffect(() => {
    if (!isActive) return;

    const handleScroll = async () => {
      const now = Date.now();
      // Throttle scroll events
      if (now - lastScrollTimeRef.current < 100) return;
      lastScrollTimeRef.current = now;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercentage = Math.round((scrollTop / scrollHeight) * 100);

      metricsRef.current.scrollDepth = scrollPercentage;

      // Enviar eventos de scroll em marcos específicos
      const scrollThresholds = [25, 50, 75, 90];
      const userData = await getUserData();

      for (const threshold of scrollThresholds) {
        if (scrollPercentage >= threshold && !metricsRef.current.scrollEventsSent.has(threshold)) {
          console.log(`📊 Enviando evento scroll_${threshold}_percent`);
          
          await eventManager.sendScrollDepth(threshold, userData);
          metricsRef.current.scrollEventsSent.add(threshold);

          // Se atingiu 90% de scroll, considerar alto engajamento
          if (threshold === 90) {
            await eventManager.sendHighEngagement(userData);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isActive]);

  // Monitorar tempo na página
  useEffect(() => {
    if (!isActive) return;

    const timeThresholds = [15, 30, 60, 120]; // segundos

    const interval = setInterval(async () => {
      const timeOnPage = Math.floor((Date.now() - startTimeRef.current) / 1000);
      metricsRef.current.timeOnPage = timeOnPage;

      const userData = await getUserData();

      for (const threshold of timeThresholds) {
        if (timeOnPage >= threshold && !metricsRef.current.timeEventsSent.has(threshold)) {
          console.log(`⏱️ Enviando evento time_on_page_${threshold}s`);
          
          await eventManager.sendTimeOnPage(threshold, userData);
          metricsRef.current.timeEventsSent.add(threshold);

          // Se ficou mais de 60s na página, considerar alto engajamento
          if (threshold === 60) {
            await eventManager.sendHighEngagement(userData);
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  // Monitorar cliques em elementos importantes
  useEffect(() => {
    if (!isActive) return;

    const handleClick = async (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      metricsRef.current.clicks++;

      const userData = await getUserData();

      // Detectar clique em botões de compra
      if (target.closest('button') || target.closest('a')) {
        const element = target.closest('button') || target.closest('a');
        const buttonText = element?.textContent?.trim() || '';
        const classes = element?.className || '';
        const id = element?.id || '';

        // Verificar se é botão de compra
        const isBuyButton = 
          buttonText.toLowerCase().includes('comprar') ||
          buttonText.toLowerCase().includes('checkout') ||
          buttonText.toLowerCase().includes('agora') ||
          classes.toLowerCase().includes('btn-comprar') ||
          classes.toLowerCase().includes('btn-checkout') ||
          id.toLowerCase().includes('btn-comprar') ||
          id.toLowerCase().includes('btn-checkout');

        if (isBuyButton) {
          console.log(`🛒 Enviando evento click_buy_button: ${buttonText}`);
          await eventManager.sendClickBuyButton(buttonText, userData);
        }

        // Verificar se é link do WhatsApp
        const isWhatsApp = 
          element?.getAttribute('href')?.includes('whatsapp') ||
          element?.getAttribute('href')?.includes('wa.me') ||
          classes.toLowerCase().includes('whatsapp') ||
          classes.toLowerCase().includes('btn-whatsapp');

        if (isWhatsApp) {
          const linkUrl = element?.getAttribute('href') || '';
          console.log(`📱 Enviando evento click_whatsapp: ${linkUrl}`);
          await eventManager.sendClickWhatsApp(linkUrl, userData);
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isActive]);

  // Monitorar interações com formulários
  useEffect(() => {
    if (!isActive) return;

    const handleFormInteraction = async (event: Event) => {
      const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      
      if (target.form || target.tagName === 'FORM') {
        metricsRef.current.formInteractions++;
        const userData = await getUserData();

        const formData = {
          field_name: target.name || '',
          field_type: target.type || target.tagName.toLowerCase(),
          field_value: target.value ? 'filled' : 'empty'
        };

        console.log('📝 Enviando evento form_interaction');
        await eventManager.sendFormInteraction(formData, userData);
      }
    };

    const handleEmailFocus = async (event: FocusEvent) => {
      const target = event.target as HTMLInputElement;
      
      if (target.type === 'email' || target.name?.toLowerCase().includes('email')) {
        const userData = await getUserData();
        console.log('📧 Enviando evento email_focus');
        await eventManager.sendEmailFocus(userData);
      }
    };

    // Monitorar inputs e textareas
    document.addEventListener('input', handleFormInteraction);
    document.addEventListener('change', handleFormInteraction);
    document.addEventListener('focus', handleEmailFocus, true);

    return () => {
      document.removeEventListener('input', handleFormInteraction);
      document.removeEventListener('change', handleFormInteraction);
      document.removeEventListener('focus', handleEmailFocus, true);
    };
  }, [isActive]);

  // Monitorar visibilidade da página
  useEffect(() => {
    if (!isActive) return;

    const handleVisibilityChange = async () => {
      const userData = await getUserData();

      if (document.visibilityState === 'visible') {
        console.log('👁️ Página visível');
        await eventManager.sendPageVisible(userData);
      } else if (document.visibilityState === 'hidden') {
        console.log('👋 Página oculta');
        await eventManager.sendPageExit(userData);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isActive]);

  // Monitorar saida da página
  useEffect(() => {
    if (!isActive) return;

    const handleBeforeUnload = async () => {
      const userData = await getUserData();
      
      // Enviar evento de saída com métricas finais
      const finalMetrics = {
        scroll_depth: metricsRef.current.scrollDepth,
        time_on_page: metricsRef.current.timeOnPage,
        total_clicks: metricsRef.current.clicks,
        form_interactions: metricsRef.current.formInteractions
      };

      console.log('🚪 Enviando evento page_exit com métricas finais:', finalMetrics);
      await eventManager.sendPageExit({
        ...userData,
        ...finalMetrics
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isActive]);

  // Expor funções de controle globalmente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).engagementTracker = {
        getMetrics: () => ({
          scrollDepth: metricsRef.current.scrollDepth,
          timeOnPage: metricsRef.current.timeOnPage,
          clicks: metricsRef.current.clicks,
          formInteractions: metricsRef.current.formInteractions
        }),
        pause: () => setIsActive(false),
        resume: () => setIsActive(true),
        sendCustomEvent: async (eventName: string, data: any) => {
          const userData = await getUserData();
          return eventManager.sendEvent(eventName, { ...data, user_data: userData });
        },
        forceHighEngagement: async () => {
          const userData = await getUserData();
          return eventManager.sendHighEngagement(userData);
        }
      };
    }
  }, []);

  // Log de inicialização
  useEffect(() => {
    console.log('🎯 EngagementTracker inicializado e ativo');
    console.log('📊 Monitorando eventos de engajamento avançados...');
    
    return () => {
      console.log('🛑 EngagementTracker desmontado');
    };
  }, []);

  return null; // Componente invisível
}