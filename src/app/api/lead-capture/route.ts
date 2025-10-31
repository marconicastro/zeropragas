import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as crypto from 'crypto';

// Função para fazer hash SHA-256
function sha256(data: string): string {
  return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
}

// Função para extrair informações do User-Agent
function parseUserAgent(userAgent?: string) {
  if (!userAgent) return { device: 'unknown', browser: 'unknown', platform: 'unknown' };
  
  const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
  const isChrome = /Chrome/.test(userAgent);
  const isFirefox = /Firefox/.test(userAgent);
  const isSafari = /Safari/.test(userAgent);
  
  return {
    device: isMobile ? 'mobile' : 'desktop',
    browser: isChrome ? 'chrome' : isFirefox ? 'firefox' : isSafari ? 'safari' : 'unknown',
    platform: /Windows/.test(userAgent) ? 'windows' : /Mac/.test(userAgent) ? 'mac' : /Linux/.test(userAgent) ? 'linux' : 'unknown'
  };
}

// Função para limpar e formatar telefone
function cleanPhone(phone?: string): string | null {
  if (!phone) return null;
  return phone.replace(/\D/g, '').replace(/^55/, '').slice(-11);
}

// Função para separar nome e sobrenome
function parseName(fullName?: string): { firstName?: string, lastName?: string } {
  if (!fullName) return {};
  
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0] };
  }
  
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' ')
  };
}

