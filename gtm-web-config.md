# 🌐 **GTM Web Configuration - GTM-WPDKD23S**

## 🎯 **Configuração COMPLETA para Web GTM**

---

## 📋 **1. Variáveis (Variables)**

### **Variáveis de DataLayer**
```
1. page_location
   - Tipo: Data Layer Variable
   - Data Layer Variable Name: page_location

2. page_title
   - Tipo: Data Layer Variable
   - Data Layer Variable Name: page_title

3. event_id
   - Tipo: Data Layer Variable
   - Data Layer Variable Name: event_id

4. user_data.sha256_email_address
   - Tipo: Data Layer Variable
   - Data Layer Variable Name: user_data.sha256_email_address

5. user_data.sha256_phone_number
   - Tipo: Data Layer Variable
   - Data Layer Variable Name: user_data.sha256_phone_number

6. transaction_id
   - Tipo: Data Layer Variable
   - Data Layer Variable Name: transaction_id

7. value
   - Tipo: Data Layer Variable
   - Data Layer Variable Name: value

8. currency
   - Tipo: Data Layer Variable
   - Data Layer Variable Name: currency
```

### **Variáveis de JavaScript**
```
9. page_url
   - Tipo: URL
   - Component Type: Full URL

10. random_number
    - Tipo: Custom JavaScript
    - Código: function() { return Math.random().toString(36).substr(2, 9); }
```

---

## 🎯 **2. Triggers (Gatilhos)**

### **Page View Trigger**
```
1. All Pages - Page View
   - Tipo: Page View
   - Trigger Type: All Pages
   - This trigger fires on: All Page Views
```

### **Custom Event Triggers**
```
2. generate_lead
   - Tipo: Custom Event
   - Event Name: generate_lead
   - This trigger fires on: All Custom Events

3. add_to_cart
   - Tipo: Custom Event
   - Event Name: add_to_cart
   - This trigger fires on: All Custom Events

4. begin_checkout
   - Tipo: Custom Event
   - Event Name: begin_checkout
   - This trigger fires on: All Custom Events

5. purchase
   - Tipo: Custom Event
   - Event Name: purchase
   - This trigger fires on: All Custom Events

6. click_phone
   - Tipo: Custom Event
   - Event Name: click_phone
   - This trigger fires on: All Custom Events

7. click_whatsapp
   - Tipo: Custom Event
   - Event Name: click_whatsapp
   - This trigger fires on: All Custom Events
```

---

## 🏷️ **3. Tags (Etiquetas)**

### **GA4 Configuration Tag**
```
1. GA4 Configuration
   - Tipo: GA4 Configuration
   - Measurement ID: G-XXXXXXXXXX (seu GA4)
   - Send a page view event when this configuration loads: ✅
   - Include Ecommerce Data: ✅
   - Server Container URL: https://collect.maracujazeropragas.com
   - Transport URL: https://collect.maracujazeropragas.com
```

### **GA4 Event Tags**
```
2. GA4 - generate_lead
   - Tipo: GA4 Event
   - Configuration Tag: GA4 Configuration
   - Event Name: generate_lead
   - Event Parameters:
     * event_id: {{event_id}}
     * value: {{value}}
     * currency: {{currency}}
   - Trigger: generate_lead

3. GA4 - add_to_cart
   - Tipo: GA4 Event
   - Configuration Tag: GA4 Configuration
   - Event Name: add_to_cart
   - Event Parameters:
     * event_id: {{event_id}}
     * value: {{value}}
     * currency: {{currency}}
   - Trigger: add_to_cart

4. GA4 - begin_checkout
   - Tipo: GA4 Event
   - Configuration Tag: GA4 Configuration
   - Event Name: begin_checkout
   - Event Parameters:
     * event_id: {{event_id}}
     * value: {{value}}
     * currency: {{currency}}
   - Trigger: begin_checkout

5. GA4 - purchase
   - Tipo: GA4 Event
   - Configuration Tag: GA4 Configuration
   - Event Name: purchase
   - Event Parameters:
     * event_id: {{event_id}}
     * transaction_id: {{transaction_id}}
     * value: {{value}}
     * currency: {{currency}}
   - Trigger: purchase
```

