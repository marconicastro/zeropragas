/**
 * Preenchimento de Dados de Localização (ct, st, country, zip)
 * 
 * EXPLICAÇÃO COMPLETA: Como estes parâmetros são preenchidos
 */

import { getPersistedUserData } from './userDataPersistence';

/**
 * EXPLICAÇÃO: Fontes dos dados de localização
 */
export const LOCATION_DATA_SOURCES = {
  title: "COMO PARÂMETROS DE LOCALIZAÇÃO SÃO PREENCHIDOS:",
  
  sources: [
    {
      parameter: "ct (city)",
      priority: [
        "1. Dados do formulário preenchido pelo usuário",
        "2. Dados persistidos de cadastro anterior",
        "3. Geolocalização do navegador (com permissão)",
        "4. API de geolocalização via IP (backend)",
        "5. Padrão: null (se não disponível)"
      ]
    },
    {
      parameter: "st (state)",
      priority: [
        "1. Dados do formulário (UF/estado)",
        "2. Dados persistidos de cadastro",
        "3. Geolocalização do navegador",
        "4. API via IP (backend)",
        "5. Padrão: null"
      ]
    },
    {
      parameter: "country",
      priority: [
        "1. Dados do formulário",
        "2. Padrão fixo: 'br' (Brasil)",
        "3. Geolocalização do navegador",
        "4. Detecção automática via IP",
        "5. Locale do navegador"
      ]
    },
    {
      parameter: "zip (postal code)",
      priority: [
        "1. CEP do formulário brasileiro",
        "2. Dados persistidos de cadastro",
        "3. Geolocalização reversa (coordenadas → CEP)",
        "4. API via IP (limitado)",
        "5. Padrão: null"
      ]
    }
  ]
};

/**
 * Obtém dados de localização do navegador (com permissão)
 */
export async function getBrowserLocation(): Promise<{
  city: string | null;
  state: string | null;
  country: string | null;
  zip: string | null;
}> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.log('🌐 Geolocalização não suportada pelo navegador');
      resolve({ city: null, state: null, country: null, zip: null });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Geocoding reverso via API pública
          const location = await reverseGeocode(latitude, longitude);
          
          console.log('📍 Localização obtida via navegador:', location);
          resolve(location);
        } catch (error) {
          console.warn('❌ Erro no geocoding:', error);
          resolve({ city: null, state: null, country: null, zip: null });
        }
      },
      (error) => {
        console.log('⚠️ Permissão de geolocalização negada ou erro:', error.message);
        resolve({ city: null, state: null, country: null, zip: null });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutos
      }
    );
  });
}

/**
 * Geocoding reverso via API pública
 */
async function reverseGeocode(lat: number, lon: number): Promise<{
  city: string | null;
  state: string | null;
  country: string | null;
  zip: string | null;
}> {
  try {
    // OpenStreetMap Nominatim (gratuito)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'MetaPixelTracker/1.0'
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      const address = data.address;
      
      return {
        city: address?.city || address?.town || address?.village || null,
        state: address?.state || null,
        country: data.address?.country_code?.toLowerCase() || null,
        zip: address?.postcode || null
      };
    }

    return { city: null, state: null, country: null, zip: null };
  } catch (error) {
    console.warn('❌ Erro no geocoding reverso:', error);
    return { city: null, state: null, country: null, zip: null };
  }
}

/**
 * Obtém localização via API de IP (limitado)
 */
export async function getLocationByIP(): Promise<{
  city: string | null;
  state: string | null;
  country: string | null;
  zip: string | null;
}> {
  try {
    const ipServices = [
      {
        url: 'https://ipapi.co/json/',
        parser: (data: any) => ({
          city: data.city,
          state: data.region,
          country: data.country_code?.toLowerCase(),
          zip: data.postal
        })
      },
      {
        url: 'https://ip-api.com/json/',
        parser: (data: any) => ({
          city: data.city,
          state: data.regionName,
          country: data.countryCode?.toLowerCase(),
          zip: data.zip
        })
      }
    ];

    for (const service of ipServices) {
      try {
        const response = await fetch(service.url);
        if (response.ok) {
          const data = await response.json();
          const location = service.parser(data);
          
          console.log('🌍 Localização via IP:', location);
          return location;
        }
      } catch (error) {
        console.warn(`❌ Falha no serviço ${service.url}:`, error);
        continue;
      }
    }

    return { city: null, state: null, country: null, zip: null };
  } catch (error) {
    console.warn('❌ Erro ao obter localização por IP:', error);
    return { city: null, state: null, country: null, zip: null };
  }
}

/**
 * Função principal: Obtém melhor localização disponível
 */
export async function getBestAvailableLocation(): Promise<{
  city: string | null;
  state: string | null;
  country: string | null;
  zip: string | null;
  source: string;
}> {
  // 1. Dados persistidos (prioridade máxima)
  const persistedData = getPersistedUserData();
  if (persistedData && (persistedData.city || persistedData.state || persistedData.cep)) {
    console.log('💾 Usando localização dos dados persistidos');
    return {
      city: persistedData.city?.toLowerCase().trim() || null,
      state: persistedData.state?.toLowerCase().trim() || null,
      country: 'br', // Sempre Brasil para usuários brasileiros
      zip: persistedData.cep?.replace(/\D/g, '') || null,
      source: 'persisted_data'
    };
  }

  // 2. Geolocalização do navegador
  try {
    const browserLocation = await getBrowserLocation();
    if (browserLocation.city || browserLocation.state || browserLocation.zip) {
      console.log('📱 Usando geolocalização do navegador');
      return {
        ...browserLocation,
        country: browserLocation.country || 'br',
        source: 'browser_geolocation'
      };
    }
  } catch (error) {
    console.warn('⚠️ Geolocalização do navegador falhou:', error);
  }

  // 3. Localização por IP
  try {
    const ipLocation = await getLocationByIP();
    if (ipLocation.city || ipLocation.state || ipLocation.zip) {
      console.log('🌐 Usando localização por IP');
      return {
        ...ipLocation,
        country: ipLocation.country || 'br',
        source: 'ip_geolocation'
      };
    }
  } catch (error) {
    console.warn('⚠️ Localização por IP falhou:', error);
  }

  // 4. Padrão Brasil (sempre disponível)
  console.log('🇧🇷 Usando padrão Brasil (nenhuma localização específica)');
  return {
    city: null,
    state: null,
    country: 'br',
    zip: null,
    source: 'default_brazil'
  };
}

/**
 * Explicação detalhada para debugging
 */
export const DEBUG_LOCATION_FLOW = {
  title: "FLUXO COMPLETO DE DETECÇÃO DE LOCALIZAÇÃO:",
  
  steps: [
    {
      step: 1,
      action: "Verificar dados persistidos",
      description: "Usuário já preencheu formulário anteriormente",
      example: "city: 'sao paulo', state: 'sp', zip: '01310-100'"
    },
    {
      step: 2,
      action: "Solicitar permissão de geolocalização",
      description: "Browser pede permissão ao usuário",
      example: "📍 Latitude: -23.5505, Longitude: -46.6333"
    },
    {
      step: 3,
      action: "Geocoding reverso",
      description: "Converte coordenadas em endereço",
      example: "→ city: 'são paulo', state: 'são paulo'"
    },
    {
      step: 4,
      action: "Fallback para API de IP",
      description: "Usa IP como última alternativa",
      example: "→ city: 'sao paulo', state: 'sp'"
    },
    {
      step: 5,
      action: "Padrão Brasil",
      description: "Sempre temos country: 'br'",
      example: "→ country: 'br', city: null, state: null"
    }
  ]
};