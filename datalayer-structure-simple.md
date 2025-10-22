# 📋 Estrutura Simplificada do DataLayer - 4 Eventos Essenciais

## 🎯 **Apenas 4 Eventos Padronizados**

---

## 🏗️ **Estrutura Base do DataLayer**

### **Eventos OBRIGATÓRIOS (Apenas estes 4)**
```javascript
{
  event: 'page_view',           // ✅ Página carregada
  event: 'view_content',        // ✅ Visualizou conteúdo/produto
  event: 'lead',               // ✅ Formulário enviado
  event: 'initiate_checkout',   // ✅ Iniciou checkout
}
```

---

## 📦 **Estrutura Completa dos 4 Eventos**

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

### **VIEW_CONTENT (Visualizou produto/conteúdo)**
```javascript
window.dataLayer.push({
  event: 'view_content',
  event_id: 'vc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
  user_data: {
    sha256_email_address: 'hash_do_email_aqui', // se disponível
    sha256_phone_number: 'hash_do_telefone_aqui' // se disponível
  },
  content_data: {
    content_type: 'product', // product, service, article
    content_ids: ['PROD_001'], // array de IDs
    content_name: 'Nome do Produto/Serviço',
    category: 'Categoria',
    value: 199.90,
    currency: 'BRL'
  }
});
```

### **LEAD (Formulário de contato/orçamento)**
```javascript
window.dataLayer.push({
  event: 'lead',
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

### **INITIATE_CHECKOUT (Iniciou checkout)**
```javascript
window.dataLayer.push({
  event: 'initiate_checkout',
  event_id: 'checkout_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
  user_data: {
    sha256_email_address: 'hash_do_email_aqui',
    sha256_phone_number: 'hash_do_telefone_aqui'
  },
  checkout_data: {
    content_ids: ['PROD_001', 'PROD_002'],
    content_type: 'product',
    num_items: 2,
    value: 399.80,
    currency: 'BRL'
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

## 📊 **Mapeamento Evento → Plataforma**

| Evento | GA4 | Facebook | Server GTM |
|--------|-----|----------|------------|
| page_view | ✅ page_view | ✅ PageView | ✅ |
| view_content | ✅ view_item | ✅ ViewContent | ✅ |
| lead | ✅ generate_lead | ✅ Lead | ✅ |
| initiate_checkout | ✅ begin_checkout | ✅ InitiateCheckout | ✅ |

---

## 🎯 **Implementação Prática**

### **Page View Automático**
```javascript
// Adicionar em todas as páginas
document.addEventListener('DOMContentLoaded', function() {
  pushToDataLayer({
    event: 'page_view',
    page_location: window.location.href,
    page_title: document.title,
    page_referrer: document.referrer
  });
});
```

### **View Content (Página de produto/serviço)**
```javascript
// Quando usuário visualizar produto/serviço
pushToDataLayer({
  event: 'view_content',
  content_data: {
    content_type: 'product',
    content_ids: ['PROD_001'],
    content_name: 'Nome do Produto',
    category: 'Categoria',
    value: 199.90,
    currency: 'BRL'
  }
});
```

### **Lead (Formulário enviado)**
```javascript
// Quando formulário for enviado
document.getElementById('contact-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const name = document.getElementById('name').value;
  
  pushToDataLayer({
    event: 'lead',
    user_data: {
      sha256_email_address: await sha256(email),
      sha256_phone_number: await sha256(phone),
      first_name: await sha256(name),
      new_customer: true
    },
    lead_data: {
      form_id: 'contact_form',
      form_name: 'Formulário de Contato'
    },
    value: 0.00,
    currency: 'BRL'
  });
  
  // Enviar formulário
  this.submit();
});
```

### **Initiate Checkout (Botão de comprar)**
```javascript
// Quando clicar em comprar/checkout
document.getElementById('buy-button').addEventListener('click', function() {
  pushToDataLayer({
    event: 'initiate_checkout',
    user_data: {
      sha256_email_address: 'hash_do_email_logado',
      sha256_phone_number: 'hash_do_telefone_logado'
    },
    checkout_data: {
      content_ids: ['PROD_001'],
      content_type: 'product',
      num_items: 1,
      value: 199.90,
      currency: 'BRL'
    }
  });
});
```

---

## 🚨 **Regras OBRIGATÓRIAS**

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

### **4. SEMPRE usar currency: 'BRL'**
- Padrão brasileiro

### **5. NUNCA enviar dados PII sem hash**
- Email, telefone, nome SEMPRE hashados

---

## ✅ **Checklist Final**

### **Eventos Implementados:**
- [ ] page_view em todas as páginas
- [ ] view_content em páginas de produtos/serviços
- [ ] lead em formulários de contato
- [ ] initiate_checkout em botões de compra

### **Validação:**
- [ ] Event ID único em todos
- [ ] Dados hash implementados
- [ ] Valores monetários corretos
- [ ] Currency BRL padronizado

**Simplificado e focado no que realmente importa! 🎯**