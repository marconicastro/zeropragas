# 🧪 COMO TESTAR O SISTEMA DE TRACKING

Guia rápido e objetivo para testar todo o sistema em **5 minutos**.

---

## ⚡ TESTE RÁPIDO (Browser)

### 1. Iniciar Aplicação

```bash
npm run dev
```

### 2. Abrir Página de Testes

**URL**: http://localhost:3000/test-tracking.html

### 3. Clicar em "Iniciar Testes"

✅ **Resultado esperado**: 10/10 testes passarem

---

## 🔬 TESTE COMPLETO (APIs)

### 1. Rodar Script de Testes

```bash
npm run test:apis
```

✅ **Resultado esperado**: 8/8 testes passarem

---

## 📋 CHECKLIST RÁPIDO

Execute estes comandos no **Console do DevTools** (F12):

### 1. Meta Pixel Carregado?

```javascript
typeof window.fbq !== 'undefined'
// Deve retornar: true
```

### 2. FBP Capturado?

```javascript
document.cookie.split(';').find(c => c.includes('_fbp'))
// Deve retornar: "_fbp=fb.1.1234567890..."
```

### 3. Disparar Evento de Teste

```javascript
window.fbq('track', 'Lead', { 
  content_name: 'Teste Manual',
  value: 15.00,
  currency: 'BRL' 
});
// Console deve mostrar confirmação
```

### 4. Ver Métricas do Sistema

```javascript
import('/src/lib/tracking-monitor.js').then(m => m.showDashboard());
// Dashboard aparece no console
```

---

## 🎯 VALIDAR NO META

### 1. Abrir Meta Events Manager

**URL**: https://business.facebook.com/events_manager2/list

### 2. Selecionar seu Pixel

ID: `642933108377475`

### 3. Ir em "Test Events"

- Filtrar por: `TEST60998`
- Ver eventos dos últimos 5 minutos

### 4. Verificar Quality Score

✅ **Esperado**: 9.0+ em todos os eventos

---

## 🔗 TESTE DE WEBHOOK

### Verificar se está ativo:

```bash
curl http://localhost:3000/api/webhook-cakto
```

✅ **Esperado**: 
```json
{
  "status": "webhook_active",
  "webhook_version": "3.1-enterprise-unified-server"
}
```

### Testar Purchase:

```bash
curl -X POST http://localhost:3000/api/webhook-cakto \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "12f4848f-35e9-41a8-8da4-1032642e3e89",
    "event": "purchase_approved",
    "data": {
      "id": "test_123",
      "status": "paid",
      "amount": 39.9,
      "paymentMethod": "pix",
      "customer": {
        "email": "teste@exemplo.com",
        "phone": "11999999999",
        "name": "João Silva"
      },
      "product": {
        "name": "Sistema 4 Fases",
        "short_id": "hacr962"
      }
    }
  }'
```

✅ **Esperado**: 
```json
{
  "status": "success",
  "message": "Evento purchase_approved processado com sucesso"
}
```

---

## ❓ TROUBLESHOOTING

### Meta Pixel não carrega

**Solução:**
1. Aguardar 2-3 segundos
2. Desativar bloqueador de anúncios
3. Testar em aba anônima
4. Limpar cache do navegador

### FBP não aparece

**Solução:**
1. Verificar cookies no DevTools (Application > Cookies)
2. Aguardar Meta Pixel carregar
3. Recarregar página

### Webhook retorna erro 401

**Solução:**
1. Verificar secret no `.env.local`
2. Secret correto: `12f4848f-35e9-41a8-8da4-1032642e3e89`

### Eventos não aparecem no Meta

**Solução:**
1. Verificar Test Event Code: `TEST60998`
2. Aguardar 30-60 segundos
3. Filtrar corretamente no Meta Events Manager

---

## 📚 DOCUMENTAÇÃO COMPLETA

Para guia detalhado, ver:
- **[GUIA-TESTES-COMPLETO.md](./GUIA-TESTES-COMPLETO.md)** - Guia completo de 20-30 minutos

---

## ✅ CRITÉRIOS DE SUCESSO

Sistema está OK se:

- ✅ Meta Pixel carrega (< 3s)
- ✅ FBP é capturado
- ✅ Eventos disparam sem erros
- ✅ Webhook responde (< 200ms)
- ✅ APIs retornam sucesso
- ✅ Quality Score > 9.0 no Meta
- ✅ Sem erros no console

---

## 🎉 TUDO PASSOU?

**Próximos passos:**

1. ✅ Deploy na Vercel
2. ✅ Configurar variáveis de ambiente
3. ✅ Testar em produção
4. ✅ Remover Test Event Code
5. ✅ Monitorar conversões reais

---

**Última atualização**: 02/11/2025  
**Tempo estimado**: 5 minutos (rápido) | 30 minutos (completo)
