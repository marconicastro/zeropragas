import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * API simples para salvar leads no banco existente
 * Não interfere em nenhum outro sistema
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Validação básica
    if (!data.email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
    }
    
    // Salva no banco LeadUserData (JÁ EXISTENTE)
    await db.leadUserData.upsert({
      where: { email: data.email.toLowerCase().trim() },
      update: {
        phone: data.phone,
        fullName: data.fullName,
        firstName: data.firstName,
        lastName: data.lastName,
        city: data.city,
        state: data.state,
        zipcode: data.zipcode,
        country: data.country || 'BR',
        captureSource: 'website',
        capturePage: data.capturePage,
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        validated: true,
        validationDate: new Date()
      },
      create: {
        email: data.email.toLowerCase().trim(),
        phone: data.phone,
        fullName: data.fullName,
        firstName: data.firstName,
        lastName: data.lastName,
        city: data.city,
        state: data.state,
        zipcode: data.zipcode,
        country: data.country || 'BR',
        captureSource: 'website',
        capturePage: data.capturePage,
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        validated: true,
        validationDate: new Date()
      }
    });
    
    console.log('✅ Lead salvo no banco:', data.email);
    
    return NextResponse.json({ 
      success: true, 
      email: data.email,
      message: 'Lead salvo com sucesso'
    });
    
  } catch (error) {
    console.error('❌ Erro ao salvar lead:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}