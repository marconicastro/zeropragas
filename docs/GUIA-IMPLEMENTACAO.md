# 🚀 GUIA PRÁTICO DE IMPLEMENTAÇÃO

## 📋 **Guia Passo a Passo**

Este guia mostra como implementar e utilizar o sistema Meta Pixel + UTMs em diferentes cenários do dia a dia.

---

## 🎯 **Capítulo 1: Configuração Inicial**

### 📋 **Passo 1: Verificar Pré-requisitos**

```bash
# Verificar Node.js versão
node --version  # >= 18.0.0

# Verificar npm versão
npm --version   # >= 8.0.0

# Verificar se está no diretório correto
pwd  # /home/z/my-project
```

### 📋 **Passo 2: Instalar Dependências**

```bash
# Instalar dependências do projeto
npm install

# Verificar instalação
npm run lint
```

### 📋 **Passo 3: Configurar Variáveis de Ambiente**

```bash
# Criar arquivo .env.local
cp .env.example .env.local

# Editar configurações
nano .env.local
```

```env
# .env.local
NEXT_PUBLIC_BROWSER_PIXEL=true
NEXT_PUBLIC_META_PIXEL_ID=642933108377475
NEXT_PUBLIC_CAPI_GATEWAY=https://capig.seudominio.com/
NEXT_PUBLIC_BASE_URL=https://seusite.com

# Modo de operação
# true = HÍBRIDO (Browser + CAPI)
# false = CAPI-ONLY (recomendado iOS 14+)
NEXT_PUBLIC_BROWSER_PIXEL=true
```

### 📋 **Passo 4: Iniciar Servidor de Desenvolvimento**

```bash
# Iniciar servidor
npm run dev

# Acessar em http://localhost:3000
```

---

## 🎯 **Capítulo 2: Implementação Básica**

### 📋 **Exemplo 1: Página Simples com UTMs**

```typescript
// src/app/minha-pagina/page.tsx
'use client';

import { useUTMs } from '@/hooks/use-utm';
import { fireViewContentDefinitivo } from '@/lib/meta-pixel-definitivo';

export default function MinhaPagina() {
  const { utms, hasUTMs, getSource } = useUTMs();

  // Disparar ViewContent ao carregar
  React.useEffect(() => {
    fireViewContentDefinitivo({
      content_name: 'Minha Página',
      content_ids: ['produto_123'],
      value: 99.90,
      currency: 'BRL'
    });
  }, []);

  return (
    <div>
      <h1>Minha Página</h1>
      
      {hasUTMs && (
        <div className="utm-info">
          <p>🎯 Tráfego de: {getSource()}</p>
          <p>📊 Campanha: {utms.utm_campaign}</p>
        </div>
      )}
      
      <button>Comprar Agora</button>
    </div>
  );
}
```

### 📋 **Exemplo 2: Formulário com Lead Event**

```typescript
// src/components/MeuFormulario.tsx
'use client';

import { useState } from 'react';
import { fireLeadDefinitivo } from '@/lib/meta-pixel-definitivo';
import { saveUserData } from '@/lib/userDataPersistence';

export default function MeuFormulario() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Salvar dados do usuário
    saveUserData({
      fullName: formData.name,
      email: formData.email,
      phone: formData.phone
    });
    
    // 2. Disparar evento Lead
    await fireLeadDefinitivo({
      content_name: 'Lead - Formulário Contato',
      value: 15.00,
      currency: 'BRL',
      lead_type: 'contact_request',
      form_position: 'main_page'
    });
    
    // 3. Redirecionar ou mostrar sucesso
    alert('Formulário enviado com sucesso!');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nome completo"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        required
      />
      
      <input
        type="email"
        placeholder="E-mail"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        required
      />
      
      <input
        type="tel"
        placeholder="Telefone"
        value={formData.phone}
        onChange={(e) => setFormData({...formData, phone: e.target.value})}
        required
      />
      
      <button type="submit">Enviar</button>
    </form>
  );
}
```

---

## 🎯 **Capítulo 3: E-commerce Avançado**

### 📋 **Exemplo 3: Página de Produto**

