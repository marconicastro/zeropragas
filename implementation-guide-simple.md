# 🚀 **Guia de Implementação - 4 Eventos Essenciais**

## 🎯 **Simplificado: Apenas 4 Eventos para 100% de Funcionalidade**

---

## 📋 **PASSO 0: Preparação**

### **O que você precisa:**
- ✅ Container Web GTM: GTM-WPDKD23S
- ✅ Container Server GTM: GTM-PVHVLNR9
- ✅ Domínio customizado: collect.maracujazeropragas.com
- ✅ GA4 Measurement ID: G-XXXXXXXXXX
- ✅ Facebook Pixel ID: seu_pixel_id
- ✅ Facebook Access Token: seu_access_token

### **Arquivos JSON para Importação:**
- ✅ `GTM-WPDKD23S-export.json` - Web GTM completo
- ✅ `GTM-PVHVLNR9-export.json` - Server GTM completo

---

## 🌐 **PASSO 1: Importar Web GTM (GTM-WPDKD23S)**

### **1.1 Importar Container**
1. Acesse: https://tagmanager.google.com/
2. Selecione conta correta
3. Clique em "Importar Container"
4. Faça upload do arquivo: `GTM-WPDKD23S-export.json`
5. Escolha "Merge" ou "Overwrite" (se estiver vazio)
6. **IMPORTANTE:** Marque "Workspaces" para importar

### **1.2 Configurar Variáveis**
Após importar, atualize estas variáveis:
```
1. GA4 Measurement ID
   - Vá para Variables → GA4 Measurement ID
   - Troque "G-XXXXXXXXXX" pelo seu ID real

2. Server Container URL
   - Já configurado: https://collect.maracujazeropragas.com
   - Verifique se está correto
```

### **1.3 Adicionar Facebook Pixel**
Antes de fechar as tags Facebook, adicione:
```html
<!-- Adicione no <head> do seu site -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'SEU_PIXEL_ID_AQUI');
</script>
```

### **1.4 Publicar Web GTM**
1. Preview → Teste no seu site
2. Verifique se todas as 4 tags disparam
3. Submit → Create Version → Publish

---

## 🖥️ **PASSO 2: Importar Server GTM (GTM-PVHVLNR9)**

### **2.1 Importar Container**
1. Acesse: https://tagmanager.google.com/
2. Selecione mesma conta, container server
3. Clique em "Importar Container"
4. Faça upload do arquivo: `GTM-PVHVLNR9-export.json`
5. Escolha "Merge" ou "Overwrite"
6. Marque "Workspaces"

### **2.2 Configurar Clients**
Após importar, atualize:
```
1. Google Analytics: GA4 Configuration
   - Measurement ID: G-XXXXXXXXXX (seu ID)
   - Stream ID: seu_stream_id

2. Conversions API
   - Pixel ID: seu_pixel_id
   - Access Token: seu_access_token
   - Test Event Code: TEST12345 (para testes)
```

### **2.3 Configurar Variáveis**
```
1. GA4 Measurement ID → seu ID real
2. Facebook Pixel ID → seu pixel ID
3. Facebook Access Token → seu token
4. Test Event Code → TEST12345
```

### **2.4 Publicar Server GTM**
1. Use debug mode: https://collect.maracujazeropragas.com/debug/preview
2. Teste eventos do seu site
3. Submit → Create Version → Publish

---

## 🌐 **PASSO 3: Implementar DataLayer no Site**

### **3.1 Adicionar GTM Snippet**
```html
<!-- Coloque no <head> -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WPDKD23S');</script>

<!-- Coloque após <body> -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WPDKD23S"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
```

