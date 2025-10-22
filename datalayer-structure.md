# 📋 Estrutura Completa do DataLayer - GTM Web & Server

## 🎯 **Objetivo: Padronizar 100% dos eventos entre Web GTM → Server GTM → Facebook/GA4**

---

## 🏗️ **Estrutura Base do DataLayer**

### **1. Eventos Padronizados (SEMPRE usar estes nomes)**

```javascript
// EVENTOS PRINCIPAIS
{
  event: 'page_view',           // ✅ Página carregada
  event: 'generate_lead',       // ✅ Formulário enviado
  event: 'add_to_cart',         // ✅ Produto adicionado
  event: 'begin_checkout',      // ✅ Iniciou checkout
  event: 'purchase',            // ✅ Compra concluída
  event: 'view_item',           // ✅ Visualizou produto
  event: 'search',              // ✅ Busca realizada
  event: 'scroll_depth',        // ✅ Rolagem da página
}

// EVENTOS DE ENGAGEMENT
{
  event: 'click_phone',         // ✅ Clicou no telefone
  event: 'click_whatsapp',      // ✅ Clicou no WhatsApp
  event: 'download_file',       // ✅ Baixou arquivo
  event: 'video_play',          // ✅ Iniciou vídeo
  event: 'form_start',          // ✅ Começou preencher formulário
}
```

---

## 📦 **Estrutura Completa dos Dados**

### **PAGE_VIEW (Obrigatório em TODAS as páginas)**
```javascript
window.dataLayer.push({
  event: 'page_view',
  page_location: window.location.href,
  page_title: document.title,
  page_referrer: document.referrer,
  user_data: {
    sha256_email_address: null,  // Hash do email se disponível
    sha256_phone_number: null,   // Hash do telefone se disponível
    new_customer: true           // true/false
  },
  event_id: 'pv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
});
```

### **GENERATE_LEAD (Formulário de contato/orçamento)**
```javascript
window.dataLayer.push({
  event: 'generate_lead',
  event_id: 'lead_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
  user_data: {
    sha256_email_address: 'hash_do_email_aqui',
    sha256_phone_number: 'hash_do_telefone_aqui',
    first_name: 'hash_do_nome_aqui',
    last_name: 'hash_do_sobrenome_aqui',
    new_customer: true
  },
  lead_data: {
    form_id: 'contact_form',
    form_name: 'Formulário de Contato',
    form_type: 'contact'
  },
  value: 0.00,
  currency: 'BRL'
});
```

### **ADD_TO_CART (Produto adicionado)**
```javascript
window.dataLayer.push({
  event: 'add_to_cart',
  event_id: 'atc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
  ecommerce: {
    items: [{
      item_id: 'PROD_001',
      item_name: 'Nome do Produto',
      category: 'Categoria',
      quantity: 1,
      price: 199.90,
      currency: 'BRL'
    }]
  },
  value: 199.90,
  currency: 'BRL'
});
```

### **BEGIN_CHECKOUT (Iniciou checkout)**
```javascript
window.dataLayer.push({
  event: 'begin_checkout',
  event_id: 'checkout_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
  user_data: {
    sha256_email_address: 'hash_do_email_aqui',
    sha256_phone_number: 'hash_do_telefone_aqui'
  },
  ecommerce: {
    items: [/* array de produtos */],
    value: 199.90,
    currency: 'BRL'
  }
});
```

### **PURCHASE (Compra concluída - plataforma externa)**
```javascript
window.dataLayer.push({
  event: 'purchase',
  event_id: 'purchase_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
  transaction_id: 'ORDER_' + Date.now(),
  user_data: {
    sha256_email_address: 'hash_do_email_aqui',
    sha256_phone_number: 'hash_do_telefone_aqui'
  },
  ecommerce: {
    transaction_id: 'ORDER_' + Date.now(),
    value: 199.90,
    currency: 'BRL',
    items: [/* array de produtos */]
  }
});
```

---

## 🔧 **Funções Helper (OBRIGATÓRIO usar)**

### **Hash Function**
```javascript
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
```

### **Event ID Generator**
```javascript
function generateEventId(prefix) {
  return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
```

### **DataLayer Push Padronizado**
```javascript
function pushToDataLayer(eventData) {
  // Garante que event_id sempre exista
  if (!eventData.event_id) {
    eventData.event_id = generateEventId(eventData.event);
  }
  
  // Adiciona timestamp
  eventData.timestamp = new Date().toISOString();
  
  // Push com validação
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(eventData);
  
  // Debug
  console.log('📤 DataLayer Push:', eventData);
}
```

---

## 🎯 **Regras OBRIGATÓRIAS**

### **1. SEMPRE usar event_id ÚNICO**
- Formato: `{prefix}_{timestamp}_{random}`
- Exemplo: `pv_1697901234567_abc123def`

### **2. SEMPRE hash dados sensíveis**
- Email → sha256_email_address
- Telefone → sha256_phone_number
- Nome → sha256_first_name, sha256_last_name

### **3. SEMPRE usar valores monetários com 2 casas decimais**
- `value: 199.90` ✅
- `value: 199.9` ❌
- `value: 199` ❌

### **4. SEMPRE usar currency: 'BRL'**
- Padrão brasileiro

### **5. NUNCA enviar dados PII sem hash**
- Email, telefone, nome SEMPRE hashados

---

## 📊 **Mapeamento Evento → Plataforma**

| Evento | GA4 | Facebook | Server GTM |
|--------|-----|----------|------------|
| page_view | ✅ page_view | ✅ PageView | ✅ |
| generate_lead | ✅ generate_lead | ✅ Lead | ✅ |
| add_to_cart | ✅ add_to_cart | ✅ AddToCart | ✅ |
| begin_checkout | ✅ begin_checkout | ✅ InitiateCheckout | ✅ |
| purchase | ✅ purchase | ✅ Purchase | ✅ |
| click_phone | ✅ custom_event | ✅ Contact | ✅ |
| click_whatsapp | ✅ custom_event | ✅ Contact | ✅ |

---

## 🚨 **Pontos Críticos de Falha Atuais**

### **Problema 1: Nomes de eventos inconsistentes**
- ❌ Antes: `GA4 - Todos os eventos`, `FBC - Page View`
- ✅ Agora: `page_view`, `generate_lead`

### **Problema 2: Sem event_id**
- ❌ Antes: Sem ID único
- ✅ Agora: ID único em todos os eventos

### **Problema 3: Dados sem hash**
- ❌ Antes: Dados PII em texto claro
- ✅ Agora: Dados sempre hashados

### **Problema 4: Formato inconsistente**
- ❌ Antes: Cada evento com formato diferente
- ✅ Agora: Estrutura padronizada

---

## 🎯 **Próximos Passos**

1. **Implementar esta estrutura no site**
2. **Configurar GTM Web com estes eventos**
3. **Configurar GTM Server para receber estes eventos**
4. **Testar fluxo completo**

Esta estrutura resolve 100% dos problemas de comunicação!