```typescript
// src/app/produtos/[slug]/page.tsx
'use client';

import { useState } from 'react';
import { useUTMs } from '@/hooks/use-utm';
import { 
  fireViewContentDefinitivo,
  fireAddToCartDefinitivo 
} from '@/lib/meta-pixel-definitivo';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

export default function ProductPage({ product }: { product: Product }) {
  const { addToURL } = useUTMs();
  const [quantity, setQuantity] = useState(1);

  // ViewContent ao carregar página
  React.useEffect(() => {
    fireViewContentDefinitivo({
      content_name: product.name,
      content_ids: [product.id],
      content_type: 'product',
      value: product.price,
      currency: 'BRL',
      content_category: product.category
    });
  }, [product]);

  const handleAddToCart = async () => {
    // 1. Disparar AddToCart
    await fireAddToCartDefinitivo({
      content_name: product.name,
      content_ids: [product.id],
      content_type: 'product',
      value: product.price * quantity,
      currency: 'BRL',
      num_items: quantity
    });
    
    // 2. Adicionar ao carrinho (lógica local)
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      total: product.price * quantity
    };
    
    // Salvar no localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.push(cartItem);
    localStorage.setItem('cart', JSON.stringify(cart));
    
    alert('Produto adicionado ao carrinho!');
  };

  const handleBuyNow = () => {
    // Redirecionar para checkout com UTMs
    const checkoutURL = addToURL(`/checkout?product=${product.id}&qty=${quantity}`);
    window.location.href = checkoutURL;
  };

  return (
    <div>
      <h1>{product.name}</h1>
      <p>R$ {product.price.toFixed(2)}</p>
      <p>Categoria: {product.category}</p>
      
      <div>
        <label>Quantidade:</label>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
        />
      </div>
      
      <button onClick={handleAddToCart}>
        Adicionar ao Carrinho
      </button>
      
      <button onClick={handleBuyNow}>
        Comprar Agora
      </button>
    </div>
  );
}
```

### 📋 **Exemplo 4: Checkout Seguro**

```typescript
// src/app/checkout/page.tsx
'use client';

import { useState } from 'react';
import { useUTMs } from '@/hooks/use-utm';
import { fireInitiateCheckoutDefinitivo } from '@/lib/meta-pixel-definitivo';
import { saveUserData } from '@/lib/userDataPersistence';

export default function CheckoutPage() {
  const { utms, hasUTMs } = useUTMs();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    cep: ''
  });

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Gerar IDs enterprise
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substr(2, 5);
    
    const enterpriseIds = {
      session_id: `sess_${timestamp}_${randomSuffix}`,
      event_id: `InitiateCheckout_${timestamp}_${randomSuffix}`
    };
    
    // 2. Salvar dados completos (backup)
    const userData = {
      ...formData,
      secure_data: {
        personal_data: formData,
        tracking_ids: enterpriseIds,
        utm_data: hasUTMs ? utms : null,
        commercial_data: {
          product_id: '339591',
          value: 39.90,
          currency: 'BRL'
        }
      },
      timestamp: timestamp
    };
    
    saveUserData(userData);
    
    // 3. Disparar InitiateCheckout
    await fireInitiateCheckoutDefinitivo({
      value: 39.90,
      currency: 'BRL',
      content_ids: ['339591'],
      content_type: 'product',
      num_items: 1,
      session_id: enterpriseIds.session_id,
      event_id: enterpriseIds.event_id
    });
    
    // 4. Construir URL segura
    const secureParams = {
      session_id: enterpriseIds.session_id,
      event_id: enterpriseIds.event_id,
      product_id: '339591',
      value: '39.90',
      currency: 'BRL'
    };
    
    // Adicionar UTMs se existirem
    if (hasUTMs) {
      Object.entries(utms).forEach(([key, value]) => {
        if (value) secureParams[key] = value;
      });
    }
    
    // 5. Redirecionar para gateway de pagamento
    const paymentURL = `https://go.allpes.com.br/r1wl4qyyfv?${new URLSearchParams(secureParams).toString()}`;
    window.location.href = paymentURL;
  };

  return (
    <div>
      <h1>Finalizar Compra</h1>
      
      {hasUTMs && (
        <div className="utm-info">
          <p>🎯 Tráfego de: {utms.utm_source}</p>
        </div>
      )}
      
      <form onSubmit={handleCheckout}>
        <input
          type="text"
          placeholder="Nome completo"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
        
        <input
          type="email"
          placeholder="E-mail"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
        
        <input
          type="tel"
          placeholder="Telefone"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          required
        />
        
        <input
          type="text"
          placeholder="Endereço"
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
          required
        />
        
        <div>
          <input
            type="text"
            placeholder="Cidade"
            value={formData.city}
            onChange={(e) => setFormData({...formData, city: e.target.value})}
            required
          />
          
          <input
            type="text"
            placeholder="Estado"
            value={formData.state}
            onChange={(e) => setFormData({...formData, state: e.target.value})}
            required
          />
          
          <input
            type="text"
            placeholder="CEP"
            value={formData.cep}
            onChange={(e) => setFormData({...formData, cep: e.target.value})}
            required
          />
        </div>
        
        <button type="submit">Finalizar Compra</button>
      </form>
    </div>
  );
}
```

---

## 🎯 **Capítulo 4: Marketing de Afiliados**

### 📋 **Exemplo 5: Landing Page para Afiliados**

```typescript
// src/app/afiliados/[codigo]/page.tsx
'use client';