### **Facebook Pixel Tags**
```
6. Facebook Pixel - PageView
   - Tipo: Custom HTML
   - HTML: 
   <script>
   fbq('track', 'PageView', {
     eventID: '{{event_id}}'
   });
   </script>
   - Trigger: All Pages - Page View

7. Facebook Pixel - Lead
   - Tipo: Custom HTML
   - HTML:
   <script>
   fbq('track', 'Lead', {
     eventID: '{{event_id}}'
   });
   </script>
   - Trigger: generate_lead

8. Facebook Pixel - InitiateCheckout
   - Tipo: Custom HTML
   - HTML:
   <script>
   fbq('track', 'InitiateCheckout', {
     eventID: '{{event_id}}',
     value: {{value}},
     currency: '{{currency}}'
   });
   </script>
   - Trigger: begin_checkout

9. Facebook Pixel - Purchase
   - Tipo: Custom HTML
   - HTML:
   <script>
   fbq('track', 'Purchase', {
     eventID: '{{event_id}}',
     value: {{value}},
     currency: '{{currency}}',
     transaction_id: '{{transaction_id}}'
   });
   </script>
   - Trigger: purchase
```

### **Server Forwarding Tags**
```
10. Server - Forward All Events
    - Tipo: Custom HTML
    - HTML:
    <script>
    // Envia evento para server GTM
    fetch('https://collect.maracujazeropragas.com/collect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event: '{{Event}}',
        event_id: '{{event_id}}',
        page_location: '{{page_location}}',
        page_title: '{{page_title}}',
        user_data: {
          sha256_email_address: '{{user_data.sha256_email_address}}',
          sha256_phone_number: '{{user_data.sha256_phone_number}}'
        },
        value: {{value}},
        currency: '{{currency}}',
        transaction_id: '{{transaction_id}}',
        timestamp: new Date().toISOString()
      })
    });
    </script>
    - Trigger: All Custom Events
```

---

## 🔧 **4. Configurações Importantes**

### **Settings → Variables**
```
- Enable dataLayer: ✅
- Enable debug mode: ✅ (apenas para desenvolvimento)
```

### **Settings → Containers**
```
- Container ID: GTM-WPDKD23S
- Container Type: Web
```

### **Settings → Install Google Tag Manager**
```
<!-- Copiar este código no <head> -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WPDKD23S');</script>

<!-- Copiar este código após <body> -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WPDKD23S"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
```

---

## 🚨 **5. Configuração de Server Container URL**

### **GA4 Configuration Tag Settings**
```
1. Server Container URL: https://collect.maracujazeropragas.com
2. Transport URL: https://collect.maracujazeropragas.com
3. Enable sending data to server container: ✅
```

### **Facebook Pixel Settings**
```
1. Use first-party cookies: ✅
2. Automatic Matching: ✅
3. Advanced Matching: ✅
```

---

## 📊 **6. Ordem de Execução das Tags**

### **Priority Setup**
```
1. GA4 Configuration (Priority: 1)
2. Facebook Pixel - PageView (Priority: 2)
3. Server - Forward All Events (Priority: 3)
4. GA4 Event Tags (Priority: 4)
5. Facebook Pixel Event Tags (Priority: 5)
```

---

## 🧪 **7. Teste e Validação**

### **Preview Mode**
```
1. Clique em "Preview"
2. Digite sua URL: maracujazeropragas.com
3. Verifique se todas as tags estão disparando
4. Use o "DataLayer" tab para ver os eventos
```

### **Tag Assistant**
```
1. Instale Tag Assistant Companion
2. Conecte ao GTM-WPDKD23S
3. Verifique eventos em tempo real
```

---

## ✅ **Checklist Final**

### **Antes de Publicar**
- [ ] Todas as variáveis criadas
- [ ] Todos os triggers configurados
- [ ] Todas as tags com trigger correto
- [ ] Server Container URL configurado
- [ ] Event ID único em todos os eventos
- [ ] Dados hash configurados
- [ ] Preview mode funcionando
- [ ] Teste completo realizado

### **Após Publicar**
- [ ] Verificar eventos no GA4
- [ ] Verificar eventos no Facebook
- [ ] Verificar server container recebendo
- [ ] Monitorar por 24 horas

---

## 🎯 **Resultado Esperado**

Com esta configuração:
- ✅ Eventos padronizados
- ✅ IDs únicos para deduplicação
- ✅ Dados hash para privacidade
- ✅ Server forwarding ativo
- ✅ Zero inconsistências

Seu GTM Web estará 100% pronto para falar a mesma língua que o Server!