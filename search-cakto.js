import ZAI from 'z-ai-web-dev-sdk';

async function searchCaktoWebhook() {
  try {
    const zai = await ZAI.create();
    
    const result = await zai.functions.invoke("web_search", {
      query: "Cakto webhook pagamento API documentação integração",
      num: 10
    });

    console.log('=== RESULTADOS DA BUSCA CAKTO ===');
    console.log(JSON.stringify(result, null, 2));
    
    // Buscar também exemplos de webhooks brasileiros
    const result2 = await zai.functions.invoke("web_search", {
      query: "webhook pagamento Brasil Mercado Pago Hotmart MonetizLet API exemplo JSON",
      num: 8
    });
    
    console.log('\n=== WEBHOOKS PAGAMENTO BRASIL (COMPARAÇÃO) ===');
    console.log(JSON.stringify(result2, null, 2));
    
  } catch (error) {
    console.error('Erro na busca:', error.message);
  }
}

searchCaktoWebhook();