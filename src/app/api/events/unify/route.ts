import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

// 定义事件数据接口
interface EventData {
  eventName: string;
  eventId: string;
  eventTime: number;
  value?: number;
  currency?: string;
  content_ids?: string[];
  content_type?: string;
  content_name?: string;
  content_category?: string;
  user_data?: any;
  custom_data?: any;
  transaction_id?: string;
  payment_method?: string;
  num_items?: number;
  [key: string]: any;
}

// 生成会话ID
function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 合并事件数据
function mergeEventData(checkoutData: EventData, purchaseData: EventData): EventData {
  const merged: EventData = {
    // 基础事件信息
    eventName: 'Purchase',
    eventId: purchaseData.eventId,
    eventTime: purchaseData.eventTime,
    
    // 从 InitiateCheckout 继承的完整数据
    value: purchaseData.value || checkoutData.value,
    currency: purchaseData.currency || checkoutData.currency,
    content_ids: purchaseData.content_ids || checkoutData.content_ids,
    content_type: purchaseData.content_type || checkoutData.content_type,
    content_name: purchaseData.content_name || checkoutData.content_name,
    content_category: purchaseData.content_category || checkoutData.content_category,
    
    // 用户数据 - 从 InitiateCheckout 继承
    user_data: checkoutData.user_data || {},
    
    // 自定义数据 - 合并两个事件的数据
    custom_data: {
      ...checkoutData.custom_data,
      ...purchaseData.custom_data,
      checkout_step: 'completed',
      purchase_completed: true
    },
    
    // 设备和浏览器信息 - 从 InitiateCheckout 继承
    device_type: checkoutData.device_type,
    screen_width: checkoutData.screen_width,
    screen_height: checkoutData.screen_height,
    viewport_width: checkoutData.viewport_width,
    viewport_height: checkoutData.viewport_height,
    pixel_ratio: checkoutData.pixel_ratio,
    browser: checkoutData.browser,
    operating_system: checkoutData.operating_system,
    language: checkoutData.language,
    timezone: checkoutData.timezone,
    connection_type: checkoutData.connection_type,
    
    // 页面性能数据 - 从 InitiateCheckout 继承
    page_load_time: checkoutData.page_load_time,
    dom_content_loaded: checkoutData.dom_content_loaded,
    first_contentful_paint: checkoutData.first_contentful_paint,
    session_start_time: checkoutData.session_start_time,
    page_number: checkoutData.page_number,
    user_journey_stage: checkoutData.user_journey_stage,
    
    // 营销数据 - 从 InitiateCheckout 继承
    campaign_name: checkoutData.campaign_name,
    campaign_id: checkoutData.campaign_id,
    adset_name: checkoutData.adset_name,
    adset_id: checkoutData.adset_id,
    ad_name: checkoutData.ad_name,
    ad_id: checkoutData.ad_id,
    placement: checkoutData.placement,
    campaign_type: checkoutData.campaign_type,
    ad_format: checkoutData.ad_format,
    targeting_type: checkoutData.targeting_type,
    audience_segment: checkoutData.audience_segment,
    creative_type: checkoutData.creative_type,
    objective_type: checkoutData.objective_type,
    
    // 产品和市场数据 - 从 InitiateCheckout 继承
    content_language: checkoutData.content_language,
    market: checkoutData.market,
    platform: checkoutData.platform,
    event_source_url: checkoutData.event_source_url,
    action_source: checkoutData.action_source,
    
    // 购买特有数据
    transaction_id: purchaseData.transaction_id,
    payment_method: purchaseData.payment_method,
    num_items: purchaseData.num_items || checkoutData.num_items,
    predicted_ltv: purchaseData.predicted_ltv || checkoutData.predicted_ltv,
    condition: purchaseData.condition || checkoutData.condition,
    availability: purchaseData.availability || checkoutData.availability,
    
    // 额外的购买相关数据
    cart_value: purchaseData.value || checkoutData.value,
    items_count: purchaseData.num_items || checkoutData.num_items,
    checkout_url: checkoutData.checkout_url,
    payment_method_available: checkoutData.payment_method_available,
    
    // 合并时间戳
    checkout_initiated_time: checkoutData.eventTime,
    purchase_completed_time: purchaseData.eventTime,
    time_to_purchase: purchaseData.eventTime - checkoutData.eventTime
  };
  
  return merged;
}

