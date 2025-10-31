/**
 * 🎯 TIPOS PARA SISTEMA DE ENRIQUECIMENTO
 */

export interface DeviceData {
  device_type: 'mobile' | 'tablet' | 'desktop';
  screen_width: number;
  screen_height: number;
  viewport_width: number;
  viewport_height: number;
  pixel_ratio: number;
  browser: string;
  operating_system: string;
  language: string;
  timezone: string;
  connection_type: string;
}

export interface PerformanceData {
  page_load_time: number;
  dom_content_loaded: number;
  first_contentful_paint: number;
}

export interface FacebookAdsData {
  campaign_name: string;
  campaign_id: string;
  adset_name: string;
  adset_id: string;
  ad_name: string;
  ad_id: string;
  placement: string;
  campaign_type: string;
  ad_format: string;
  targeting_type: string;
  audience_segment: string;
  creative_type: string;
  objective_type: string;
}

export interface SessionData {
  session_start_time: number;
  page_number: number;
  user_journey_stage: string;
  content_language: string;
  market: string;
  platform: string;
}

export interface EnrichmentData extends DeviceData, PerformanceData, FacebookAdsData, SessionData {}