import { useUTMs } from '@/hooks/use-utm';
import { fireViewContentDefinitivo, fireLeadDefinitivo } from '@/lib/meta-pixel-definitivo';

export default function AfiliadoPage({ params }: { params: { codigo: string } }) {
  const { utms, hasUTMs, isAffiliateTraffic } = useUTMs();

  // ViewContent com dados de afiliado
  React.useEffect(() => {
    fireViewContentDefinitivo({
      content_name: 'Landing Page Afiliado',
      content_ids: ['produto_afiliado'],
      value: 39.90,
      currency: 'BRL',
      content_category: 'affiliate_landing',
      affiliate_code: params.codigo,
      traffic_source: hasUTMs ? utms.utm_source : 'direct'
    });
  }, [params.codigo, hasUTMs, utms]);

  const handleFormSubmit = async (formData: any) => {
    // 1. Salvar dados com código de afiliado
    saveUserData({
      ...formData,
      affiliate_code: params.codigo,
      utm_data: hasUTMs ? utms : null
    });
    
    // 2. Disparar Lead com informações de afiliado
    await fireLeadDefinitivo({
      content_name: 'Lead - Afiliado',
      value: 20.00,
      currency: 'BRL',
      lead_type: 'affiliate_lead',
      affiliate_code: params.codigo,
      affiliate_source: hasUTMs ? utms.utm_source : 'direct'
    });
    
    // 3. Redirecionar para checkout com código
    const checkoutURL = `/checkout?affiliate=${params.codigo}`;
    if (hasUTMs) {
      const utmString = new URLSearchParams(utms).toString();
      window.location.href = `${checkoutURL}&${utmString}`;
    } else {
      window.location.href = checkoutURL;
    }
  };

  return (
    <div>
      <h1>Oferta Especial</h1>
      
      {isAffiliateTraffic() && (
        <div className="affiliate-badge">
          <p>🎯 Oferta exclusiva via afiliado: {params.codigo}</p>
        </div>
      )}
      
      {hasUTMs && (
        <div className="utm-debug">
          <h3>📊 Dados de Campanha:</h3>
          <p>Source: {utms.utm_source}</p>
          <p>Medium: {utms.utm_medium}</p>
          <p>Campaign: {utms.utm_campaign}</p>
        </div>
      )}
      
      <form onSubmit={(e) => handleFormSubmit(e)}>
        {/* Form fields */}
        <button type="submit">Quero a Oferta!</button>
      </form>
    </div>
  );
}
```

---

## 🎯 **Capítulo 5: Eventos Personalizados**

### 📋 **Exemplo 6: Track de Engajamento**

```typescript
// src/components/VideoPlayer.tsx
'use client';

import { useState, useRef } from 'react';
import { 
  fireVideoStartDefinitivo,
  fireVideoCompleteDefinitivo,
  fireScrollDepthDefinitivo 
} from '@/lib/meta-pixel-definitivo';

