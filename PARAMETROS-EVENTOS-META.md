# 📊 PARÂMETROS COMPLETOS DOS EVENTOS META

**Data:** 31 de outubro de 2025  
**Eventos Analisados:** InitiateCheckout e Purchase

---

## 🛒 INITIATECHECKOUT - PARÂMETROS COMPLETOS

### 1. USER_DATA (9 campos - hasheados SHA-256)

```json
{
  "em": "hash_sha256_email",
  "ph": "hash_sha256_phone_55XXXXXXXXXX",
  "fn": "hash_sha256_first_name",
  "ln": "hash_sha256_last_name",
  "ct": "hash_sha256_city",
  "st": "hash_sha256_state",
  "zip": "hash_sha256_cep",
  "country": "hash_sha256_br",
  "external_id": "sess_timestamp_random",
  "client_ip_address": "xxx.xxx.xxx.xxx",
  "client_timezone": "America/Sao_Paulo",
  "client_isp": "Nome do ISP",
  "client_info_source": "api_enrichment"
}
```

**Total:** 13 campos de user_data

---

### 2. ENRIQUECIMENTO AVANÇADO (30+ campos)

#### 🎯 Facebook Ads Data
```json
{
  "campaign_name": "nome_da_campanha_ou_unknown",
  "campaign_id": "id_da_campanha_ou_unknown",
  "adset_name": "nome_do_conjunto_ou_unknown",
  "adset_id": "id_do_conjunto_ou_unknown",
  "ad_name": "nome_do_anuncio_ou_unknown",
  "ad_id": "id_do_anuncio_ou_unknown",
  "placement": "facebook_feed_ou_unknown",
  "campaign_type": "tipo_ou_unknown",
  "ad_format": "formato_ou_unknown",
  "targeting_type": "tipo_segmentacao_ou_unknown",
  "audience_segment": "general",
  "creative_type": "standard",
  "objective_type": "awareness"
}
```

**Total:** 13 campos de Facebook Ads

#### 🖥️ Device Data
```json
{
  "device_type": "mobile|tablet|desktop",
  "screen_width": 1920,
  "screen_height": 1080,
  "viewport_width": 1920,
  "viewport_height": 1080,
  "pixel_ratio": 1,
  "browser": "chrome|firefox|safari|edge|opera",
  "operating_system": "windows|macos|linux|android|ios",
  "language": "pt-BR",
  "timezone": "America/Sao_Paulo",
  "connection_type": "4g|wifi|unknown"
}
```

**Total:** 11 campos de device

#### ⚡ Performance Data
```json
{
  "page_load_time": 1234,
  "dom_content_loaded": 567,
  "first_contentful_paint": 890
}
```

**Total:** 3 campos de performance

#### 🎯 Session Metadata
```json
{
  "session_start_time": 1730419200000,
  "page_number": 1,
  "user_journey_stage": "awareness",
  "content_language": "pt-BR",
  "market": "BR",
  "platform": "web"
}
```

**Total:** 6 campos de metadata

---

### 3. DADOS COMERCIAIS (InitiateCheckout específico)

```json
{
  "value": 39.90,
  "currency": "BRL",
  "content_ids": ["hacr962", "339591"],
  "content_type": "product",
  "content_name": "Sistema 4 Fases - Ebook Trips",
  "content_category": "digital_product",
  "num_items": 1,
  "checkout_step": 1,
  "payment_method": "digital",
  "predicted_ltv": 159.6,
  "product_availability": "in stock",
  "condition": "new",
  "trigger_type": "button_click",
  "cart_value": 39.9,
  "items_count": 1,
  "cart_operation": "add_to_cart",
  "checkout_url": "https://maracujazeropragas.com/",
  "payment_method_available": ["credit_card", "pix"]
}
```

**Total:** 18 campos comerciais

---

### 4. DADOS ADICIONAIS (passados via customParams)

```json
{
  "checkout_step": 1,
  "payment_method_available": ["credit_card", "pix"],
  "num_items": 1,
  "delivery_type": "digital_download",
  "order_type": "online_purchase",
  "product_category": "digital_guide",
  "user_engagement_time": 120,
  "form_completion_time": 30,
  "checkout_type": "modal_redirect"
}
```

**Total:** 9 campos adicionais

---

### 5. METADADOS DO EVENTO

```json
{
  "event_id": "evt_base123_InitiateCheckout",
  "event_source_url": "https://maracujazeropragas.com/",
  "event_time": 1730419200,
  "action_source": "website"
}
```

