# 🖥️ **GTM Server Configuration - GTM-PVHVLNR9**

## 🎯 **Configuração COMPLETA para Server GTM**

---

## 🏗️ **1. Setup Inicial do Container**

### **Container Settings**
```
Container ID: GTM-PVHVLNR9
Container Type: Server
Server URL: https://collect.maracujazeropragas.com
Provider: Stape.io (ou seu provider)
```

### **Custom Domain Setup**
```
Domain: collect.maracujazeropragas.com
SSL: ✅ Ativo
Path: /collect
```

---

## 🌐 **2. Clients (Clientes)**

### **GA4 Client**
```
1. Google Analytics: GA4 Configuration
   - Tipo: Google Analytics: GA4 Configuration
   - Measurement ID: G-XXXXXXXXXX (mesmo do web)
   - Stream ID: seu_stream_id
   - Server-side measurement: ✅
   - Send User Data: ✅
   - Include IP Address: ✅
   - Include User Agent: ✅
   - Include Geographical Data: ✅
```

### **Facebook CAPI Client**
```
2. Conversions API
   - Tipo: Conversions API
   - Pixel ID: seu_pixel_id
   - Access Token: seu_access_token
   - Test Event Code: TEST12345 (para testes)
   - Send Event ID: ✅
   - Send User Data: ✅
   - Send Advanced Matching: ✅
   - Include IP Address: ✅
   - Include User Agent: ✅
   - Include Geographical Data: ✅
```

### **HTTP Client (Debug)**
```
3. HTTP Forwarding
   - Tipo: HTTP Forwarding
   - Endpoint URL: https://seu-endpoint-de-debug.com/webhook
   - Method: POST
   - Include All Data: ✅
   - Content Type: application/json
```

---

## 🎯 **3. Triggers (Gatilhos)**

### **Event Triggers**
```
1. page_view
   - Tipo: Custom Event
   - Event Name: page_view
   - This trigger fires on: All Custom Events

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

## 🏷️ **4. Tags (Etiquetas)**

### **GA4 Server Tags**
```
1. GA4 Server - page_view
   - Tipo: Google Analytics: GA4 Event
   - Configuration Tag: Google Analytics: GA4 Configuration
   - Event Name: page_view
   - Event Parameters:
     * event_id: {{event_id}}
     * page_location: {{page_location}}
     * page_title: {{page_title}}
   - Trigger: page_view

2. GA4 Server - generate_lead
   - Tipo: Google Analytics: GA4 Event
   - Configuration Tag: Google Analytics: GA4 Configuration
   - Event Name: generate_lead
   - Event Parameters:
     * event_id: {{event_id}}
     * value: {{value}}
     * currency: {{currency}}
   - Trigger: generate_lead

3. GA4 Server - add_to_cart
   - Tipo: Google Analytics: GA4 Event
   - Configuration Tag: Google Analytics: GA4 Configuration
   - Event Name: add_to_cart
   - Event Parameters:
     * event_id: {{event_id}}
     * value: {{value}}
     * currency: {{currency}}
   - Trigger: add_to_cart

4. GA4 Server - begin_checkout
   - Tipo: Google Analytics: GA4 Event
   - Configuration Tag: Google Analytics: GA4 Configuration
   - Event Name: begin_checkout
   - Event Parameters:
     * event_id: {{event_id}}
     * value: {{value}}
     * currency: {{currency}}
   - Trigger: begin_checkout

5. GA4 Server - purchase
   - Tipo: Google Analytics: GA4 Event
   - Configuration Tag: Google Analytics: GA4 Configuration
   - Event Name: purchase
   - Event Parameters:
     * event_id: {{event_id}}
     * transaction_id: {{transaction_id}}
     * value: {{value}}
     * currency: {{currency}}
   - Trigger: purchase
```

### **Facebook CAPI Server Tags**
```
6. Facebook CAPI - PageView
   - Tipo: Conversions API
   - Configuration Tag: Conversions API
   - Event Name: PageView
   - Event Parameters:
     * event_id: {{event_id}}
     * event_source_url: {{page_location}}
     * user_data: {{user_data}}
   - Trigger: page_view

7. Facebook CAPI - Lead
   - Tipo: Conversions API
   - Configuration Tag: Conversions API
   - Event Name: Lead
   - Event Parameters:
     * event_id: {{event_id}}
     * event_source_url: {{page_location}}
     * value: {{value}}
     * currency: {{currency}}
     * user_data: {{user_data}}
   - Trigger: generate_lead

8. Facebook CAPI - InitiateCheckout
   - Tipo: Conversions API
   - Configuration Tag: Conversions API
   - Event Name: InitiateCheckout
   - Event Parameters:
     * event_id: {{event_id}}
     * event_source_url: {{page_location}}
     * value: {{value}}
     * currency: {{currency}}
     * user_data: {{user_data}}
   - Trigger: begin_checkout