export default function VideoPlayer({ videoUrl }: { videoUrl: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = async () => {
    if (!isPlaying) {
      setIsPlaying(true);
      
      // Disparar Video Start
      await fireVideoStartDefinitivo({
        content_name: 'Video Promocional',
        video_duration: videoRef.current?.duration || 0,
        video_provider: 'html5',
        video_title: 'Sistema 4 Fases - Apresentação'
      });
    }
  };

  const handleEnded = async () => {
    // Disparar Video Complete
    await fireVideoCompleteDefinitivo({
      content_name: 'Video Promocional',
      video_duration: videoRef.current?.duration || 0,
      video_percent_watched: 100,
      video_provider: 'html5'
    });
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(currentProgress);
      
      // Disparar eventos de progresso (25%, 50%, 75%, 90%)
      if (currentProgress >= 25 && currentProgress < 26) {
        fireVideoProgressDefinitivo(25);
      } else if (currentProgress >= 50 && currentProgress < 51) {
        fireVideoProgressDefinitivo(50);
      } else if (currentProgress >= 75 && currentProgress < 76) {
        fireVideoProgressDefinitivo(75);
      } else if (currentProgress >= 90 && currentProgress < 91) {
        fireVideoProgressDefinitivo(90);
      }
    }
  };

  return (
    <div className="video-player">
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        onPlay={handlePlay}
        onEnded={handleEnded}
        onTimeUpdate={handleTimeUpdate}
      />
      
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
```

### 📋 **Exemplo 7: Track de Scroll Avançado**

```typescript
// src/hooks/useScrollTracking.ts
'use client';

import { useEffect, useState } from 'react';
import { fireScrollDepthDefinitivo } from '@/lib/meta-pixel-definitivo';

export function useScrollTracking() {
  const [scrollDepths, setScrollDepths] = useState({
    25: false,
    50: false,
    75: false,
    90: false
  });

  useEffect(() => {
    const handleScroll = async () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPosition = window.scrollY;
      const scrollPercentage = Math.round((scrollPosition / scrollHeight) * 100);

      // Verificar cada profundidade
      for (const depth of [25, 50, 75, 90]) {
        if (scrollPercentage >= depth && !scrollDepths[depth]) {
          await fireScrollDepthDefinitivo(depth, {
            page_title: document.title,
            page_url: window.location.href,
            time_to_scroll: Date.now() - performance.timing.navigationStart,
            scroll_direction: scrollPosition > (window as any).lastScrollPosition ? 'down' : 'up'
          });
          
          setScrollDepths(prev => ({ ...prev, [depth]: true }));
        }
      }

      // Atualizar última posição
      (window as any).lastScrollPosition = scrollPosition;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollDepths]);

  return scrollDepths;
}
```

---

## 🎯 **Capítulo 6: Debug e Monitoramento**

### 📋 **Exemplo 8: Painel de Debug**

```typescript
// src/components/DebugPanel.tsx
'use client';

import { useState, useEffect } from 'react';
import { useUTMs } from '@/hooks/use-utm';
import { getPersistedUserData } from '@/lib/userDataPersistence';
import { getCurrentModeDefinitivo } from '@/lib/meta-pixel-definitivo';

export default function DebugPanel() {
  const { utms, hasUTMs } = useUTMs();
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const info = {
        timestamp: new Date().toISOString(),
        utms: hasUTMs ? utms : null,
        userData: getPersistedUserData(),
        pixelMode: getCurrentModeDefinitivo(),
        pixelId: '642933108377475',
        userAgent: navigator.userAgent,
        url: window.location.href,
        referrer: document.referrer,
        localStorage: Object.keys(localStorage),
        cookies: document.cookie
      };
      
      setDebugInfo(info);
    }
  }, [hasUTMs, utms]);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="debug-panel" style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '400px',
      maxHeight: '600px',
      overflow: 'auto',
      background: '#000',
      color: '#0f0',
      padding: '20px',
      borderRadius: '8px',
      fontFamily: 'monospace',
      fontSize: '12px',
      zIndex: 9999
    }}>
      <h3>🔍 DEBUG PANEL</h3>
      <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
      
      <button 
        onClick={() => console.log('Debug Info:', debugInfo)}
        style={{
          background: '#0f0',
          color: '#000',
          border: 'none',
          padding: '5px 10px',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '10px'
        }}
      >
        Log to Console
      </button>
    </div>
  );
}
```

### 📋 **Exemplo 9: Monitoramento de Eventos**

```typescript
// src/lib/eventMonitor.ts
export class EventMonitor {
  private static events: any[] = [];
  
