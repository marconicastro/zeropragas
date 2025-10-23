import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Obter IP real do cliente
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = forwarded ? forwarded.split(',')[0] : request.ip || '127.0.0.1';
    
    // Obter User Agent
    const userAgent = request.headers.get('user-agent') || '';
    
    // Obter informações de geolocalização baseadas no IP
    let locationData = {
      city: null,
      region: null,
      regionCode: null,
      country: null,
      countryCode: null,
      zip: null
    };
    
    try {
      // Usar API de geolocalização gratuita
      const geoResponse = await fetch(`http://ip-api.com/json/${realIP}`);
      if (geoResponse.ok) {
        const geo = await geoResponse.json();
        locationData = {
          city: geo.city || null,
          region: geo.regionName || null,
          regionCode: geo.region || null,
          country: geo.country || null,
          countryCode: geo.countryCode || null,
          zip: geo.zip || null
        };
      }
    } catch (geoError) {
      console.warn('Erro ao obter geolocalização:', geoError);
      // Continuar sem dados de geolocalização
    }
    
    const clientData = {
      client_ip_address: realIP,
      client_user_agent: userAgent,
      city: locationData.city?.toLowerCase() || null, // Facebook padrão: minúsculas
      region: locationData.regionCode?.toLowerCase() || null, // Facebook padrão: minúsculas
      country: locationData.countryCode?.toLowerCase() || null, // Facebook padrão: minúsculas
      countryName: locationData.country || null,
      zip: locationData.zip || null, // Manter formatação original
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(clientData);
    
  } catch (error) {
    console.error('Erro ao obter dados do cliente:', error);
    
    // Retornar dados básicos mesmo em caso de erro
    return NextResponse.json({
      client_ip_address: request.ip || '127.0.0.1',
      client_user_agent: request.headers.get('user-agent') || '',
      city: null,
      region: null,
      country: null,
      countryName: null,
      zip: null,
      timestamp: new Date().toISOString(),
      error: true
    });
  }
}