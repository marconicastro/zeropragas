/**
 * 📱 EXTRAÇÃO DE DADOS DO FACEBOOK ADS
 */

import { FacebookUTMParser } from '../facebook-utm-parser';
import type { FacebookAdsData } from './types';

/**
 * Extrai dados do Facebook Ads da URL atual
 */
export function getFacebookAdsData(): FacebookAdsData {
  if (typeof window === 'undefined') {
    return getDefaultFacebookData();
  }
  
  // Extrair UTMs do Facebook
  const facebookUTMs = FacebookUTMParser.parseFacebookUTMs(window.location.href);
  
  if (!facebookUTMs) {
    return getDefaultFacebookData();
  }
  
  // Extrair dados estruturados
  const metaEventData = FacebookUTMParser.extractMetaEventData(facebookUTMs);
  
  return {
    campaign_name: metaEventData.campaign_name || 'unknown',
    campaign_id: metaEventData.campaign_id || 'unknown',
    adset_name: metaEventData.adset_name || 'unknown',
    adset_id: metaEventData.adset_id || 'unknown',
    ad_name: metaEventData.ad_name || 'unknown',
    ad_id: metaEventData.ad_id || 'unknown',
    placement: metaEventData.placement || 'unknown',
    campaign_type: metaEventData.campaign_type || 'unknown',
    ad_format: metaEventData.ad_format || 'unknown',
    targeting_type: metaEventData.targeting_type || 'unknown',
    audience_segment: metaEventData.audience_segment || 'general',
    creative_type: metaEventData.creative_type || 'standard',
    objective_type: metaEventData.objective_type || 'awareness'
  };
}

/**
 * Retorna dados padrão quando não há Facebook Ads
 */
function getDefaultFacebookData(): FacebookAdsData {
  return {
    campaign_name: 'unknown',
    campaign_id: 'unknown',
    adset_name: 'unknown',
    adset_id: 'unknown',
    ad_name: 'unknown',
    ad_id: 'unknown',
    placement: 'unknown',
    campaign_type: 'unknown',
    ad_format: 'unknown',
    targeting_type: 'unknown',
    audience_segment: 'general',
    creative_type: 'standard',
    objective_type: 'awareness'
  };
}