export async function POST(request: NextRequest) {
  console.log('🎯 LEAD CAPTURE - Iniciando captura de lead');
  
  try {
    // 1. Extrair dados da requisição
    const body = await request.json();
    const {
      email,
      phone,
      name,
      city,
      state,
      zipcode,
      country,
      utm_source,
      utm_medium,
      utm_campaign,
      capture_page,
      capture_source = 'website',
      fbp,  // 🎯 Cookie FBP do Meta Pixel
      fbc   // 🎯 Cookie FBC do Meta Pixel (se veio de anúncio)
    } = body;

    console.log('📥 Dados recebidos:', {
      email: email ? '***' + email.split('@')[1] : 'missing',
      phone: phone ? '***' + phone.slice(-4) : 'missing',
      name: name ? name.split(' ')[0] : 'missing',
      city,
      state,
      capture_source,
      fbp: fbp ? '✅ Presente' : '❌ Ausente',
      fbc: fbc ? '✅ Presente (anúncio!)' : 'ℹ️  Ausente (orgânico)'
    });

    // 2. Validação básica
    if (!email) {
      console.log('❌ Email é obrigatório');
      return NextResponse.json({
        success: false,
        error: 'Email é obrigatório',
        code: 'missing_email'
      }, { status: 400 });
    }

    // 3. Processar dados
    const emailLower = email.toLowerCase().trim();
    const phoneClean = cleanPhone(phone);
    const { firstName, lastName } = parseName(name);
    const deviceInfo = parseUserAgent(request.headers.get('user-agent') || undefined);

    // 4. Verificar se lead já existe
    const existingLead = await db.leadUserData.findUnique({
      where: { email: emailLower }
    });

    if (existingLead) {
      console.log('🔄 Lead já existe, atualizando dados...');
      
      // Atualizar dados existentes com novas informações
      const updatedLead = await db.leadUserData.update({
        where: { email: emailLower },
        data: {
          phone: phoneClean || existingLead.phone,
          firstName: firstName || existingLead.firstName,
          lastName: lastName || existingLead.lastName,
          fullName: name || existingLead.fullName,
          city: city || existingLead.city,
          state: state || existingLead.state,
          zipcode: zipcode || existingLead.zipcode,
          country: country || existingLead.country,
          capturePage: capture_page || existingLead.capturePage,
          utmSource: utm_source || existingLead.utmSource,
          utmMedium: utm_medium || existingLead.utmMedium,
          utmCampaign: utm_campaign || existingLead.utmCampaign,
          // 🎯 Atualizar FBP/FBC (sempre usa o mais recente)
          fbp: fbp || existingLead.fbp,
          fbc: fbc || existingLead.fbc,
          fbpCapturedAt: fbp ? new Date() : existingLead.fbpCapturedAt,
          fbcCapturedAt: fbc ? new Date() : existingLead.fbcCapturedAt,
          updatedAt: new Date()
        }
      });

      console.log('✅ Lead atualizado com sucesso:', updatedLead.id);

      return NextResponse.json({
        success: true,
        message: 'Lead atualizado com sucesso',
        leadId: updatedLead.id,
        isNew: false,
        data: {
          email: updatedLead.email,
          phone: updatedLead.phone,
          name: updatedLead.fullName,
          city: updatedLead.city,
          state: updatedLead.state
        }
      });

    } else {
      console.log('🆕 Criando novo lead...');

      // Criar novo lead
      const newLead = await db.leadUserData.create({
        data: {
          email: emailLower,
          phone: phoneClean,
          firstName,
          lastName,
          fullName: name,
          city,
          state,
          zipcode,
          country: country || 'br',
          captureSource: capture_source,
          capturePage: capture_page,
          utmSource: utm_source,
          utmMedium: utm_medium,
          utmCampaign: utm_campaign,
          ipAddress: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          // 🎯 Salvar FBP/FBC do Meta Pixel
          fbp: fbp,
          fbc: fbc,
          fbpCapturedAt: fbp ? new Date() : null,
          fbcCapturedAt: fbc ? new Date() : null,
          validated: true, // Dados capturados diretamente são validados
          validationDate: new Date()
        }
      });

      console.log('✅ Novo lead criado com sucesso:', newLead.id);

      return NextResponse.json({
        success: true,
        message: 'Lead capturado com sucesso',
        leadId: newLead.id,
        isNew: true,
        data: {
          email: newLead.email,
          phone: newLead.phone,
          name: newLead.fullName,
          city: newLead.city,
          state: newLead.state
        }
      });
    }

  } catch (error) {
    console.error('❌ Erro ao capturar lead:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno ao processar lead',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

// Endpoint GET para consultar leads
export async function GET(request: NextRequest) {
  console.log('🔍 LEAD QUERY - Consultando leads');
  
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');
    
    if (!email && !phone) {
      return NextResponse.json({
        success: false,
        error: 'Informe email ou phone para consulta'
      }, { status: 400 });
    }

    let lead;
    
    if (email) {
      lead = await db.leadUserData.findUnique({
        where: { email: email.toLowerCase().trim() },
        include: {
          caktoEvents: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      });
    } else if (phone) {
      const phoneClean = cleanPhone(phone);
      lead = await db.leadUserData.findFirst({
        where: { phone: phoneClean },
        include: {
          caktoEvents: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      });
    }

    if (!lead) {
      return NextResponse.json({
        success: false,
        error: 'Lead não encontrado',
        code: 'lead_not_found'
      }, { status: 404 });
    }

    console.log('✅ Lead encontrado:', lead.id);

    return NextResponse.json({
      success: true,
      lead: {
        id: lead.id,
        email: lead.email,
        phone: lead.phone,
        name: lead.fullName,
        firstName: lead.firstName,
        lastName: lead.lastName,
        city: lead.city,
        state: lead.state,
        zipcode: lead.zipcode,
        country: lead.country,
        captureSource: lead.captureSource,
        capturePage: lead.capturePage,
        validated: lead.validated,
        validationDate: lead.validationDate,
        createdAt: lead.createdAt,
        eventsCount: lead.caktoEvents.length,
        recentEvents: lead.caktoEvents.map(event => ({
          id: event.id,
          eventType: event.eventType,
          amount: event.amount,
          status: event.status,
          metaSuccess: event.metaSuccess,
          createdAt: event.createdAt
        }))
      }
    });

  } catch (error) {
    console.error('❌ Erro ao consultar lead:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno ao consultar lead'
    }, { status: 500 });
  }
}