### **3.2 Adicionar Funções Helper**
```javascript
<script>
// Função de Hash
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Gerador de Event ID
function generateEventId(prefix) {
  return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// DataLayer Push Padronizado
function pushToDataLayer(eventData) {
  if (!eventData.event_id) {
    eventData.event_id = generateEventId(eventData.event);
  }
  eventData.timestamp = new Date().toISOString();
  
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(eventData);
  
  console.log('📤 DataLayer Push:', eventData);
}

// Page View Automático
document.addEventListener('DOMContentLoaded', function() {
  pushToDataLayer({
    event: 'page_view',
    page_location: window.location.href,
    page_title: document.title,
    page_referrer: document.referrer
  });
});
</script>
```

### **3.3 Implementar os 4 Eventos**

#### **View Content (Página de produto/serviço)**
```javascript
// Adicione na página de produto/serviço
pushToDataLayer({
  event: 'view_content',
  content_data: {
    content_type: 'product',
    content_ids: ['PROD_001'],
    content_name: 'Nome do Produto/Serviço',
    category: 'Categoria',
    value: 199.90,
    currency: 'BRL'
  }
});
```

#### **Lead (Formulário de contato)**
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

#### **Initiate Checkout (Botão de comprar)**
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

## 🧪 **PASSO 4: Teste Completo**

### **4.1 Teste no Site**
1. Abra seu site em modo incógnito
2. Abra Tag Assistant Companion
3. Navegue pelas páginas (page_view)
4. Visite página de produto (view_content)
5. Preencha formulário (lead)
6. Clique em comprar (initiate_checkout)

### **4.2 Verificar GA4**
1. Acesse: https://analytics.google.com/
2. Realtime → Events
3. Deve ver: page_view, view_item, generate_lead, begin_checkout

### **4.3 Verificar Facebook**
1. Acesse: https://business.facebook.com/
2. Events Manager → Test Events
3. Use código: TEST12345
4. Deve ver: PageView, ViewContent, Lead, InitiateCheckout

### **4.4 Verificar Server**
1. Acesse: https://collect.maracujazeropragas.com/debug/preview
2. Container: GTM-PVHVLNR9
3. Verifique se todos os eventos chegam e as tags disparam

---

## 🚨 **Resolução de Problemas**

### **Se eventos não aparecem no GA4:**
1. Verifique GA4 Measurement ID no Web GTM
2. Verifique GA4 client no Server GTM
3. Verifique se server URL está configurado

### **Se eventos não aparecem no Facebook:**
1. Verifique Pixel ID e Access Token no Server GTM
2. Use Test Event Code: TEST12345
3. Verifique se event_id está sendo enviado

### **Se server não recebe eventos:**
1. Verifique Server Container URL no Web GTM
2. Teste endpoint: https://collect.maracujazeropragas.com/collect
3. Verifique logs no Stape.io

---

## ✅ **Checklist Final**

### **Importação:**
- [ ] Web GTM importado com sucesso
- [ ] Server GTM importado com sucesso
- [ ] Variáveis configuradas (GA4 ID, Pixel ID, Access Token)
- [ ] Ambos containers publicados

### **Implementação:**
- [ ] GTM snippet no site
- [ ] Funções helper implementadas
- [ ] page_view automático funcionando
- [ ] view_content em páginas de produto
- [ ] lead em formulários
- [ ] initiate_checkout em botões de compra

### **Validação:**
- [ ] GA4 recebendo todos os eventos
- [ ] Facebook recebendo todos os eventos
- [ ] Server GTM processando todos os eventos
- [ ] Zero erros no console
- [ ] Event IDs únicos funcionando

---

## 🎯 **Resultado Final**

Com esta implementação simplificada:
- ✅ **Apenas 4 eventos** para cobrir todo o funil
- ✅ **100% padronizados** entre Web → Server → Facebook/GA4
- ✅ **Importação JSON** sem configuração manual
- ✅ **Deduplicação perfeita** com event_id
- ✅ **Dados privados** com hash SHA256
- ✅ **Server-side tracking** ativo

**Seu GTM estará 100% funcional falando a mesma língua! 🚀**