**Total:** 4 campos de metadados

---

## 📊 RESUMO InitiateCheckout

| Categoria | Quantidade |
|-----------|------------|
| User Data | 13 campos |
| Facebook Ads | 13 campos |
| Device Data | 11 campos |
| Performance | 3 campos |
| Session Metadata | 6 campos |
| Comerciais | 18 campos |
| Custom Params | 9 campos |
| Event Metadata | 4 campos |
| **TOTAL** | **77 PARÂMETROS** |

---

---

## 💰 PURCHASE - PARÂMETROS COMPLETOS

### 1. USER_DATA (13 campos - hasheados SHA-256)

```json
{
  "em": "hash_sha256_email",
  "ph": "hash_sha256_phone_55XXXXXXXXXX",
  "fn": "hash_sha256_first_name",
  "ln": "hash_sha256_last_name",
  "ct": "hash_sha256_city",
  "st": "hash_sha256_state",
  "zp": "hash_sha256_cep",
  "country": "hash_sha256_br",
  "external_id": "transaction_id_ou_cakto_timestamp",
  "client_ip_address": null,
  "client_user_agent": "Cakto-Webhook/3.1-enterprise-unified-server"
}
```

**Total:** 11 campos de user_data

**Fonte dos dados:**
- Prioridade 1: Banco de dados (busca por email/phone do lead)
- Prioridade 2: API de geolocalização (ip-api.com)
- Fallback: Dados padrão (São Paulo, SP)

---

### 2. CUSTOM_DATA - DADOS COMERCIAIS (71 campos!)

#### 📦 Básicos Obrigatórios
```json
{
  "currency": "BRL",
  "value": 39.90,
  "content_ids": ["hacr962"],
  "content_name": "Sistema 4 Fases - Ebook Trips",
  "content_type": "product",
  "transaction_id": "id_transacao_cakto"
}
```

**Total:** 6 campos básicos

#### 🏷️ Categorização Avançada
```json
{
  "content_category": "digital_product",
  "content_category2": "agricultura",
  "content_category3": "pragas",
  "content_category4": "sistema_4_fases",
  "content_category5": "maracuja"
}
```

**Total:** 5 campos de categoria

#### 📦 Detalhes do Produto
```json
{
  "brand": "Maracujá Zero Pragas",
  "description": "Sistema completo para eliminação de trips no maracujazeiro",
  "availability": "in stock",
  "condition": "new",
  "quantity": 1
}
```

**Total:** 5 campos de produto

#### 💰 Preço e Promoções (DINÂMICO)
```json
{
  "price": 39.90,
  "compare_at_price": 159.60,
  "discount_percentage": 75,
  "coupon": ""
}
```

**Total:** 4 campos de preço

#### 🎁 Order Bump Detection (AUTOMÁTICO)
```json
{
  "order_bump_detected": false,
  "base_product_value": 39.90,
  "bump_value": 0,
  "total_items": 1
}
```

**Nota:** Se `value > 43.89` (10% acima do base):
- `order_bump_detected: true`
- `base_product_value: 39.90`
- `bump_value: valor_total - 39.90`
- `total_items: 2`

**Total:** 4 campos de order bump

#### 🚚 Métodos de Entrega
```json
{
  "delivery_category": "home_delivery",
  "shipping_tier": "next_day",
  "estimated_delivery_date": "2025-11-01"
}
```

**Total:** 3 campos de entrega

#### 💳 Métodos de Pagamento
```json
{
  "payment_method": "credit_card|pix|boleto",
  "payment_method_type": "credit_card|instant_transfer"
}
```

**Total:** 2 campos de pagamento

#### 🏷️ Detalhes da Oferta
```json
{
  "offer_id": "hacr962",
  "product_short_id": "hacr962",
  "variant": "full_price|pix_discount"
}
```

**Total:** 3 campos de oferta

#### 👥 Segmentação de Cliente (DINÂMICO)
```json
{
  "customer_type": "web",
  "customer_segment": "standard|premium|premium_plus",
  "customer_lifetime_value": 139.65
}
```

**Segmentação:**
- `amount > 100` → `premium_plus`
- `amount > 43.89` (order bump) → `premium`
- Outros → `standard`

**Total:** 3 campos de segmentação

#### 🎯 Dados de Campanha
```json
{
  "utm_source": "organic",
  "utm_medium": "web",
  "utm_campaign": "sistema_4_fases_v2",
  "utm_content": "checkout_complete",
  "utm_term": "compra_concluida"
}
```

