# 🧪 GUIA DE TESTES - TEST EVENT CODE

**Data**: 31 de Outubro de 2025  
**Modo**: Test Events (não afeta dados de produção)  
**Test Code**: `TEST35751`

---

## 🎯 O QUE É TEST EVENT CODE?

O **Test Event Code** faz com que todos os eventos sejam enviados para uma área separada no Meta Events Manager chamada **"Test Events"**.

### ✅ Vantagens
- ✅ Eventos **SÃO enviados** para o Meta (teste real)
- ✅ Aparecem em área **separada** (não poluem dados)
- ✅ Você vê **exatamente** como ficam no Meta
- ✅ Valida integração completa
- ✅ Testa FBP/FBC, UTMs, user_data, etc.

### ⚠️ Importante
- ⚠️ Eventos **NÃO aparecem** em relatórios de produção
- ⚠️ Eventos **NÃO afetam** otimização de campanhas
- ⚠️ Eventos **NÃO contam** para conversões reais

---

## 🚀 PASSO A PASSO PARA TESTAR

### 1️⃣ **Verificar .env.local**

Arquivo já criado em: `/home/mcastro/Documentos/projeto_windsurf/zeropragas/.env.local`

**Configuração principal**:
```bash
NEXT_PUBLIC_TEST_EVENT_CODE=TEST35751  # ← Eventos vão para Test Events
NEXT_PUBLIC_DEBUG_TRACKING=true        # ← Logs detalhados
NEXT_PUBLIC_BROWSER_PIXEL=true         # ← Ver no navegador
```

---

### 2️⃣ **Iniciar Servidor de Desenvolvimento**

```bash
cd /home/mcastro/Documentos/projeto_windsurf/zeropragas

# Iniciar servidor
npm run dev
```

**Aguardar**:
```
✓ Ready in 2.5s
○ Local: http://localhost:3000
```

---

### 3️⃣ **Abrir Site no Navegador**

```
http://localhost:3000
```

**Abrir Console (F12)**:
- Chrome/Edge: `F12` ou `Ctrl+Shift+I`
- Firefox: `F12` ou `Ctrl+Shift+K`

---

### 4️⃣ **Verificar Meta Pixel Carregou**

No console, deve aparecer:
```
🎯 PageView - Sistema Definitivo (Nota 9.5+)
  🆔 Event ID: evt_1234567890_abc12
  📊 Dados pessoais: true
  🌍 Dados geográficos: true
  🎯 UTM Data: ⚠️ Ausente (ou ✅ Presente)
  🍪 FBP/FBC: ✅ FBP
  🎛️ Modo: HÍBRIDO
  📈 Nota Esperada: 9.5+/10 ✅
  🧪 TEST MODE: TEST35751  ← IMPORTANTE!
```

---

### 5️⃣ **Verificar FBP/FBC**

No console, digite:
```javascript
// Verificar cookies
document.cookie.split(';').filter(c => c.includes('_fb'))
```

**Resultado esperado**:
```javascript
["_fbp=fb.1.1698765432.1234567890"]
// _fbc só aparece se veio de anúncio
```

---

### 6️⃣ **Testar Eventos**

#### A. PageView (Automático)
- ✅ Já disparou ao carregar a página
- Ver logs no console

#### B. Scroll (Automático)
- Role a página até 25%, 50%, 75%, 100%
- Ver logs no console:
```
📊 ScrollDepth 25% disparado (Sistema Definitivo)
🎯 ViewContent disparado no scroll 25%
```

#### C. Formulário (Manual)
- Preencher formulário de lead
- Submeter
- Ver logs:
```
🎯 Lead - Sistema Definitivo (Nota 9.5+)
  🧪 TEST MODE: TEST35751
```

---

### 7️⃣ **Ver Eventos no Meta Events Manager**

#### Acessar Meta
1. Ir para: https://business.facebook.com/events_manager2
2. Selecionar Pixel: `642933108377475`
3. Clicar em **"Test Events"** (menu lateral)

#### O Que Você Vai Ver
```
🧪 Test Events (TEST35751)

┌─────────────────────────────────────────┐
│ PageView                                │
│ Time: Agora                             │
│ Event ID: evt_1234567890_abc12          │
│ Parameters:                             │
│   - fbp: fb.1.1698765432.1234567890    │
│   - user_data: {...}                    │
│   - utm_source: (se tiver)              │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ViewContent                             │
│ Time: Agora                             │
│ Event ID: evt_1234567891_def34          │
│ Parameters:                             │
│   - fbp: fb.1.1698765432.1234567890    │
│   - content_name: Scroll 25%            │
└─────────────────────────────────────────┘
```

---

## 🧪 TESTES ESPECÍFICOS

### Teste 1: UTMs
```
http://localhost:3000/?utm_source=facebook&utm_campaign=teste&utm_medium=cpc
```

**Verificar no console**:
```
🎯 UTM Data: ✅ Presente
  - utm_source: facebook
  - utm_campaign: teste
  - utm_medium: cpc
```

**Verificar no Meta**:
- Evento deve ter `utm_source`, `utm_campaign`, `utm_medium`

---

### Teste 2: FBP/FBC
```javascript
// No console
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

console.log('FBP:', getCookie('_fbp'));
console.log('FBC:', getCookie('_fbc'));
```

