# 🚀 INSTRUÇÕES DE DEPLOY - Sistema FBP/FBC

**IMPORTANTE:** Siga estes passos EXATAMENTE nesta ordem!

---

## 📋 PASSOS OBRIGATÓRIOS

### 1️⃣ Migrar Banco de Dados

**O que faz:** Adiciona os novos campos `fbp`, `fbc`, `fbpCapturedAt`, `fbcCapturedAt` na tabela `LeadUserData`.

```bash
cd /workspace
npx prisma migrate dev --name add_fbp_fbc
```

**Saída esperada:**
```
✔ Generated Prisma Client
✔ Applied migration: add_fbp_fbc
```

---

### 2️⃣ Reiniciar Servidor

```bash
# Se estiver rodando localmente
npm run dev

# Se estiver em produção
# Deploy para seu servidor (Vercel, AWS, etc.)
```

---

### 3️⃣ Testar Fluxo Completo

#### Teste 1: Verificar Meta Pixel
```javascript
// No console do navegador (página principal)
// Verificar se Meta Pixel está carregado
document.cookie.split(';').find(c => c.includes('_fbp'))
// Deve retornar algo como: "_fbp=fb.1.1730419200.1234567890"
```

#### Teste 2: Preencher Formulário
1. Abrir página principal do site
2. Preencher formulário com DADOS REAIS (não teste@teste.com)
3. Verificar console:
   ```
   🔍 Capturando FBP e FBC do Meta Pixel...
   ✅ FBP/FBC capturados: { fbp: 'Presente', fbc: '...' }
   💾 Salvando lead no banco com FBP/FBC...
   ✅ Lead salvo no banco com sucesso
   ```

#### Teste 3: Verificar Banco
```bash
# No terminal
npx prisma studio
```

1. Abrir tabela `LeadUserData`
2. Procurar pelo email que você usou
3. Verificar campos:
   - `fbp`: Deve ter valor (fb.1.xxx.yyy)
   - `fbc`: Pode estar vazio (se não veio de anúncio)
   - `fbpCapturedAt`: Deve ter data/hora

#### Teste 4: Simular Compra (Teste Real ou Mock)

**Opção A: Compra Real (Recomendado)**
1. Fazer compra real na Cakto
2. Verificar logs do servidor quando webhook chegar
3. Procurar:
   ```
   ✅ DADOS DO BANCO DE DADOS ENCONTRADOS!
   🎯 FBP: ✅ Presente
   🔐 HASHES SUA ESTRUTURA SHA256:
   fbp: fb.1.xxx.yyy
   ```

**Opção B: Teste com Event Test (Desenvolvimento)**
1. Ir para Meta Events Manager
2. Ativar "Test Events"
3. Copiar código de teste
4. Fazer fluxo completo
5. Verificar eventos no Test Events

#### Teste 5: Página /obrigado
1. Após compra, chegar na página /obrigado
2. Verificar console:
   ```
   🎯 DISPARO CLIENT-SIDE DE PURCHASE (para FBP/FBC)
   ✅ FBP capturado: Presente
   ✅ FBC capturado: Presente (anúncio)
   ✅ Purchase client-side disparado com FBP/FBC!
   🔄 Meta fará deduplicação automática com webhook
   ```

---

## ✅ VALIDAÇÃO FINAL

### No Meta Events Manager

1. Acessar: https://business.facebook.com/events_manager2
2. Selecionar Pixel ID: **642933108377475**
3. Ir em **Overview** ou **Test Events**
4. Encontrar evento **Purchase**
5. Verificar:

```
✅ event_name: Purchase
✅ event_id: Purchase_timestamp_random
✅ user_data:
   ✅ em: hash presente
   ✅ ph: hash presente
   ✅ fbp: fb.1.xxx.yyy (PRESENTE!)
   ✅ fbc: fb.1.xxx.yyy ou null
✅ custom_data:
   ✅ value: 39.90
   ✅ currency: BRL
   ✅ transaction_id: presente

✅ Event Score: 9.3-9.5/10 (AUMENTOU!)
```

---

## 🐛 TROUBLESHOOTING

### Problema: "fbp is not defined" no banco

**Causa:** Migração não foi executada

**Solução:**
```bash
npx prisma migrate dev --name add_fbp_fbc
npx prisma generate
```

---

### Problema: FBP não é capturado no formulário

**Causa 1:** Meta Pixel não está carregado

**Solução:** Verificar se `MetaPixelDefinitivo.tsx` está sendo renderizado

**Causa 2:** Bloqueador de anúncios

**Solução:** Desabilitar bloqueador de anúncios para teste

---

### Problema: FBP está null no webhook

**Causa 1:** Lead não foi salvo no banco

**Solução:** Verificar se API `/api/lead-capture` está funcionando

**Causa 2:** Email/phone não batem

**Solução:** Webhook busca por email OU phone. Verificar se dados são os mesmos.

---

### Problema: Purchase duplicado (2 conversões)

**Causa:** event_id diferentes

**Solução:** Verificar se os IDs são EXATAMENTE iguais:
```javascript
// Webhook
event_id: "Purchase_12345_abc"

// Browser
event_id: "Purchase_12345_abc"  // MESMO!
```

---

### Problema: Quality Score ainda baixo

**Causa 1:** Aguardar 24-48h

**Solução:** Meta demora para processar e recalcular score

**Causa 2:** Dados de teste (test@test.com)

**Solução:** Usar DADOS REAIS para teste

**Causa 3:** FBP/FBC ainda vazios

**Solução:** Verificar se captura está funcionando

---

## 📊 MONITORAMENTO

### Logs a Observar

**No console do navegador (página principal):**
```
✅ FBP/FBC capturados
💾 Lead salvo no banco com sucesso
```

**No console do navegador (/obrigado):**
```
🎯 DISPARO CLIENT-SIDE DE PURCHASE
✅ Purchase client-side disparado com FBP/FBC!
```

**Nos logs do servidor (webhook):**
```
✅ DADOS DO BANCO DE DADOS ENCONTRADOS!
🎯 FBP: ✅ Presente
🎯 FBC: ✅ Presente (anúncio)
```

---

## 🎯 RESULTADO ESPERADO

### ANTES vs DEPOIS

| Métrica | Antes | Depois |
|---------|-------|--------|
| Quality Score | 7.6/10 | 9.5+/10 |
| FBP no Purchase | ❌ Ausente | ✅ Presente |
| FBC no Purchase | ❌ Ausente | ✅ Presente |
| ROAS Correto | ❌ Não | ✅ Sim |
| Correlação Lead→Purchase | ⚠️ Parcial | ✅ Total |

---

## 🆘 SUPORTE

Se algo não funcionar:

1. **Verificar migração do banco:**
   ```bash
   npx prisma migrate status
   ```

2. **Verificar se cliente Prisma foi gerado:**
   ```bash
   npx prisma generate
   ```

3. **Verificar logs:**
   - Console do navegador
   - Logs do servidor
   - Meta Events Manager

4. **Testar isoladamente:**
   - Captura de FBP/FBC (console)
   - Salvamento no banco (Prisma Studio)
   - Webhook (logs)
   - Disparo browser (console /obrigado)

---

**🎉 Boa sorte com o deploy!**

**Nota esperada após 24-48h: 9.5+/10** ✅