**Total:** 5 campos de campanha

#### 🔧 Metadados do Evento
```json
{
  "event_source": "cakto_webhook",
  "event_version": "3.1-enterprise-unified-server",
  "processing_time_ms": 150,
  "webhook_id": "req_timestamp_random",
  "data_validation_source": "database_lead|api_geolocation",
  "user_data_system": "complete_structure_like_other_events"
}
```

**Total:** 6 campos de metadados

#### 📈 Dados de Qualidade (DINÂMICO)
```json
{
  "lead_type": "purchase",
  "predicted_ltv": 598.50,
  "order_type": "new_customer",
  "first_purchase": true,
  "average_order_value": 39.90,
  "purchase_frequency": "single"
}
```

**Total:** 6 campos de qualidade

#### 🖥️ Dados Técnicos
```json
{
  "browser_platform": "web",
  "device_type": "desktop",
  "user_agent": "Cakto-Webhook/3.1-enterprise-unified-server"
}
```

**Total:** 3 campos técnicos

#### ✅ Dados de Conformidade
```json
{
  "gdpr_consent": true,
  "ccpa_consent": true,
  "data_processing_consent": true
}
```

**Total:** 3 campos de conformidade

#### 📊 Dados de Análise
```json
{
  "checkout_step": "completed",
  "funnel_stage": "conversion",
  "conversion_value": 39.90,
  "micro_conversion": false
}
```

**Total:** 4 campos de análise

#### 🌾 Dados de Produto Específicos (Agricultura)
```json
{
  "crop_type": "maracuja",
  "pest_type": "trips",
  "solution_type": "sistema_4_fases",
  "application_method": "spray",
  "treatment_area": "1_hectare"
}
```

**Total:** 5 campos específicos do produto

#### 🆘 Dados de Suporte
```json
{
  "support_email": "suporte@maracujazeropragas.com",
  "warranty_days": 30,
  "guarantee_type": "money_back"
}
```

**Total:** 3 campos de suporte

#### 👥 Dados de Comunidade
```json
{
  "community_access": true,
  "tutorial_included": true,
  "video_guide": true,
  "pdf_manual": true
}
```

**Total:** 4 campos de comunidade

#### 🎁 Dados de Bônus (DINÂMICO)
```json
{
  "bonus_items": 3,
  "bonus_value": 200,
  "total_package_value": 239.90
}
```

**Nota:** Se `amount > 50` (Order Bump):
- `bonus_items: 5`
- `bonus_value: 300`
- `total_package_value: amount + 300`

**Total:** 3 campos de bônus

#### ⏰ Dados de Urgência
```json
{
  "scarcity_factor": "limited_time",
  "urgency_level": "medium",
  "deadline_hours": 24
}
```

**Total:** 3 campos de urgência

#### ⭐ Dados de Prova Social
```json
{
  "social_proof_count": 1247,
  "rating_average": 4.8,
  "review_count": 342
}
```

**Total:** 3 campos de prova social

#### 🧪 Dados de Otimização
```json
{
  "test_variant": "control",
  "ab_test_id": "cakto_migration_test",
  "optimization_score": 9.8
}
```

**Total:** 3 campos de otimização

---

### 3. METADADOS DO EVENTO

```json
{
  "event_name": "Purchase",
  "event_id": "Purchase_timestamp_random",
  "event_time": 1730419200,
  "action_source": "website",
  "event_source_url": "https://maracujazeropragas.com/"
}
```

**Total:** 5 campos de metadados

---

### 4. METADATA AVANÇADO (API Request Level)

```json
{
  "access_token": "TOKEN_META",
  "test_event_code": "",
  "debug_mode": false,
  "partner_agent": "cakto_webhook_v3.1-enterprise-unified-server",
  "namespace": "maracujazeropragas",
  "upload_tag": "cakto_purchase_unified_server",
  "data_processing_options": ["LDU"],
  "data_processing_options_country": 1,
  "data_processing_options_state": 1000
}
```

**Total:** 9 campos de metadata

---

## 📊 RESUMO Purchase