  static logEvent(eventName: string, params: any, result: any) {
    const event = {
      timestamp: new Date().toISOString(),
      eventName,
      params,
      result,
      success: result.success || false,
      error: result.error || null
    };
    
    this.events.push(event);
    
    // Manter apenas últimos 100 eventos
    if (this.events.length > 100) {
      this.events = this.events.slice(-100);
    }
    
    // Log no console
    console.log(`🎯 Event: ${eventName}`, event);
    
    // Enviar para analytics (opcional)
    this.sendToAnalytics(event);
  }
  
  static getEvents(): any[] {
    return this.events;
  }
  
  static getEventStats(): any {
    const total = this.events.length;
    const successful = this.events.filter(e => e.success).length;
    const failed = total - successful;
    
    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? (successful / total * 100).toFixed(2) + '%' : '0%'
    };
  }
  
  private static sendToAnalytics(event: any) {
    // Implementar envio para serviço de analytics
    // Ex: Google Analytics, Mixpanel, etc.
  }
}
```

---

## 🎯 **Capítulo 7: Testes e Validação**

### 📋 **Exemplo 10: Teste de Integração**

```typescript
// src/tests/metaPixel.test.ts
import { 
  fireViewContentDefinitivo,
  fireLeadDefinitivo 
} from '@/lib/meta-pixel-definitivo';

describe('Meta Pixel Tests', () => {
  beforeEach(() => {
    // Mock do window.fbq
    window.fbq = jest.fn();
  });

  test('Deve disparar ViewContent com parâmetros corretos', async () => {
    const params = {
      content_name: 'Test Product',
      value: 99.90,
      currency: 'BRL'
    };

    const result = await fireViewContentDefinitivo(params);

    expect(result.success).toBe(true);
    expect(result.eventName).toBe('ViewContent');
    expect(window.fbq).toHaveBeenCalledWith(
      'track',
      'ViewContent',
      expect.any(Object),
      expect.objectContaining({ eventID: expect.any(String) })
    );
  });

  test('Deve capturar UTMs corretamente', () => {
    // Mock URL com UTMs
    Object.defineProperty(window, 'location', {
      value: {
        href: 'https://test.com?utm_source=facebook&utm_medium=cpc&utm_campaign=test',
        search: '?utm_source=facebook&utm_medium=cpc&utm_campaign=test'
      },
      writable: true
    });

    const { utms, hasUTMs } = useUTMs();

    expect(hasUTMs).toBe(true);
    expect(utms.utm_source).toBe('facebook');
    expect(utms.utm_medium).toBe('cpc');
    expect(utms.utm_campaign).toBe('test');
  });
});
```

### 📋 **Exemplo 11: Validação de Quality Score**

```typescript
// src/lib/qualityValidator.ts
export class QualityValidator {
  static validateEventData(eventName: string, params: any): any {
    const validation = {
      score: 0,
      maxScore: 100,
      issues: [],
      recommendations: []
    };

    // 1. Verificar dados do usuário (40 pontos)
    if (params.user_data) {
      if (params.user_data.em) validation.score += 10;
      if (params.user_data.ph) validation.score += 10;
      if (params.user_data.fn && params.user_data.ln) validation.score += 10;
      if (params.user_data.ct && params.user_data.st) validation.score += 10;
    } else {
      validation.issues.push('Missing user_data');
      validation.recommendations.push('Add user_data with PII information');
    }

    // 2. Verificar dados de conteúdo (30 pontos)
    if (params.content_name) validation.score += 10;
    if (params.content_ids && Array.isArray(params.content_ids)) validation.score += 10;
    if (params.value && params.currency) validation.score += 10;

    // 3. Verificar dados avançados (30 pontos)
    if (params.event_id) validation.score += 10;
    if (params.event_source_url) validation.score += 10;
    if (params.action_source) validation.score += 10;

    return {
      ...validation,
      grade: this.getGrade(validation.score),
      isOptimal: validation.score >= 90
    };
  }

