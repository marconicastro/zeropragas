/**
 * Adaptador para parâmetros UTM do Facebook
 * Compatível com estrutura: utm_source=FB&utm_campaign={{campaign.name}}|{{campaign.id}}&utm_medium={{adset.name}}|{{adset.id}}&utm_content={{ad.name}}|{{ad.id}}&utm_term={{placement}}
 */

export interface FacebookUTMData {
  source: string;
  campaign: {
    name: string;
    id: string;
    full: string;
  };
  medium: {
    name: string;
    id: string;
    full: string;
  };
  content: {
    name: string;
    id: string;
    full: string;
  };
  term: string;
  placement: string;
}

export class FacebookUTMParser {
  /**
   * Parse dos parâmetros UTM do Facebook
   */
  static parseFacebookUTMs(url: string): FacebookUTMData | null {
    try {
      const urlObj = new URL(url);
      const params = new URLSearchParams(urlObj.search);

      const utmSource = params.get('utm_source');
      const utmCampaign = params.get('utm_campaign');
      const utmMedium = params.get('utm_medium');
      const utmContent = params.get('utm_content');
      const utmTerm = params.get('utm_term');

      if (!utmSource || !utmCampaign || !utmMedium || !utmContent) {
        return null;
      }

      // Parse campaign: "Nome da Campanha|123456789"
      const campaignParts = utmCampaign.split('|');
      const campaign = {
        name: campaignParts[0] || '',
        id: campaignParts[1] || '',
        full: utmCampaign
      };

      // Parse medium: "Nome do Adset|987654321"
      const mediumParts = utmMedium.split('|');
      const medium = {
        name: mediumParts[0] || '',
        id: mediumParts[1] || '',
        full: utmMedium
      };

      // Parse content: "Nome do Anúncio|456789123"
      const contentParts = utmContent.split('|');
      const content = {
        name: contentParts[0] || '',
        id: contentParts[1] || '',
        full: utmContent
      };

      return {
        source: utmSource,
        campaign,
        medium,
        content,
        term: utmTerm || '',
        placement: utmTerm || ''
      };
    } catch (error) {
      console.error('Erro ao parsear UTMs do Facebook:', error);
      return null;
    }
  }

  /**
   * Extrai dados para Meta Events a partir dos UTMs do Facebook
   */
  static extractMetaEventData(utmData: FacebookUTMData) {
    return {
      // Dados para otimização
      campaign_name: utmData.campaign.name,
      campaign_id: utmData.campaign.id,
      adset_name: utmData.medium.name,
      adset_id: utmData.medium.id,
      ad_name: utmData.content.name,
      ad_id: utmData.content.id,
      placement: utmData.placement,
      
      // Dados para análise
      source_platform: utmData.source,
      traffic_source: 'facebook_ads',
      campaign_type: this.detectCampaignType(utmData.campaign.name),
      ad_format: this.detectAdFormat(utmData.content.name),
      targeting_type: this.detectTargetingType(utmData.medium.name),
      
      // Dados para segmentação
      audience_segment: this.extractAudienceSegment(utmData),
      creative_type: this.extractCreativeType(utmData.content.name),
      objective_type: this.extractObjectiveType(utmData.campaign.name)
    };
  }

  /**
   * Detecta tipo de campanha pelo nome
   */
  private static detectCampaignType(campaignName: string): string {
    const name = campaignName.toLowerCase();
    
    if (name.includes('conversão') || name.includes('conversion')) return 'conversion';
    if (name.includes('tráfego') || name.includes('traffic')) return 'traffic';
    if (name.includes('engajamento') || name.includes('engagement')) return 'engagement';
    if (name.includes('alcance') || name.includes('reach')) return 'reach';
    if (name.includes('vendas') || name.includes('sales')) return 'sales';
    if (name.includes('lead')) return 'lead';
    
    return 'unknown';
  }

  /**
   * Detecta formato do anúncio pelo nome
   */
  private static detectAdFormat(adName: string): string {
    const name = adName.toLowerCase();
    
    if (name.includes('video') || name.includes('vídeo')) return 'video';
    if (name.includes('imagem') || name.includes('image')) return 'image';
    if (name.includes('carrossel') || name.includes('carousel')) return 'carousel';
    if (name.includes('coleção') || name.includes('collection')) return 'collection';
    if (name.includes('stories') || name.includes('story')) return 'stories';
    if (name.includes('reels')) return 'reels';
    
    return 'unknown';
  }

  /**
   * Detecta tipo de segmentação pelo nome do adset
   */
  private static detectTargetingType(adsetName: string): string {
    const name = adsetName.toLowerCase();
    
    if (name.includes('lookalike') || name.includes('semelhante')) return 'lookalike';
    if (name.includes('remarketing') || name.includes('retargeting')) return 'retargeting';
    if (name.includes('interesse') || name.includes('interest')) return 'interest';
    if (name.includes('demográfico') || name.includes('demographic')) return 'demographic';
    if (name.includes('comportamento') || name.includes('behavior')) return 'behavior';
    if (name.includes('custom') || name.includes('personalizado')) return 'custom';
    
    return 'broad';
  }

  /**
   * Extrai segmento de audiência
   */
  private static extractAudienceSegment(utmData: FacebookUTMData): string {
    const segments = [];
    
    if (utmData.medium.name.toLowerCase().includes('lookalike')) {
      segments.push('lookalike');
    }
    
    if (utmData.medium.name.toLowerCase().includes('retargeting')) {
      segments.push('retargeting');
    }
    
    if (utmData.content.name.toLowerCase().includes('mobile')) {
      segments.push('mobile');
    }
    
    if (utmData.content.name.toLowerCase().includes('desktop')) {
      segments.push('desktop');
    }
    
    return segments.length > 0 ? segments.join('_') : 'general';
  }

  /**
   * Extrai tipo de criativo
   */
  private static extractCreativeType(adName: string): string {
    const name = adName.toLowerCase();
    
    if (name.includes('dep')) return 'depoimento';
    if (name.includes('urgente') || name.includes('urgency')) return 'urgency';
    if (name.includes('desconto') || name.includes('discount')) return 'discount';
    if (name.includes('bônus') || name.includes('bonus')) return 'bonus';
    if (name.includes('garantia') || name.includes('guarantee')) return 'guarantee';
    
    return 'standard';
  }

  /**
   * Extrai tipo de objetivo
   */
  private static extractObjectiveType(campaignName: string): string {
    const name = campaignName.toLowerCase();
    
    if (name.includes('venda') || name.includes('purchase')) return 'purchase';
    if (name.includes('lead') || name.includes('cadastro')) return 'lead';
    if (name.includes('checkout') || name.includes('iniciar')) return 'initiate_checkout';
    if (name.includes('visualiz') || name.includes('view')) return 'view_content';
    
    return 'awareness';
  }

  /**
   * Gera string de UTM para URLs (compatível com Facebook)
   */
  static generateFacebookUTM(data: {
    source: string;
    campaignName: string;
    campaignId: string;
    adsetName: string;
    adsetId: string;
    adName: string;
    adId: string;
    placement?: string;
  }): string {
    const params = new URLSearchParams({
      utm_source: data.source,
      utm_campaign: `${data.campaignName}|${data.campaignId}`,
      utm_medium: `${data.adsetName}|${data.adsetId}`,
      utm_content: `${data.adName}|${data.adId}`,
      ...(data.placement && { utm_term: data.placement })
    });

    return params.toString();
  }
}