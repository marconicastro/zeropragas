# 🩺 GTM Diagnosis Checklist

## ✅ Verificações Imediatas

### 1. Web GTM (GTM-WPDKD23S)
- [ ] Container está publicado?
- [ ] Tags estão ativas?
- [ ] Triggers configurados corretamente?
- [ ] DataLayer está populado?

### 2. Server GTM (GTM-PVHVLNR9)
- [ ] Container está publicado?
- [ ] Endpoint está acessível?
- [ ] Tags server estão ativas?
- [ ] Clientes configurados?

### 3. Conexão Web→Server
- [ ] Web GTM está enviando para server?
- [ ] Formato dos dados está correto?
- [ ] Autenticação está funcionando?

## 🚨 Problemas Comuns

### A. "Tags Desaparecidas"
**Sintoma:** GTM mostra tags mas "Nenhuma tag foi disparada"
**Causa:** Triggers não estão correspondendo aos eventos
**Solução:** 
1. Verificar nome dos eventos no dataLayer
2. Ajustar triggers para corresponder exatamente
3. Usar debug mode para verificar

### B. Eventos Chegam Mas Não Processam
**Sintoma:** Eventos no dataLayer mas não no Facebook/GA4
**Causa:** Problema no server container
**Solução:**
1. Verificar logs do server container
2. Testar endpoints manualmente
3. Verificar configuração de clientes

### C. Dados Inconsistentes
**Sintoma:** Facebook recebe alguns eventos mas não todos
**Causa:** Formato dos dados ou problemas de deduplicação
**Solução:**
1. Padronizar formato dos eventos
2. Verificar event_id único
3. Ajustar timing dos eventos

## 🔧 Scripts de Teste

### Teste 1: Verificar GTM Load
```javascript
// Console
typeof google_tag_manager !== 'undefined' 
  ? console.log('✅ GTM carregado') 
  : console.log('❌ GTM não carregado');
```

### Teste 2: Enviar Evento Manual
```javascript
// Console
window.dataLayer.push({
  event: 'test_manual',
  test_id: Date.now(),
  source: 'console_test'
});
```

### Teste 3: Verificar Server Endpoint
```javascript
// Console
fetch('https://seu-server-gtm.com/collect', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({test: true})
})
.then(r => r.text())
.then(console.log);
```

## 📊 Análise dos Screenshots

### Problema 1: Inconsistência de Status
- **Observado:** "Disparou 4 vezes" → "Nenhuma tag foi disparada"
- **Provável causa:** Tags sendo triggeradas mas falhando no processamento

### Problema 2: Eventos Perdidos
- **Observado:** Facebook recebe PageView e Iniciar finalização
- **Provável causa:** Apenas alguns eventos estão sendo encaminhados

### Problema 3: Timing
- **Observado:** Eventos aparecem como "Desduplicado/Processado"
- **Provável causa:** Eventos duplicados ou problemas de timing

## 🎯 Ações Imediatas

1. **Ativar Debug Mode** no GTM
2. **Verificar Console** para erros JavaScript
3. **Testar endpoints** manualmente
4. **Revisar triggers** no server container
5. **Verificar logs** do Stape.io

## 📞 Próximos Passos

1. Implementar os scripts de debug acima
2. Coletar logs detalhados
3. Identificar ponto exato de falha
4. Corrigir configuração específica
5. Testar fluxo completo novamente