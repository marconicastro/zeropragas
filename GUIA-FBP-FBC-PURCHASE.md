# 🎯 GUIA: Como Enviar FBP/FBC no Evento Purchase

**Situação:** Seu evento Purchase via webhook Cakto **NÃO tem FBP/FBC**  
**Motivo:** Webhook é servidor → não tem acesso aos cookies do browser  
**Solução:** Capturar FBP/FBC no **formulário** e enviar para o Cakto

---

## 📊 Seu Evento Atual (SEM FBP/FBC)

```
❌ Parâmetros atuais do Purchase:
- value: 39.9 ✅
- content_ids: ["hacr962"] ✅
- transaction_id: test_base_001 ✅
- user_data: ❌ FALTANDO (sem FBP/FBC)
```

---

## ✅ SOLUÇÃO: 3 Passos

### PASSO 1: Capturar FBP/FBC no Formulário

No seu `page.tsx`, quando o usuário preenche o formulário de lead, capture os cookies:

```typescript
import { captureMetaPixelCookiesRobust } from '@/lib/fbp-fbc-helper';
import { saveUserData } from '@/lib/userData';

// No handler do formulário
const handleCheckoutSubmit = async (formData: CheckoutFormData) => {
  try {
    // 1. Capturar FBP/FBC
    const { fbp, fbc } = await captureMetaPixelCookiesRobust();
    
    console.log('🔍 FBP capturado:', fbp);
    console.log('🔍 FBC capturado:', fbc);
    
    // 2. Salvar dados completos (incluindo FBP/FBC)
    saveUserData({
      email: formData.email,
      phone: formData.phone,
      fullName: formData.fullName,
      // Adicionar FBP/FBC
      fbp: fbp || undefined,
      fbc: fbc || undefined,
      timestamp: Date.now(),
      consent: true
    });
    
    // 3. Construir URL do Cakto COM FBP/FBC
    const checkoutURL = buildCheckoutURLWithFBPFBC(formData, fbp, fbc);
    
    // 4. Redirecionar
    window.location.href = checkoutURL;
    
  } catch (error) {
    console.error('Erro ao capturar FBP/FBC:', error);
  }
};
```

### PASSO 2: Adicionar FBP/FBC na Interface

Atualizar `src/lib/userData.ts` para aceitar FBP/FBC:

```typescript
export interface UserData {
  email?: string;
  phone?: string;
  fullName?: string;
  city?: string;
  state?: string;
  cep?: string;
  country?: string;
  
  // 🆕 ADICIONAR ESTES CAMPOS:
  fbp?: string;  // Facebook Browser Pixel
  fbc?: string;  // Facebook Click ID
  
  timestamp: number;
  sessionId: string;
  consent: boolean;
}
```

### PASSO 3: Enviar FBP/FBC para o Cakto

Modificar a URL do checkout para incluir FBP/FBC:

```typescript
function buildCheckoutURLWithFBPFBC(
  formData: CheckoutFormData,
  fbp: string | null,
  fbc: string | null
): string {
  const baseURL = 'https://pay.cakto.com.br/hacr962_605077';
  
  const params = new URLSearchParams({
    // Dados do formulário
    name: formData.fullName,
    email: formData.email,
    phone: formData.phone,
    
    // 🆕 FBP/FBC (se existirem)
    ...(fbp && { fbp }),
    ...(fbc && { fbc }),
    
    // UTMs (se existirem)
    // ...seus UTMs aqui
  });
  
  return `${baseURL}?${params.toString()}`;
}
```

### PASSO 4: Configurar Cakto para Enviar FBP/FBC

No **webhook do Cakto**, você precisa configurar para enviar os campos FBP/FBC de volta para o Meta:

**No painel do Cakto:**
1. Configurações → Webhooks
2. Adicionar campos personalizados:
   - `fbp` → `{{customer.fbp}}`
   - `fbc` → `{{customer.fbc}}`

**No seu webhook handler** (`src/app/api/webhook-cakto/route.ts`):

