/**
 * Exemplo de URL com parâmetros do Facebook
 * Compatível com sua estrutura atual
 */

// Seus parâmetros atuais:
// utm_source=FB&utm_campaign={{campaign.name}}|{{campaign.id}}&utm_medium={{adset.name}}|{{adset.id}}&utm_content={{ad.name}}|{{ad.id}}&utm_term={{placement}}

// Exemplo real de URL com dados substituídos:
const exampleURL = "https://seusite.com.br/?utm_source=FB&utm_campaign=Sistema 4 Fases V2|123456789&utm_medium=Homem 25-45 São Paulo|987654321&utm_content=Vídeo Depoimento Urgente|456789123&utm_term=facebook_feed";

console.log("📊 Exemplo de URL com seus parâmetros:");
console.log(exampleURL);

console.log("\n🎯 Como o sistema interpreta seus dados:");
console.log({
  source: "FB",
  campaign: {
    name: "Sistema 4 Fases V2",
    id: "123456789",
    full: "Sistema 4 Fases V2|123456789"
  },
  medium: {
    name: "Homem 25-45 São Paulo",
    id: "987654321", 
    full: "Homem 25-45 São Paulo|987654321"
  },
  content: {
    name: "Vídeo Depoimento Urgente",
    id: "456789123",
    full: "Vídeo Depoimento Urgente|456789123"
  },
  term: "facebook_feed",
  placement: "facebook_feed"
});

console.log("\n🚀 Dados enviados para o Meta:");
console.log({
  campaign_name: "Sistema 4 Fases V2",
  campaign_id: "123456789",
  adset_name: "Homem 25-45 São Paulo", 
  adset_id: "987654321",
  ad_name: "Vídeo Depoimento Urgente",
  ad_id: "456789123",
  placement: "facebook_feed",
  campaign_type: "sales", // detectado automaticamente
  ad_format: "video", // detectado automaticamente
  targeting_type: "demographic", // detectado automaticamente
  audience_segment: "general", // detectado automaticamente
  creative_type: "depoimento", // detectado automaticamente
  objective_type: "purchase" // detectado automaticamente
});

export { exampleURL };