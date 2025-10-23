'use client';

import React, { useState, useEffect } from 'react';
import { getPersistedUserData, formatUserDataForMeta } from '@/lib/userDataPersistence';
import { getBestAvailableLocation } from '@/lib/locationData';
import { getClientIPFromFrontend, IP_EXPLANATION } from '@/lib/ipDetection';
import { LOCATION_DATA_SOURCES, DEBUG_LOCATION_FLOW } from '@/lib/locationData';

const MetaPixelDebug: React.FC = () => {
  const [debugData, setDebugData] = useState<any>({});
  const [locationData, setLocationData] = useState<any>({});
  const [ipData, setIpData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDebugData();
  }, []);

  const loadDebugData = async () => {
    setLoading(true);
    
    try {
      // 1. Dados persistidos
      const persistedData = getPersistedUserData();
      const formattedData = formatUserDataForMeta(persistedData);
      
      // 2. Localização
      const location = await getBestAvailableLocation();
      
      // 3. IP (frontend)
      const ip = await getClientIPFromFrontend();
      
      setDebugData({
        persisted: persistedData,
        formatted: formattedData
      });
      
      setLocationData(location);
      setIpData(ip);
      
    } catch (error) {
      console.error('Erro no debug:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg">
        <div className="animate-pulse">Carregando dados de debug...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800">🔍 Meta Pixel Debug</h2>
      
      {/* Seção 1: IP Address */}
      <div className="border-l-4 border-blue-500 pl-4">
        <h3 className="text-lg font-semibold text-blue-700">🌐 IP Address Status</h3>
        <div className="mt-2 p-3 bg-blue-50 rounded">
          <p><strong>client_ip_address:</strong> <span className="text-red-600 font-mono">{ipData || 'null'}</span></p>
          <p className="text-sm text-gray-600 mt-1">
            ✅ <strong>NULL é CORRETO!</strong> Navegadores bloqueiam acesso ao IP no frontend.
          </p>
        </div>
      </div>

      {/* Seção 2: Dados Persistidos */}
      <div className="border-l-4 border-green-500 pl-4">
        <h3 className="text-lg font-semibold text-green-700">💾 Dados Persistidos</h3>
        <div className="mt-2 p-3 bg-green-50 rounded">
          {debugData.persisted ? (
            <pre className="text-xs overflow-auto">
              {JSON.stringify(debugData.persisted, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-500">Nenhum dado persistido encontrado</p>
          )}
        </div>
      </div>

      {/* Seção 3: Dados Formatados para Meta */}
      <div className="border-l-4 border-purple-500 pl-4">
        <h3 className="text-lg font-semibold text-purple-700">📤 Dados Formatados para Meta</h3>
        <div className="mt-2 p-3 bg-purple-50 rounded">
          <pre className="text-xs overflow-auto">
            {JSON.stringify(debugData.formatted, null, 2)}
          </pre>
        </div>
      </div>

      {/* Seção 4: Localização */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-lg font-semibold text-orange-700">📍 Sistema de Localização</h3>
        <div className="mt-2 p-3 bg-orange-50 rounded">
          <p><strong>Fonte:</strong> <span className="font-mono">{locationData.source}</span></p>
          <pre className="text-xs mt-2 overflow-auto">
            {JSON.stringify(locationData, null, 2)}
          </pre>
        </div>
      </div>

      {/* Seção 5: Explicações */}
      <div className="border-l-4 border-indigo-500 pl-4">
        <h3 className="text-lg font-semibold text-indigo-700">📚 Explicações Importantes</h3>
        
        <div className="mt-4 space-y-4">
          <div className="p-4 bg-indigo-50 rounded">
            <h4 className="font-semibold text-indigo-800">Por que IP null é correto?</h4>
            <ul className="text-sm text-gray-700 mt-2 space-y-1">
              <li>• Navegadores modernos BLOQUEIAM acesso ao IP no frontend</li>
              <li>• Meta espera IP do backend/servidor CAPI</li>
              <li>• null é o valor padrão e seguro</li>
              <li>• Conforme GDPR/LGPD - IP é dado sensível</li>
            </ul>
          </div>

          <div className="p-4 bg-indigo-50 rounded">
            <h4 className="font-semibold text-indigo-800">Como localização é preenchida?</h4>
            <ol className="text-sm text-gray-700 mt-2 space-y-1">
              <li>1. Dados do formulário (prioridade máxima)</li>
              <li>2. Dados persistidos de cadastro anterior</li>
              <li>3. Geolocalização do navegador (com permissão)</li>
              <li>4. API via IP (limitado)</li>
              <li>5. Padrão: country='br' (sempre Brasil)</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Botão de atualização */}
      <div className="pt-4">
        <button
          onClick={loadDebugData}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          🔄 Atualizar Dados
        </button>
      </div>
    </div>
  );
};

export default MetaPixelDebug;