| Categoria | Quantidade |
|-----------|------------|
| User Data | 11 campos |
| Básicos | 6 campos |
| Categorização | 5 campos |
| Produto | 5 campos |
| Preço | 4 campos |
| Order Bump | 4 campos |
| Entrega | 3 campos |
| Pagamento | 2 campos |
| Oferta | 3 campos |
| Segmentação | 3 campos |
| Campanha | 5 campos |
| Metadados Evento | 6 campos |
| Qualidade | 6 campos |
| Técnicos | 3 campos |
| Conformidade | 3 campos |
| Análise | 4 campos |
| Produto Específico | 5 campos |
| Suporte | 3 campos |
| Comunidade | 4 campos |
| Bônus | 3 campos |
| Urgência | 3 campos |
| Prova Social | 3 campos |
| Otimização | 3 campos |
| Event Metadata | 5 campos |
| API Metadata | 9 campos |
| **TOTAL** | **109 PARÂMETROS** |

---

## 🔍 COMPARATIVO

| Evento | Total Parâmetros | User Data | Custom Data | Enriquecimento |
|--------|------------------|-----------|-------------|----------------|
| **InitiateCheckout** | **77** | 13 | 18 | 46 |
| **Purchase** | **109** | 11 | 71 | 27 |

---

## 🎯 PARÂMETROS DINÂMICOS (Calculados Automaticamente)

### InitiateCheckout
- `value` - do `PRODUCT_CONFIG.BASE_PRICE`
- `predicted_ltv` - `BASE_PRICE * 3.5`
- `campaign_name` - parsed da URL do Facebook
- `device_type` - detectado do user agent
- `browser` - detectado do user agent
- `page_load_time` - medido em tempo real

### Purchase
- `value` - do webhook Cakto
- `customer_segment` - baseado no valor da compra
- `order_bump_detected` - se `value > BASE_PRICE * 1.1`
- `base_product_value` - calculado se tiver order bump
- `bump_value` - calculado se tiver order bump
- `total_items` - 2 se order bump, 1 se não
- `customer_lifetime_value` - `BASE_PRICE * 3.5` (LTV)
- `predicted_ltv` - `value * 15`
- `bonus_items` - 5 se order bump, 3 se não
- `bonus_value` - 300 se order bump, 200 se não
- `payment_method_type` - baseado em `payment_method`

---

## 📋 PARÂMETROS HASHEADOS (SHA-256)

Todos estes são hasheados antes de enviar:

```
em (email)
ph (phone com código país 55)
fn (first name)
ln (last name)
ct (city)
st (state)
zip/zp (cep)
country (sempre 'br')
```

**Exemplo:**
```
email: joao@email.com
↓ hash SHA-256
em: "1a2b3c4d5e6f7g8h9i0j..."
```

---

## 🔗 CORRELAÇÃO DE EVENTOS

### Event ID Format

**InitiateCheckout:**
```
evt_base123_InitiateCheckout
```

**Purchase:**
```
Purchase_timestamp_random
```

**Nota:** Purchase não usa o ID base correlacionado porque tem transaction_id único da Cakto.

---

## 💡 OBSERVAÇÕES IMPORTANTES

### InitiateCheckout

1. ✅ **User data completo** (13 campos incluindo geolocalização)
2. ✅ **Enriquecimento avançado** (Facebook Ads parsing)
3. ✅ **Device detection** completo
4. ✅ **Performance metrics** incluídos
5. ✅ **Event ID correlacionado** com outros eventos

### Purchase

1. ✅ **User data validado** (busca no banco + API fallback)
2. ✅ **71 campos de custom_data** (mais completo)
3. ✅ **Order Bump detection** automático
4. ✅ **Segmentação dinâmica** de cliente
5. ✅ **Dados específicos** do produto (agricultura)
6. ✅ **Bônus dinâmicos** baseados no valor
7. ✅ **Prova social** e urgência incluídos

---

## 🎓 COMO USAR ESTA DOCUMENTAÇÃO

### Para Debugging
```javascript
// Ver parâmetros no console
console.log('InitiateCheckout params:', params);
console.log('Purchase params:', purchaseEvent);
```

### Para Testar no Meta Events Manager
1. Acesse: https://business.facebook.com/events_manager2
2. Vá em "Test Events"
3. Dispare eventos
4. Verifique todos os parâmetros listados aqui

### Para Modificar Parâmetros
- **Valores fixos:** Altere em `src/config/product.ts`
- **InitiateCheckout:** Modifique em `src/lib/meta-pixel-definitivo.ts` (linha 530)
- **Purchase:** Modifique em `src/app/api/webhook-cakto/route.ts` (linha 240)

---

**📊 Documentação completa e precisa dos parâmetros**  
*Atualizada em: 31/10/2025*  
*Baseada no código atual do sistema*