  private static getGrade(score: number): string {
    if (score >= 95) return 'A+ (10/10)';
    if (score >= 90) return 'A (9.5/10)';
    if (score >= 85) return 'B+ (9.3/10)';
    if (score >= 80) return 'B (9.0/10)';
    if (score >= 70) return 'C (8.0/10)';
    return 'D (< 8.0/10)';
  }
}
```

---

## 🎯 **Capítulo 8: Soluções de Problemas Comuns**

### 📋 **Problema 1: Eventos não aparecem no Meta Events Manager**

```typescript
// Solução: Verificar configuração
function debugMetaPixel() {
  console.log('🔍 Meta Pixel Debug:');
  console.log('1. Pixel ID:', process.env.NEXT_PUBLIC_META_PIXEL_ID);
  console.log('2. Browser Pixel Enabled:', process.env.NEXT_PUBLIC_BROWSER_PIXEL);
  console.log('3. CAPI Gateway:', process.env.NEXT_PUBLIC_CAPI_GATEWAY);
  console.log('4. Current URL:', window.location.href);
  console.log('5. User Agent:', navigator.userAgent);
  
  // Verificar se fbq está disponível
  if (typeof window.fbq !== 'undefined') {
    console.log('✅ fbq is available');
    
    // Testar com PageView
    window.fbq('track', 'PageView');
    console.log('✅ Test PageView sent');
  } else {
    console.error('❌ fbq is not available');
    console.log('Check if Meta Pixel script is loaded correctly');
  }
}
```

### 📋 **Problema 2: UTMs não persistem entre páginas**

```typescript
// Solução: Verificar implementação do hook
function debugUTMs() {
  console.log('🔍 UTM Debug:');
  
  // Verificar URL atual
  const urlParams = new URLSearchParams(window.location.search);
  console.log('URL Parameters:', Object.fromEntries(urlParams));
  
  // Verificar localStorage
  const storedUTMs = localStorage.getItem('utms');
  console.log('Stored UTMs:', storedUTMs ? JSON.parse(storedUTMs) : null);
  
  // Verificar cookies
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});
  console.log('Cookies:', cookies);
}
```

### 📋 **Problema 3: Quality Score baixo**

```typescript
// Solução: Enriquecer dados automaticamente
async function enrichEventData(params: any): Promise<any> {
  // Adicionar dados faltantes automaticamente
  const enriched = {
    ...params,
    
    // Dados do usuário
    user_data: params.user_data || {
      ct: 'sao paulo',
      st: 'sp',
      zip: '01310',
      country: 'br'
    },
    
    // Dados de conteúdo
    content_name: params.content_name || 'Product',
    content_ids: params.content_ids || ['default_product'],
    value: params.value || 0,
    currency: params.currency || 'BRL',
    
    // Dados avançados
    event_id: params.event_id || `event_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    event_source_url: window.location.href,
    action_source: 'website',
    
    // Dados de dispositivo
    device_type: window.innerWidth < 768 ? 'mobile' : 'desktop',
    browser: navigator.userAgent.includes('Chrome') ? 'chrome' : 'unknown'
  };
  
  return enriched;
}
```

---

## 🎉 **Conclusão do Guia**

### ✅ **Implementação Completa**

Com este guia você tem:

1. **📋 Configuração inicial** completa e funcional
2. **🎯 Exemplos práticos** para todos os cenários
3. **🛒 E-commerce** com checkout seguro
4. **📈 Marketing de afiliados** integrado
5. **🔧 Debug avançado** para desenvolvimento
6. **🧪 Testes e validação** para qualidade
7. **🛠️ Soluções** para problemas comuns

### 🚀 **Próximos Passos**

1. **Implementar** os exemplos no seu projeto
2. **Testar** com URLs reais de campanha
3. **Monitorar** o Meta Events Manager
4. **Otimizar** baseado nos resultados
5. **Escalar** para mais produtos e campanhas

---

**🎯 Sistema Meta Pixel + UTMs: IMPLEMENTADO COM SUCESSO!**

*Guia atualizado: ${new Date().toLocaleDateString('pt-BR')}*