🧪 **WEBHOOK CAKTO - MODO TESTE ATIVADO COM SUCESSO!** 🧪

## ✅ **Configurações Atualizadas:**

### **1. Modo de Teste Ativado:**
- ✅ `test_event_code: 'TEST'` - Todos os eventos marcados como teste
- ✅ `debug_mode: true` - Debug ativado para detalhamento
- ✅ Dashboard com banner amarelo de aviso

### **2. URLs de Teste:**
- **Webhook:** `http://localhost:3000/api/webhook-cakto`
- **Dashboard:** `http://localhost:3000/api/webhook-cakto/stats?format=html`
- **API JSON:** `http://localhost:3000/api/webhook-cakto/stats`

### **3. Como Validar:**

#### **Opção A: Teste Manual com cURL**
```bash
# Teste Purchase Approved
curl -X POST "http://localhost:3000/api/webhook-cakto" \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "12f4848f-35e9-41a8-8da4-1032642e3e89",
    "event": "purchase_approved",
    "data": {
      "id": "test_validation_001",
      "customer": {
        "name": "Teste Validacao",
        "email": "validacao@teste.com",
        "phone": "11999999999"
      },
      "amount": 39.90,
      "status": "paid",
      "product": {
        "name": "Sistema 4 Fases",
        "short_id": "hacr962"
      },
      "paymentMethod": "pix"
    }
  }'
```

#### **Opção B: Acessar Dashboard**
1. Abra: `http://localhost:3000/api/webhook-cakto/stats?format=html`
2. Verifique o banner amarelo: **"🧪 MODO DE TESTE ATIVADO"**
3. Envie eventos e veja as estatísticas em tempo real

### **4. O que Verificar no Meta Events Manager:**

1. **Acesse:** Meta Business Suite → Events Manager
2. **Filtre por:** Pixel ID `642933108377475`
3. **Procure por:**
   - Eventos marcados como **"Test"**
   - Debug information detalhada
   - Seus dados de teste (email: `validacao@teste.com`)
   - Event ID: `Purchase_xxx_validation_001`

### **5. Logs de Validação:**

No terminal, você verá logs como:
```
✅ MODO TESTE ATIVADO
📤 PURCHASE EVENT ENTERPRISE UNIFIED SERVER
🔐 HASHES SUA ESTRUTURA SHA256
🚀 Enviando para Meta com test_event_code: TEST
```

### **6. Estrutura user_data Completa:**

O webhook está enviando sua estrutura completa:
```json
"user_data": {
  "em": "email_sha256",
  "ph": "phone_sha256", 
  "fn": "name_sha256",
  "ln": "lastname_sha256",
  "ct": "city_sha256",
  "st": "state_sha256",
  "zp": "zip_sha256",
  "country": "br_sha256"
}
```

## 🎯 **Próximos Passos:**

1. **Envie eventos de teste** usando o cURL acima
2. **Verifique o dashboard** em tempo real
3. **Confirme no Meta Events Manager** que os eventos chegam como "Test"
4. **Valide a estrutura user_data** completa
5. **Quando validar**, desative o modo teste

## 🚨 **Para Desativar Modo Teste (Após Validação):**

Altere as linhas no arquivo `/src/app/api/webhook-cakto/route.ts`:
- `test_event_code: 'TEST'` → `test_event_code: ''`
- `debug_mode: true` → `debug_mode: false`

---

**🧪 MODO TESTE ATIVADO - Ready for Validation!** 🧪