**Resultado esperado**:
```
FBP: fb.1.1698765432.1234567890
FBC: null (ou fb.1... se veio de anúncio)
```

---

### Teste 3: User Data
No Meta Events Manager, clicar no evento e ver:
```
user_data:
  em: [hash do email]
  ph: [hash do telefone]
  fn: [hash do primeiro nome]
  ct: [hash da cidade]
  st: [hash do estado]
  fbp: fb.1.1698765432.1234567890  ← DEVE ESTAR PRESENTE
  fbc: fb.1... (se tiver)
```

---

### Teste 4: Monitoramento
```javascript
// No console
import { showDashboard } from '@/lib/tracking-monitor';
showDashboard();
```

**Resultado esperado**:
```
📊 TRACKING DASHBOARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 MÉTRICAS GERAIS
  Total de Eventos: 5
  Eventos com Sucesso: 5
  Taxa de Falha: 0.0%
  Quality Score Médio: 9.5

⚡ PERFORMANCE
  Latência Média: 45ms
  Tempo Máximo: 120ms
  Tempo Mínimo: 25ms

🎯 EVENTOS POR TIPO
  PageView: 1
  ViewContent: 4
  Lead: 0
```

---

## 📊 CHECKLIST DE TESTES

### Básico
- [ ] Meta Pixel carrega
- [ ] FBP é capturado
- [ ] PageView dispara
- [ ] Logs aparecem no console
- [ ] Eventos aparecem no Meta Test Events

### UTMs
- [ ] Acessar com UTMs na URL
- [ ] UTMs aparecem nos logs
- [ ] UTMs aparecem no Meta

### FBP/FBC
- [ ] FBP presente em todos os eventos
- [ ] FBP aparece no Meta Events Manager
- [ ] FBC aparece se veio de anúncio

### Scroll
- [ ] ScrollDepth 25% dispara
- [ ] ScrollDepth 50% dispara
- [ ] ViewContent dispara junto

### Formulário
- [ ] Lead dispara ao submeter
- [ ] User data completo
- [ ] FBP/FBC incluídos

### Monitoramento
- [ ] Dashboard funciona
- [ ] Métricas corretas
- [ ] Quality Score alto (9+)

---

## 🔍 TROUBLESHOOTING

### Problema: "TEST MODE não aparece nos logs"
**Solução**: Verificar `.env.local`:
```bash
NEXT_PUBLIC_TEST_EVENT_CODE=TEST35751
```

Reiniciar servidor:
```bash
# Ctrl+C para parar
npm run dev
```

---

### Problema: "Eventos não aparecem no Meta"
**Causas**:
1. Test Event Code errado
2. Meta Pixel ID errado
3. Bloqueador de anúncios ativo

**Solução**:
```javascript
// Verificar no console
console.log('Test Code:', process.env.NEXT_PUBLIC_TEST_EVENT_CODE);
console.log('Pixel ID:', process.env.NEXT_PUBLIC_META_PIXEL_ID);
```

---

### Problema: "FBP não aparece"
**Solução**:
```javascript
// Aguardar Meta Pixel carregar
setTimeout(() => {
  const fbp = document.cookie.split(';')
    .find(c => c.includes('_fbp'));
  console.log('FBP:', fbp);
}, 2000);
```

---

## 🎯 QUANDO PASSAR PARA PRODUÇÃO

### Remover Test Event Code

**Na Vercel (Production)**:
1. Settings → Environment Variables
2. **REMOVER** `NEXT_PUBLIC_TEST_EVENT_CODE`
3. Ou definir como vazio: `NEXT_PUBLIC_TEST_EVENT_CODE=`
4. Redeploy

**No `.env.local`** (se quiser testar produção localmente):
```bash
# Comentar ou remover
# NEXT_PUBLIC_TEST_EVENT_CODE=TEST35751

# Mudar para produção
NEXT_PUBLIC_TRACKING_MODE=production
NEXT_PUBLIC_DEBUG_TRACKING=false
NEXT_PUBLIC_VERBOSE_LOGS=false
```

---

## 📋 RESUMO

### Modo Teste (Atual)
```bash
NEXT_PUBLIC_TEST_EVENT_CODE=TEST35751
NEXT_PUBLIC_DEBUG_TRACKING=true
```

**Resultado**:
- ✅ Eventos enviados para Meta
- ✅ Aparecem em "Test Events"
- ✅ Logs detalhados
- ✅ Não afeta produção

### Modo Produção (Futuro)
```bash
# NEXT_PUBLIC_TEST_EVENT_CODE removido
NEXT_PUBLIC_DEBUG_TRACKING=false
```

**Resultado**:
- ✅ Eventos enviados para Meta
- ✅ Aparecem em eventos reais
- ✅ Sem logs (performance)
- ✅ Afeta otimização de campanhas

---

## 🚀 COMANDOS RÁPIDOS

```bash
# Iniciar testes
npm run dev

# Ver logs em tempo real
# (já aparecem no console do navegador)

# Parar servidor
Ctrl+C
```

---

## 📞 LINKS ÚTEIS

- **Meta Events Manager**: https://business.facebook.com/events_manager2
- **Test Events**: https://business.facebook.com/events_manager2/test_events
- **Pixel Helper**: https://chrome.google.com/webstore/detail/meta-pixel-helper

---

**Pronto para testar!** 🧪

Execute `npm run dev` e comece a testar! 🚀
