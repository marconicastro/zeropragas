// ✅ ESTRATÉGIA SEGURA - DADOS NA URL VS BACKUP INTELIGENTE

// ❌ NÃO FAÇA ISSO (URL insegura):
const insecureUrl = `https://go.allpes.com.br/r1wl4qyyfv?
  name=MARCONI+AUGUSTO+DE+CASTRO&
  email=marconi.castro.mc@gmail.com&
  phone=77998276042&
  success_url=https://preview-chat-d9ccdab3-710e-4b4a-b80f-92ba1dcc246c.space.z.ai/obrigado`;

// ✅ FAÇA ISSO (URL segura mínima):
const secureUrl = `https://go.allpes.com.br/r1wl4qyyfv?
  session_id=sess_1761654854663_gnnr2&
  product_id=339591&
  value=39.90&
  currency=BRL&
  source=maracujazeropragas`;

// ✅ DADOS COMPLETOS NO BACKUP (localStorage + Server-side):
const secureDataBackup = {
  // Dados PESSOAIS (protegidos)
  personal_data: {
    name: "MARCONI AUGUSTO DE CASTRO",
    email: "marconi.castro.mc@gmail.com",
    phone: "77998276042",
    phone_formatted: "(77) 99827-6042"
  },
  
  // Identificadores para cross-reference
  tracking_ids: {
    user_id: "user_1761654854663_gnnr2",
    session_id: "sess_1761654854663_gnnr2",
    event_id: "InitiateCheckout_1761654854663_gnnr2",
    timestamp: 1761654854663
  },
  
  // Dados comerciais
  commercial_data: {
    product_id: "339591",
    product_name: "Sistema 4 Fases - Ebook Trips",
    value: 39.90,
    currency: "BRL"
  },
  
  // URLs CORRETAS de produção
  urls: {
    success_url: "https://seudominio.com/obrigado",
    cancel_url: "https://seudominio.com/checkout"
  },
  
  // Metadados
  metadata: {
    source: "maracujazeropragas",
    campaign: "sistema_4_fases_v2",
    quality_score: "9.3",
    server_event_uri: "https://capig.maracujazeropragas.com/"
  }
};

// 💾 Salvar de forma segura:
localStorage.setItem('userCheckoutData', JSON.stringify(secureDataBackup));

// 🔄 Recuperar no backend:
app.post('/webhook/purchase', (req, res) => {
  const sessionId = req.body.session_id;
  const userData = getUserDataFromSession(sessionId); // Busca do banco
  // Processar pagamento com dados completos
});