// 保存 InitiateCheckout 到数据库
async function saveInitiateCheckout(sessionId: string, eventData: EventData) {
  try {
    const checkoutSession = await db.checkoutSession.create({
      data: {
        sessionId,
        status: 'pending',
        initiateEventId: eventData.eventId,
        initiateEventTime: eventData.eventTime,
        initiateValue: eventData.value,
        initiateCurrency: eventData.currency,
        initiateContentIds: JSON.stringify(eventData.content_ids || []),
        initiateContentType: eventData.content_type,
        initiateContentName: eventData.content_name,
        initiateContentCategory: eventData.content_category,
        initiateUserData: JSON.stringify(eventData.user_data || {}),
        initiateCustomData: JSON.stringify(eventData.custom_data || {}),
        initiateClientInfo: JSON.stringify({
          device_type: eventData.device_type,
          screen_width: eventData.screen_width,
          screen_height: eventData.screen_height,
          viewport_width: eventData.viewport_width,
          viewport_height: eventData.viewport_height,
          pixel_ratio: eventData.pixel_ratio,
          browser: eventData.browser,
          operating_system: eventData.operating_system,
          language: eventData.language,
          timezone: eventData.timezone,
          connection_type: eventData.connection_type
        }),
        initiateUTMData: JSON.stringify({
          campaign_name: eventData.campaign_name,
          campaign_id: eventData.campaign_id,
          adset_name: eventData.adset_name,
          adset_id: eventData.adset_id,
          ad_name: eventData.ad_name,
          ad_id: eventData.ad_id,
          placement: eventData.placement,
          campaign_type: eventData.campaign_type,
          ad_format: eventData.ad_format,
          targeting_type: eventData.targeting_type,
          audience_segment: eventData.audience_segment,
          creative_type: eventData.creative_type,
          objective_type: eventData.objective_type
        }),
        initiatePerformanceData: JSON.stringify({
          page_load_time: eventData.page_load_time,
          dom_content_loaded: eventData.dom_content_loaded,
          first_contentful_paint: eventData.first_contentful_paint,
          session_start_time: eventData.session_start_time,
          page_number: eventData.page_number,
          user_journey_stage: eventData.user_journey_stage
        }),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小时后过期
      }
    });

    // 同时保存到 UnifiedEvent 表
    await db.unifiedEvent.create({
      data: {
        eventId: eventData.eventId,
        eventName: eventData.eventName,
        eventType: 'InitiateCheckout',
        sessionId: sessionId,
        eventTime: eventData.eventTime,
        value: eventData.value,
        currency: eventData.currency,
        contentIds: JSON.stringify(eventData.content_ids || []),
        contentType: eventData.content_type,
        contentName: eventData.content_name,
        contentCategory: eventData.content_category,
        userData: JSON.stringify(eventData.user_data || {}),
        customData: JSON.stringify(eventData.custom_data || {}),
        deviceType: eventData.device_type,
        screenWidth: eventData.screen_width,
        screenHeight: eventData.screen_height,
        viewportWidth: eventData.viewport_width,
        viewportHeight: eventData.viewport_height,
        pixelRatio: eventData.pixel_ratio,
        browser: eventData.browser,
        operatingSystem: eventData.operating_system,
        language: eventData.language,
        timezone: eventData.timezone,
        connectionType: eventData.connection_type,
        pageLoadTime: eventData.page_load_time,
        domContentLoaded: eventData.dom_content_loaded,
        firstContentfulPaint: eventData.first_contentful_paint,
        sessionStartTime: eventData.session_start_time,
        pageNumber: eventData.page_number,
        userJourneyStage: eventData.user_journey_stage,
        campaignName: eventData.campaign_name,
        campaignId: eventData.campaign_id,
        adsetName: eventData.adset_name,
        adsetId: eventData.adset_id,
        adName: eventData.ad_name,
        adId: eventData.ad_id,
        placement: eventData.placement,
        campaignType: eventData.campaign_type,
        adFormat: eventData.ad_format,
        targetingType: eventData.targeting_type,
        audienceSegment: eventData.audience_segment,
        creativeType: eventData.creative_type,
        objectiveType: eventData.objective_type,
        contentLanguage: eventData.content_language,
        market: eventData.market,
        platform: eventData.platform,
        eventSourceUrl: eventData.event_source_url,
        actionSource: eventData.action_source
      }
    });

    return checkoutSession;
  } catch (error) {
    console.error('Error saving InitiateCheckout:', error);
    throw error;
  }
}