```typescript
// Receber FBP/FBC do Cakto
const fbp = webhookData.customer?.fbp || null;
const fbc = webhookData.customer?.fbc || null;

// Incluir no user_data do Meta
const userData = {
  em: await hashData(email),
  ph: await hashData(phone),
  fn: await hashData(firstName),
  ln: await hashData(lastName),
  
  // 🆕 ADICIONAR FBP/FBC
  fbp: fbp,  // SEM HASH (deve ser enviado plain)
  fbc: fbc,  // SEM HASH (deve ser enviado plain)
  
  external_id: sessionId,
  client_user_agent: 'Cakto-Webhook',
  // ... resto dos campos
};
```

---

## 🧪 TESTANDO FBP/FBC

### 1. Testar Captura no Formulário

Adicione um console.log no seu formulário:

```typescript
const { fbp, fbc } = await captureMetaPixelCookiesRobust();
console.log('====== FBP/FBC TEST ======');
console.log('FBP:', fbp);
console.log('FBC:', fbc);
console.log('==========================');
```

**O que esperar:**
- `FBP`: Sempre deve existir (ex: `fb.1.1730307422000.123456789`)
- `FBC`: Só existe se veio de anúncio do Facebook (ex: `fb.1.1730307422000.IwAR...`)

### 2. Testar no Meta Events Manager

Depois de fazer uma compra teste, verifique no **Meta Events Manager**:

```
Event: Purchase
Source: Server (webhook)

✅ Verificar se aparece:
user_data: {
  em: "hash...",
  ph: "hash...",
  fbp: "fb.1.1730307422000.123456789",  ← DEVE APARECER
  fbc: "fb.1.1730307422000.IwAR...",    ← SE VEIO DE ANÚNCIO
  ...
}
```

---

## 🎯 RESULTADO ESPERADO

### Antes (seu evento atual):
```
❌ user_data: AUSENTE
❌ fbp: AUSENTE
❌ fbc: AUSENTE
❌ Quality Score: ~7/10
```

### Depois (com FBP/FBC):
```
✅ user_data: PRESENTE
✅ fbp: fb.1.1730307422000.123456789
✅ fbc: fb.1.1730307422000.IwAR... (se houver)
✅ Quality Score: 9.3-9.5/10
```

---

## 📝 CHECKLIST COMPLETO

- [ ] 1. Adicionar campos `fbp` e `fbc` na interface `UserData`
- [ ] 2. Capturar FBP/FBC no formulário com `captureMetaPixelCookiesRobust()`
- [ ] 3. Salvar FBP/FBC com `saveUserData()`
- [ ] 4. Enviar FBP/FBC na URL do Cakto
- [ ] 5. Configurar campos personalizados no Cakto
- [ ] 6. Atualizar webhook handler para incluir FBP/FBC
- [ ] 7. Testar com console.log
- [ ] 8. Verificar no Meta Events Manager
- [ ] 9. Confirmar Quality Score melhorou

---

## ⚠️ IMPORTANTE: FBC vs FBCLID

- **FBC**: Cookie gerado pelo Meta Pixel (formato: `fb.1.timestamp.IwAR...`)
- **FBCLID**: Parâmetro na URL (formato: `IwAR123abc456...`)

O Meta aceita **AMBOS**, mas FBC é mais completo. Se você tiver `fbclid` na URL mas não tiver FBC cookie, pode construir:

```typescript
function buildFBCFromFBCLID(fbclid: string): string {
  const timestamp = Math.floor(Date.now() / 1000);
  return `fb.1.${timestamp}.${fbclid}`;
}
```

---

## 🚀 PRÓXIMOS PASSOS

1. **AGORA:** Implementar captura de FBP/FBC no formulário
2. **DEPOIS:** Configurar Cakto para passar FBP/FBC no webhook
3. **TESTAR:** Fazer compra teste e verificar no Meta Events Manager
4. **MONITORAR:** Ver Quality Score subir para 9.3-9.5/10

---

**Precisa de ajuda para implementar? Me avisa que eu crio o código completo para você! 🤝**
