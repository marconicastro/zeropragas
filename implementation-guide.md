# 🚀 **Guia de Implementação Passo a Passo**

## 🎯 **Como Fazer Tudo Funcionar - Ordem Exata**

---

## 📋 **PASSO 0: Preparação**

### **O que você precisa:**
- ✅ Container Web GTM: GTM-WPDKD23S
- ✅ Container Server GTM: GTM-PVHVLNR9
- ✅ Domínio customizado: collect.maracujazeropragas.com
- ✅ GA4 Measurement ID: G-XXXXXXXXXX
- ✅ Facebook Pixel ID: seu_pixel_id
- ✅ Facebook Access Token: seu_access_token

---

## 🌐 **PASSO 1: Implementar DataLayer no Site**

### **1.1 Adicionar GTM Snippet**
```html
<!-- Coloque no <head> do seu site -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WPDKD23S');</script>

<!-- Coloque após <body> -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WPDKD23S"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
```

### **1.2 Adicionar Funções Helper**
```javascript
<!-- Adicione antes de fechar </body> -->
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

### **1.3 Implementar Eventos Específicos**

#### **Formulário de Contato**
```javascript
// Quando formulário for enviado
document.getElementById('contact-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const name = document.getElementById('name').value;
  
  // Hash dos dados
  const emailHash = await sha256(email);
  const phoneHash = await sha256(phone);
  const nameHash = await sha256(name);
  
  pushToDataLayer({
    event: 'generate_lead',
    user_data: {
      sha256_email_address: emailHash,
      sha256_phone_number: phoneHash,
      first_name: nameHash,
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

#### **Cliques em Telefone/WhatsApp**
```javascript
// Cliques em telefone
document.querySelectorAll('a[href^="tel:"]').forEach(function(link) {
  link.addEventListener('click', function() {
    pushToDataLayer({
      event: 'click_phone',
      user_data: {
        sha256_phone_number: await sha256(this.href.replace('tel:', ''))
      }
    });
  });
});

// Cliques em WhatsApp
document.querySelectorAll('a[href^="https://wa.me"]').forEach(function(link) {
  link.addEventListener('click', function() {
    pushToDataLayer({
      event: 'click_whatsapp',
      user_data: {
        sha256_phone_number: await sha256(this.href.match(/\d+/)[0])
      }
    });
  });
});
```

---

## 🌐 **PASSO 2: Configurar Web GTM (GTM-WPDKD23S)**

### **2.1 Criar Variáveis**
1. Acesse: https://tagmanager.google.com/
2. Container: GTM-WPDKD23S
3. Variables → New
4. Crie as variáveis exatamente como no arquivo `gtm-web-config.md`

### **2.2 Criar Triggers**
1. Triggers → New
2. Crie os triggers exatamente como no arquivo `gtm-web-config.md`

### **2.3 Criar Tags**
1. Tags → New
2. Crie as tags exatamente como no arquivo `gtm-web-config.md`
3. **IMPORTANTE:** Configure Server Container URL em GA4 Configuration

### **2.4 Testar Web GTM**
1. Preview → Digite sua URL
2. Verifique se todas as tags disparam
3. Use Tag Assistant para validar
4. Corrija erros antes de publicar

### **2.5 Publicar Web GTM**
1. Submit → Create Version
2. Descrição: "Implementação dataLayer padronizado"
3. Publish

---

## 🖥️ **PASSO 3: Configurar Server GTM (GTM-PVHVLNR9)**

### **3.1 Verificar Setup do Container**
1. Acesse: https://tagmanager.google.com/
2. Container: GTM-PVHVLNR9
3. Verifique se o domínio está ativo: collect.maracujazeropragas.com

### **3.2 Configurar Clients**
1. Clients → New
2. Configure os clients exatamente como no arquivo `gtm-server-config.md`

### **3.3 Criar Variáveis**
1. Variables → New
2. Crie as variáveis exatamente como no arquivo `gtm-server-config.md`

### **3.4 Criar Triggers**
1. Triggers → New
2. Crie os triggers exatamente como no arquivo `gtm-server-config.md`

### **3.5 Criar Tags**
1. Tags → New
2. Crie as tags exatamente como no arquivo `gtm-server-config.md`

### **3.6 Testar Server GTM**
1. Use o debug mode: https://collect.maracujazeropragas.com/debug/preview
2. Envie eventos de teste do seu site
3. Verifique se as tags disparam no server
4. Verifique logs no Stape.io

### **3.7 Publicar Server GTM**
1. Submit → Create Version
2. Descrição: "Configuração server-side completa"
3. Publish

---

## 🧪 **PASSO 4: Teste Completo do Fluxo**

### **4.1 Teste Manual**
1. Abra seu site em modo incógnito
2. Abra Tag Assistant
3. Navegue pelas páginas
4. Preencha formulário de contato
5. Clique em telefone/WhatsApp
6. Verifique todos os eventos

### **4.2 Verificar GA4**
1. Acesse: https://analytics.google.com/
2. Realtime → Events
3. Verifique se os eventos aparecem
4. Verifique dados dos usuários

### **4.3 Verificar Facebook**
1. Acesse: https://business.facebook.com/
2. Events Manager → Test Events
3. Verifique se os eventos chegam
4. Verifique dados dos usuários

### **4.4 Verificar Server Logs**
1. Acesse painel Stape.io
2. Container Logs
3. Verifique se todos os eventos chegaram
4. Verifique se as tags dispararam

---

## 🚨 **PASSO 5: Resolução de Problemas**

### **Se eventos não aparecem no GA4:**
1. Verifique Measurement ID no GTM Web
2. Verifique Server Container URL
3. Verifique se GA4 client está ativo no server
4. Verifique logs do server container

### **Se eventos não aparecem no Facebook:**
1. Verifique Pixel ID no server
2. Verifique Access Token
3. Use Test Event Code
4. Verifique se event_id está sendo enviado

### **Se server não recebe eventos:**
1. Verifique Server Container URL no web GTM
2. Verifique se domínio está acessível
3. Teste endpoint manualmente com curl
4. Verifique logs do Stape.io

### **Se "Tags desaparecidas":**
1. Verifique nome exato dos triggers
2. Verifique se dados chegam ao server
3. Use debug mode do server
4. Verifique transformações de dados

---

## ✅ **PASSO 6: Validação Final**

### **Checklist de Validação:**
- [ ] Page view dispara em todas as páginas
- [ ] Formulário de contato gera lead event
- [ ] Cliques em telefone/WhatsApp funcionam
- [ ] GA4 recebe todos os eventos
- [ ] Facebook recebe todos os eventos
- [ ] Server GTM processa todos os eventos
- [ ] IDs únicos para deduplicação
- [ ] Dados hash funcionando
- [ ] Sem erros no console

### **Monitoramento Contínuo:**
- [ ] Verificar GA4 diariamente
- [ ] Verificar Facebook Events Manager
- [ ] Monitorar server logs
- [ ] Testar novos eventos antes de publicar

---

## 🎯 **Resultado Final**

Com esta implementação:
- ✅ **100% dos eventos padronizados**
- ✅ **Zero inconsistências de dados**
- ✅ **Deduplicação perfeita com event_id**
- ✅ **Privacidade com dados hash**
- ✅ **Server-side tracking ativo**
- ✅ **Debug completo disponível**

Seu GTM estará falando a **mesma língua** em Web → Server → Facebook → GA4!

---

## 📞 **Suporte**

Se encontrar problemas:
1. Use os scripts de debug criados
2. Verifique os logs detalhados
3. Siga o checklist de resolução
4. Teste cada componente individualmente

**Agora é só implementar! 🚀**