// 更新 Purchase 到数据库
async function updatePurchase(sessionId: string, purchaseData: EventData, unifiedData: EventData) {
  try {
    // 更新 CheckoutSession
    const updatedSession = await db.checkoutSession.update({
      where: { sessionId },
      data: {
        status: 'completed',
        purchaseEventId: purchaseData.eventId,
        purchaseEventTime: purchaseData.eventTime,
        purchaseTransactionId: purchaseData.transaction_id,
        purchasePaymentMethod: purchaseData.payment_method,
        purchaseCustomData: JSON.stringify(purchaseData.custom_data || {}),
        unifiedEventData: JSON.stringify(unifiedData)
      }
    });

    // 保存 Purchase 事件到 UnifiedEvent
    await db.unifiedEvent.create({
      data: {
        eventId: purchaseData.eventId,
        eventName: purchaseData.eventName,
        eventType: 'Purchase',
        sessionId: sessionId,
        eventTime: purchaseData.eventTime,
        value: purchaseData.value,
        currency: purchaseData.currency,
        contentIds: JSON.stringify(purchaseData.content_ids || []),
        contentType: purchaseData.content_type,
        contentName: purchaseData.content_name,
        contentCategory: purchaseData.content_category,
        transactionId: purchaseData.transaction_id,
        paymentMethod: purchaseData.payment_method,
        numItems: purchaseData.num_items,
        userData: JSON.stringify(purchaseData.user_data || {}),
        customData: JSON.stringify(purchaseData.custom_data || {}),
        deviceType: unifiedData.device_type,
        screenWidth: unifiedData.screen_width,
        screenHeight: unifiedData.screen_height,
        viewportWidth: unifiedData.viewport_width,
        viewportHeight: unifiedData.viewport_height,
        pixelRatio: unifiedData.pixel_ratio,
        browser: unifiedData.browser,
        operatingSystem: unifiedData.operating_system,
        language: unifiedData.language,
        timezone: unifiedData.timezone,
        connectionType: unifiedData.connection_type,
        pageLoadTime: unifiedData.page_load_time,
        domContentLoaded: unifiedData.dom_content_loaded,
        firstContentfulPaint: unifiedData.first_contentful_paint,
        sessionStartTime: unifiedData.session_start_time,
        pageNumber: unifiedData.page_number,
        userJourneyStage: unifiedData.user_journey_stage,
        campaignName: unifiedData.campaign_name,
        campaignId: unifiedData.campaign_id,
        adsetName: unifiedData.adset_name,
        adsetId: unifiedData.adset_id,
        adName: unifiedData.ad_name,
        adId: unifiedData.ad_id,
        placement: unifiedData.placement,
        campaignType: unifiedData.campaign_type,
        adFormat: unifiedData.ad_format,
        targetingType: unifiedData.targeting_type,
        audienceSegment: unifiedData.audience_segment,
        creativeType: unifiedData.creative_type,
        objectiveType: unifiedData.objective_type,
        contentLanguage: unifiedData.content_language,
        market: unifiedData.market,
        platform: unifiedData.platform,
        eventSourceUrl: unifiedData.event_source_url,
        actionSource: unifiedData.action_source
      }
    });

    return updatedSession;
  } catch (error) {
    console.error('Error updating Purchase:', error);
    throw error;
  }
}