9. Facebook CAPI - Purchase
   - Tipo: Conversions API
   - Configuration Tag: Conversions API
   - Event Name: Purchase
   - Event Parameters:
     * event_id: {{event_id}}
     * event_source_url: {{page_location}}
     * value: {{value}}
     * currency: {{currency}}
     * transaction_id: {{transaction_id}}
     * user_data: {{user_data}}
   - Trigger: purchase

10. Facebook CAPI - Contact
    - Tipo: Conversions API
    - Configuration Tag: Conversions API
    - Event Name: Contact
    - Event Parameters:
      * event_id: {{event_id}}
      * event_source_url: {{page_location}}
      * user_data: {{user_data}}
    - Trigger: click_phone, click_whatsapp
```

---

## 🔧 **5. Variáveis (Variables)**

### **Built-in Variables**
```
1. Event Name
2. Event ID
3. Page URL
4. Page Title
5. Client IP Address
6. User Agent
7. Country
8. City
9. Region
```

### **Data Layer Variables**
```
10. event_id
    - Data Layer Variable Name: event_id

11. page_location
    - Data Layer Variable Name: page_location

12. page_title
    - Data Layer Variable Name: page_title

13. user_data
    - Data Layer Variable Name: user_data

14. value
    - Data Layer Variable Name: value

15. currency
    - Data Layer Variable Name: currency

16. transaction_id
    - Data Layer Variable Name: transaction_id
```

---

## 🛠️ **6. Transformações de Dados**

### **User Data Transformation**
```
1. Clean User Data
   - Tipo: Transform Data
   - Input Data: {{user_data}}
   - Transformations:
     * Remove null values
     * Normalize email format
     * Normalize phone format
     * Add country code if missing
```

### **Event ID Validation**
```
2. Validate Event ID
   - Tipo: Transform Data
   - Input Data: {{event_id}}
   - Transformations:
     * Check if event_id exists
     * Generate if missing
     * Format validation
```

---

## 🔐 **7. Configurações de Privacidade**

### **Data Retention**
```
- User Data: 14 days
- Event Data: 30 days
- IP Address: Hashed
- User Agent: Stored
```

### **Consent Management**
```
- Ad Storage: ✅
- Analytics Storage: ✅
- Personalization Storage: ✅
- Functionality Storage: ✅
```

---

## 📊 **8. Debug e Monitoramento**

### **Server Container Debug**
```
1. Ativar Debug Mode
   - URL: https://collect.maracujazeropragas.com/debug/preview
   - Container ID: GTM-PVHVLNR9
   - Verificar eventos em tempo real
```

### **Logs no Stape.io**
```
1. Acessar painel Stape.io
2. Verificar "Container Logs"
3. Filtrar por:
   - Event Type
   - Client
   - Status Code
   - Timestamp
```

### **Test Events**
```
1. Enviar evento de teste:
curl -X POST https://collect.maracujazeropragas.com/collect \
  -H "Content-Type: application/json" \
  -d '{
    "event": "page_view",
    "event_id": "test_' + $(date +%s) + '",
    "page_location": "https://maracujazeropragas.com/test"
  }'
```

---

## 🚨 **9. Resolução de Problemas Comuns**

### **Problema: Tags não disparam**
```
Causa: Triggers não correspondem aos eventos
Solução:
1. Verificar nome exato dos eventos
2. Usar Console Log para debug
3. Verificar se dados chegam ao server
```

### **Problema: Facebook não recebe eventos**
```
Causa: Access Token inválido ou Pixel ID errado
Solução:
1. Verificar Access Token no Facebook Business
2. Confirmar Pixel ID
3. Usar Test Event Code
```

### **Problema: GA4 não mostra dados**
```
Causa: Measurement ID incorreta ou Stream ID
Solução:
1. Verificar Measurement ID no GA4
2. Confirmar Stream ID
3. Verificar data stream settings
```

---

## ✅ **10. Checklist Final**

### **Antes de Publicar**
- [ ] Todos os clientes configurados
- [ ] Todos os triggers criados
- [ ] Todas as tags com trigger correto
- [ ] Variáveis mapeadas
- [ ] Transformações configuradas
- [ ] Debug mode funcionando
- [ ] Teste completo realizado

### **Após Publicar**
- [ ] Verificar eventos no GA4
- [ ] Verificar eventos no Facebook
- [ ] Monitorar logs do server
- [ ] Testar todos os eventos
- [ ] Verificar latência

---

## 🎯 **Resultado Esperado**

Com esta configuração:
- ✅ Server GTM recebe todos os eventos do Web GTM
- ✅ GA4 recebe eventos via server-side
- ✅ Facebook CAPI recebe eventos com dados completos
- ✅ IDs únicos para deduplicação
- ✅ Dados geográficos automáticos
- ✅ Zero "Tags desaparecidas"

Seu GTM Server estará 100% pronto para processar todos os eventos corretamente!