'use client';

import { useEffect, useState, useCallback } from 'react';

interface EventData {
  eventName: string;
  eventId: string;
  eventTime: number;
  value?: number;
  currency?: string;
  content_ids?: string[];
  content_type?: string;
  content_name?: string;
  content_category?: string;
  user_data?: any;
  custom_data?: any;
  transaction_id?: string;
  payment_method?: string;
  num_items?: number;
  [key: string]: any;
}

interface MetaEventTrackerProps {
  pixelId?: string;
  autoTrack?: boolean;
}

export const MetaEventTracker: React.FC<MetaEventTrackerProps> = ({
  pixelId,
  autoTrack = true
}) => {
  const [sessionId, setSessionId] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

  // 生成事件ID
  const generateEventId = (eventName: string): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${eventName}_${timestamp}_${random}`;
  };

  // 生成会话ID
  const generateSessionId = (): string => {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // 收集客户端信息
  const collectClientInfo = () => {
    return {
      device_type: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
      screen_width: window.screen.width,
      screen_height: window.screen.height,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      pixel_ratio: window.devicePixelRatio || 1,
      browser: getBrowserName(),
      operating_system: getOperatingSystem(),
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      connection_type: (navigator as any).connection?.effectiveType || 'unknown',
      user_agent: navigator.userAgent
    };
  };

  // 获取浏览器名称
  const getBrowserName = (): string => {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'chrome';
    if (ua.includes('Firefox')) return 'firefox';
    if (ua.includes('Safari')) return 'safari';
    if (ua.includes('Edge')) return 'edge';
    return 'unknown';
  };

  // 获取操作系统
  const getOperatingSystem = (): string => {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'windows';
    if (ua.includes('Mac')) return 'macos';
    if (ua.includes('Linux')) return 'linux';
    if (ua.includes('Android')) return 'android';
    if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'ios';
    return 'unknown';
  };

  // 收集页面性能数据
  const collectPerformanceData = () => {
    if (typeof window === 'undefined' || !window.performance) return {};
    
    const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      page_load_time: navigation.loadEventEnd - navigation.fetchStart,
      dom_content_loaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
      first_contentful_paint: navigation.responseEnd - navigation.fetchStart,
      session_start_time: Date.now(),
      page_number: 1,
      user_journey_stage: 'purchase'
    };
  };

  // 收集UTM参数
  const collectUTMParameters = () => {
    if (typeof window === 'undefined') return {};
    
    const urlParams = new URLSearchParams(window.location.search);
    return {
      utm_source: urlParams.get('utm_source') || 'unknown',
      utm_medium: urlParams.get('utm_medium') || 'unknown',
      utm_campaign: urlParams.get('utm_campaign') || 'unknown',
      utm_term: urlParams.get('utm_term') || 'unknown',
      utm_content: urlParams.get('utm_content') || 'unknown'
    };
  };

  // 哈希函数
  const hashData = (data: string): string => {
    return btoa(data).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  };

  // 收集用户数据
  const collectUserData = (userData?: any) => {
    const defaultUserData = {
      client_ip_address: '', // 需要从服务器获取
      client_user_agent: navigator.userAgent,
      client_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    if (userData) {
      // 哈希敏感数据
      const hashedUserData = { ...defaultUserData };
      if (userData.email) {
        hashedUserData.em = hashData(userData.email.toLowerCase().trim());
      }
      if (userData.phone) {
        hashedUserData.ph = hashData(userData.phone.replace(/\D/g, ''));
      }
      if (userData.firstName) {
        hashedUserData.fn = hashData(userData.firstName.toLowerCase().trim());
      }
      if (userData.lastName) {
        hashedUserData.ln = hashData(userData.lastName.toLowerCase().trim());
      }
      if (userData.city) {
        hashedUserData.ct = hashData(userData.city.toLowerCase().trim());
      }
      if (userData.state) {
        hashedUserData.st = hashData(userData.state.toLowerCase().trim());
      }
      if (userData.zip) {
        hashedUserData.zip = hashData(userData.zip.replace(/\D/g, ''));
      }
      if (userData.country) {
        hashedUserData.country = hashData(userData.country.toLowerCase().trim());
      }
      if (userData.externalId) {
        hashedUserData.external_id = userData.externalId;
      }
      
      return hashedUserData;
    }

    return defaultUserData;
  };

  // 发送事件到统一API
  const sendEventToUnifyAPI = async (eventType: string, eventData: EventData) => {
    try {
      const response = await fetch('/api/events/unify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType,
          eventData,
          sessionId
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ ${eventType} event processed successfully:`, result);
        
        // 如果是 InitiateCheckout，保存会话ID
        if (eventType === 'InitiateCheckout' && result.sessionId) {
          setSessionId(result.sessionId);
          localStorage.setItem('meta_session_id', result.sessionId);
        }
        
        // 如果是 Purchase 且有统一数据，发送到 Meta
        if (eventType === 'Purchase' && result.unifiedEventData) {
          await sendToMetaAPI(result.unifiedEventData);
        }
      } else {
        console.error(`❌ Failed to process ${eventType} event:`, result.error);
      }
    } catch (error) {
      console.error(`❌ Error sending ${eventType} event:`, error);
    }
  };

  // 发送到 Meta Conversions API
  const sendToMetaAPI = async (eventData: EventData) => {
    try {
      const response = await fetch('/api/meta-conversions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventName: eventData.eventName,
          eventId: eventData.eventId,
          eventTime: eventData.eventTime,
          value: eventData.value,
          currency: eventData.currency,
          content_ids: eventData.content_ids,
          content_type: eventData.content_type,
          content_name: eventData.content_name,
          content_category: eventData.content_category,
          user_data: eventData.user_data,
          custom_data: eventData.custom_data,
          transaction_id: eventData.transaction_id,
          payment_method: eventData.payment_method,
          num_items: eventData.num_items,
          event_source_url: eventData.event_source_url,
          action_source: eventData.action_source
        })
      });

      const result = await response.json();
      console.log('📊 Meta API response:', result);
    } catch (error) {
      console.error('❌ Error sending to Meta API:', error);
    }
  };

  // 跟踪 InitiateCheckout 事件
  const trackInitiateCheckout = useCallback(async (data: {
    value: number;
    currency: string;
    content_ids: string[];
    content_name?: string;
    content_category?: string;
    user_data?: any;
    custom_data?: any;
  }) => {
    const eventId = generateEventId('InitiateCheckout');
    const eventTime = Math.floor(Date.now() / 1000);

    const eventData: EventData = {
      eventName: 'InitiateCheckout',
      eventId,
      eventTime,
      value: data.value,
      currency: data.currency,
      content_ids: data.content_ids,
      content_type: 'product',
      content_name: data.content_name,
      content_category: data.content_category,
      user_data: collectUserData(data.user_data),
      custom_data: {
        ...data.custom_data,
        checkout_step: 1,
        ...collectUTMParameters(),
        ...collectPerformanceData(),
        ...collectClientInfo()
      },
      event_source_url: window.location.href,
      action_source: 'website',
      content_language: 'pt-BR',
      market: 'BR',
      platform: 'web'
    };

    await sendEventToUnifyAPI('InitiateCheckout', eventData);
  }, [sessionId]);

  // 跟踪 Purchase 事件
  const trackPurchase = useCallback(async (data: {
    value: number;
    currency: string;
    content_ids: string[];
    transaction_id: string;
    payment_method: string;
    content_name?: string;
    content_category?: string;
    num_items?: number;
    user_data?: any;
    custom_data?: any;
  }) => {
    const eventId = generateEventId('Purchase');
    const eventTime = Math.floor(Date.now() / 1000);

    const eventData: EventData = {
      eventName: 'Purchase',
      eventId,
      eventTime,
      value: data.value,
      currency: data.currency,
      content_ids: data.content_ids,
      content_type: 'product',
      content_name: data.content_name,
      content_category: data.content_category,
      transaction_id: data.transaction_id,
      payment_method: data.payment_method,
      num_items: data.num_items || 1,
      user_data: collectUserData(data.user_data),
      custom_data: {
        ...data.custom_data,
        checkout_step: 'completed',
        purchase_completed: true
      },
      event_source_url: window.location.href,
      action_source: 'website',
      content_language: 'pt-BR',
      market: 'BR',
      platform: 'web'
    };

    await sendEventToUnifyAPI('Purchase', eventData);
  }, [sessionId]);

  // 初始化
  useEffect(() => {
    // 检查是否有现有的会话ID
    const existingSessionId = localStorage.getItem('meta_session_id');
    if (existingSessionId) {
      setSessionId(existingSessionId);
    } else {
      const newSessionId = generateSessionId();
      setSessionId(newSessionId);
      localStorage.setItem('meta_session_id', newSessionId);
    }
    
    setIsInitialized(true);
  }, []);

  // 暴露方法给外部使用
  useEffect(() => {
    if (isInitialized) {
      // 将方法绑定到 window 对象，方便外部调用
      (window as any).metaEventTracker = {
        trackInitiateCheckout,
        trackPurchase,
        getSessionId: () => sessionId
      };
    }
  }, [isInitialized, trackInitiateCheckout, trackPurchase, sessionId]);

  return (
    <div className="hidden">
      {/* 这个组件是功能性的，不需要渲染任何UI */}
      {isInitialized && (
        <div data-testid="meta-event-tracker" data-session-id={sessionId} />
      )}
    </div>
  );
};

// 导出钩子函数
export const useMetaEventTracker = () => {
  const trackInitiateCheckout = async (data: {
    value: number;
    currency: string;
    content_ids: string[];
    content_name?: string;
    content_category?: string;
    user_data?: any;
    custom_data?: any;
  }) => {
    if ((window as any).metaEventTracker) {
      return (window as any).metaEventTracker.trackInitiateCheckout(data);
    }
    console.warn('MetaEventTracker not initialized');
  };

  const trackPurchase = async (data: {
    value: number;
    currency: string;
    content_ids: string[];
    transaction_id: string;
    payment_method: string;
    content_name?: string;
    content_category?: string;
    num_items?: number;
    user_data?: any;
    custom_data?: any;
  }) => {
    if ((window as any).metaEventTracker) {
      return (window as any).metaEventTracker.trackPurchase(data);
    }
    console.warn('MetaEventTracker not initialized');
  };

  const getSessionId = () => {
    if ((window as any).metaEventTracker) {
      return (window as any).metaEventTracker.getSessionId();
    }
    return null;
  };

  return {
    trackInitiateCheckout,
    trackPurchase,
    getSessionId
  };
};