// POST /api/events/unify - 处理事件数据统一
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { eventType, eventData, sessionId } = body;

    if (!eventType || !eventData) {
      return NextResponse.json(
        { error: 'Missing required fields: eventType and eventData' },
        { status: 400 }
      );
    }

    switch (eventType) {
      case 'InitiateCheckout':
        // 处理 InitiateCheckout 事件
        const newSessionId = sessionId || generateSessionId();
        
        const checkoutSession = await saveInitiateCheckout(newSessionId, eventData);
        
        return NextResponse.json({
          success: true,
          sessionId: newSessionId,
          message: 'InitiateCheckout data stored successfully',
          storedData: checkoutSession,
          processingTime: Date.now() - startTime
        });

      case 'Purchase':
        // 处理 Purchase 事件
        if (!sessionId) {
          return NextResponse.json(
            { error: 'Session ID is required for Purchase event' },
            { status: 400 }
          );
        }

        const existingSession = await db.checkoutSession.findUnique({
          where: { sessionId }
        });

        if (!existingSession) {
          return NextResponse.json(
            { error: 'No checkout session found for the provided session ID' },
            { status: 404 }
          );
        }

        if (existingSession.status !== 'pending') {
          return NextResponse.json(
            { error: 'Session is already completed or expired' },
            { status: 400 }
          );
        }

        // 重建 InitiateCheckout 数据
        const checkoutData: EventData = {
          eventName: 'InitiateCheckout',
          eventId: existingSession.initiateEventId,
          eventTime: existingSession.initiateEventTime,
          value: existingSession.initiateValue,
          currency: existingSession.initiateCurrency,
          content_ids: JSON.parse(existingSession.initiateContentIds || '[]'),
          content_type: existingSession.initiateContentType,
          content_name: existingSession.initiateContentName,
          content_category: existingSession.initiateContentCategory,
          user_data: JSON.parse(existingSession.initiateUserData || '{}'),
          custom_data: JSON.parse(existingSession.initiateCustomData || '{}'),
          ...JSON.parse(existingSession.initiateClientInfo || '{}'),
          ...JSON.parse(existingSession.initiateUTMData || '{}'),
          ...JSON.parse(existingSession.initiatePerformanceData || '{}')
        };

        // 合并数据
        const unifiedEventData = mergeEventData(checkoutData, eventData);

        // 更新数据库
        await updatePurchase(sessionId, eventData, unifiedEventData);

        // 这里可以发送到 Meta Conversions API
        // await sendToMetaAPI(unifiedEventData);

        return NextResponse.json({
          success: true,
          message: 'Purchase event unified successfully',
          unifiedEventData,
          originalPurchaseData: eventData,
          originalCheckoutData: checkoutData,
          processingTime: Date.now() - startTime
        });

      default:
        return NextResponse.json(
          { error: 'Unsupported event type' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error in events unify API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// GET /api/events/unify - 获取会话信息
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const session = await db.checkoutSession.findUnique({
      where: { sessionId },
      include: {
        unifiedEvents: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      session
    });

  } catch (error) {
    console.error('Error getting session info:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/unify - 清理过期会话
export async function DELETE(request: NextRequest) {
  try {
    const now = new Date();
    
    const result = await db.checkoutSession.deleteMany({
      where: {
        expiresAt: {
          lt: now
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${result.count} expired sessions`
    });

  } catch (error) {
    console.error('Error cleaning up sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}