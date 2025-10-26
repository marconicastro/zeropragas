# 🎛️ CONTROLE DE BROWSER PIXEL - META PIXEL

## 📋 COMO FUNCIONA

Este sistema permite controlar se os eventos do Meta Pixel são enviados apenas via CAPI Gateway ou via Browser + CAPI (modo híbrido).

## 🔧 CONFIGURAÇÃO

### Arquivo: `.env`
```bash
# MODO HÍBRIDO (PADRÃO) - Browser + CAPI
NEXT_PUBLIC_BROWSER_PIXEL=true

# MODO CAPI-ONLY - Apenas CAPI Gateway
NEXT_PUBLIC_BROWSER_PIXEL=false
```

## 🎯 MODOS DE OPERAÇÃO

### ✅ MODO HÍBRIDO (`NEXT_PUBLIC_BROWSER_PIXEL=true`)
- **Browser Pixel**: ✅ ATIVO
- **CAPI Gateway**: ✅ ATIVO
- **Resultado**: Facebook recebe de ambas as fontes e deduplica

### ❌ MODO CAPI-ONLY (`NEXT_PUBLIC_BROWSER_PIXEL=false`)
- **Browser Pixel**: ❌ INATIVO
- **CAPI Gateway**: ✅ ATIVO
- **Resultado**: Facebook recebe apenas via CAPI Gateway

## 🔄 COMO ALTERAR

### Para desativar Browser Pixel:
1. Edite o arquivo `.env`
2. Mude `NEXT_PUBLIC_BROWSER_PIXEL=true` para `NEXT_PUBLIC_BROWSER_PIXEL=false`
3. Salve o arquivo
4. Reinicie o servidor: `npm run dev`

### Para reativar Browser Pixel:
1. Edite o arquivo `.env`
2. Mude `NEXT_PUBLIC_BROWSER_PIXEL=false` para `NEXT_PUBLIC_BROWSER_PIXEL=true`
3. Salve o arquivo
4. Reinicie o servidor: `npm run dev`

## 📊 O QUE ACONTECE COM CADA MODO

### Eventos Controlados:
- ✅ PageView (padrão)
- ✅ PageViewEnriched
- ✅ ViewContent
- ✅ ScrollDepth
- ✅ CTAClick
- ✅ Lead
- ✅ InitiateCheckout
- ✅ Todos os outros eventos

### Logs no Console:
```javascript
// MODO HÍBRIDO
🌐 Browser Pixel ATIVADO - ViewContent enviado via browser

// MODO CAPI-ONLY
🚫 Browser Pixel DESATIVADO - ViewContent enviado apenas via CAPI Gateway
```

## 🎛️ VANTAGENS DO CAPI-ONLY

### Por que desativar Browser Pixel?
1. **🔒 Dados 100% completos** - Sem limitações de browser
2. **📱 Funciona com ad-blockers** - Usuários com bloqueadores
3. **🌍 Dados geográficos precisos** - IP real do servidor
4. **⚡ Performance melhor** - Menos JavaScript no client
5. **🎯 Controle total** - Você decide exatamente o que enviar

### Por que manter Browser Pixel?
1. **🔄 Redundância** - Se CAPI falhar, browser funciona
2. **📊 Comparação** - Pode analisar diferenças
3. **🛡️ Segurança** - Backup automático
4. **🎯 Padronização** - Funciona como maioria dos sites

## 🚨 CONSIDERAÇÕES

### CAPI Gateway sempre ativo:
- O `server_event_uri` continua configurado
- Todos os eventos ainda chegam ao Facebook via Stape
- Apenas o envio direto do browser é controlado

### Reversibilidade:
- **100% reversível** - Basta mudar a variável de ambiente
- **Sem perda de dados** - CAPI sempre coleta
- **Instantâneo** - Muda na próxima reinicialização

## 🔍 MONITORAMENTE

### Como saber qual modo está ativo:
1. Abra o console do navegador (F12)
2. Procure pelos logs:
   - `🌐 Browser Pixel ATIVADO` = Modo Híbrido
   - `🚫 Browser Pixel DESATIVADO` = Modo CAPI-Only

### Logs de eventos:
```javascript
🎯 Meta Event ENRIQUECIDO COM DADOS REAIS: ViewContent {
  browserPixelEnabled: true,  // ou false
  hasUserData: true,
  // ... outros dados
}
```

## 📞 SUPORTE

### Problemas comuns:
1. **Eventos não chegam**: Verifique se CAPI Gateway está configurado
2. **Mudo não aplica**: Reinicie o servidor após alterar .env
3. **Logs não aparecem**: Verifique console do navegador

### Teste rápido:
1. Acesse a página
2. Abra console (F12)
3. Procure pelos logs de Meta Pixel
4. Verifique se modo está correto

---
**Implementação segura e reversível para controle total do Meta Pixel** 🎛️