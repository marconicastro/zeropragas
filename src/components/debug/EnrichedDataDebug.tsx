'use client';

import React, { useState, useEffect } from 'react';
import { getEnrichedUserData, formatEnrichedDataForMeta, debugEnrichedData, hasEnrichedData } from '@/lib/enrichedUserData';
import { getClientInfo } from '@/lib/enrichedUserData';
import { getPersistedUserData } from '@/lib/userDataPersistence';

const EnrichedDataDebug: React.FC = () => {
  const [debugData, setDebugData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDebugData();
  }, []);

  const loadDebugData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Obter todos os dados para comparação
      const debug = await debugEnrichedData();
      const enriched = await getEnrichedUserData();
      const formatted = await formatEnrichedDataForMeta();
      const hasData = await hasEnrichedData();
      
      setDebugData({
        debug,
        enriched,
        formatted,
        hasData
      });
      
    } catch (error) {
      console.error('Erro no debug de dados enriquecidos:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg">
        <div className="animate-pulse">Carregando dados enriquecidos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-800 font-semibold">❌ Erro ao carregar dados</h3>
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadDebugData}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800">🔥 Debug - Dados Enriquecidos</h2>
      
      {/* Status Geral */}
      <div className="border-l-4 border-green-500 pl-4">
        <h3 className="text-lg font-semibold text-green-700">✅ Status Geral</h3>
        <div className="mt-2 p-3 bg-green-50 rounded">
          <p><strong>Tem Dados Enriquecidos:</strong> 
            <span className={`ml-2 px-2 py-1 rounded text-sm ${
              debugData.hasData ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
            }`}>
              {debugData.hasData ? 'SIM' : 'NÃO'}
            </span>
          </p>
        </div>
      </div>

      {/* Dados da API */}
      <div className="border-l-4 border-blue-500 pl-4">
        <h3 className="text-lg font-semibold text-blue-700">🌐 Dados da API (Client-Info)</h3>
        <div className="mt-2 p-3 bg-blue-50 rounded">
          {debugData.debug?.api ? (
            <div>
              <p><strong>IP:</strong> <span className="font-mono">{debugData.debug.api.ip || 'N/A'}</span></p>
              <p><strong>Cidade:</strong> {debugData.debug.api.city || 'N/A'}</p>
              <p><strong>Estado:</strong> {debugData.debug.api.region || 'N/A'}</p>
              <p><strong>CEP:</strong> {debugData.debug.api.postalCode || 'N/A'}</p>
              <p><strong>País:</strong> {debugData.debug.api.country || 'N/A'}</p>
              <p><strong>ISP:</strong> {debugData.debug.api.isp || 'N/A'}</p>
            </div>
          ) : (
            <p className="text-gray-500">Dados da API não disponíveis</p>
          )}
        </div>
      </div>

      {/* Dados Persistidos */}
      <div className="border-l-4 border-purple-500 pl-4">
        <h3 className="text-lg font-semibold text-purple-700">💾 Dados Persistidos</h3>
        <div className="mt-2 p-3 bg-purple-50 rounded">
          {debugData.debug?.persisted ? (
            <pre className="text-xs overflow-auto">
              {JSON.stringify(debugData.debug.persisted, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-500">Nenhum dado persistido encontrado</p>
          )}
        </div>
      </div>

      {/* Dados Combinados */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-lg font-semibold text-orange-700">🔥 Dados Combinados (Enriquecidos)</h3>
        <div className="mt-2 p-3 bg-orange-50 rounded">
          {debugData.enriched ? (
            <div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p><strong>Email:</strong> {debugData.enriched.email || 'N/A'}</p>
                  <p><strong>Telefone:</strong> {debugData.enriched.phone || 'N/A'}</p>
                  <p><strong>Nome:</strong> {debugData.enriched.fullName || 'N/A'}</p>
                </div>
                <div>
                  <p><strong>Cidade:</strong> {debugData.enriched.city || 'N/A'}</p>
                  <p><strong>Estado:</strong> {debugData.enriched.state || 'N/A'}</p>
                  <p><strong>CEP:</strong> {debugData.enriched.cep || 'N/A'}</p>
                  <p><strong>IP:</strong> <span className="font-mono">{debugData.enriched.client_ip_address || 'N/A'}</span></p>
                </div>
              </div>
              
              <div className="border-t pt-3">
                <p><strong>Fontes dos Dados:</strong></p>
                <pre className="text-xs mt-2 bg-gray-100 p-2 rounded">
                  {JSON.stringify(debugData.enriched.dataSource, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Dados enriquecidos não disponíveis</p>
          )}
        </div>
      </div>

      {/* Dados Formatados para Meta */}
      <div className="border-l-4 border-indigo-500 pl-4">
        <h3 className="text-lg font-semibold text-indigo-700">📤 Dados Formatados para Meta</h3>
        <div className="mt-2 p-3 bg-indigo-50 rounded">
          {debugData.formatted ? (
            <pre className="text-xs overflow-auto">
              {JSON.stringify(debugData.formatted, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-500">Dados formatados não disponíveis</p>
          )}
        </div>
      </div>

      {/* Resumo das Melhorias */}
      <div className="border-l-4 border-teal-500 pl-4">
        <h3 className="text-lg font-semibold text-teal-700">📈 Resumo das Melhorias</h3>
        <div className="mt-2 p-3 bg-teal-50 rounded">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>✅ IP Real:</strong> {debugData.enriched?.client_ip_address ? 'SIM' : 'NÃO'}</p>
              <p><strong>✅ Cidade:</strong> {debugData.enriched?.city ? 'SIM' : 'NÃO'}</p>
              <p><strong>✅ Estado:</strong> {debugData.enriched?.state ? 'SIM' : 'NÃO'}</p>
            </div>
            <div>
              <p><strong>✅ CEP:</strong> {debugData.enriched?.cep ? 'SIM' : 'NÃO'}</p>
              <p><strong>✅ Email:</strong> {debugData.enriched?.email ? 'SIM' : 'NÃO'}</p>
              <p><strong>✅ Telefone:</strong> {debugData.enriched?.phone ? 'SIM' : 'NÃO'}</p>
            </div>
          </div>
          
          <div className="mt-3 p-2 bg-yellow-100 rounded text-sm">
            <p><strong>Impacto no EQM:</strong> 
              {debugData.hasData ? 
                <span className="text-green-700 font-semibold"> +2.0 a +3.0 pontos</span> : 
                <span className="text-red-700 font-semibold"> Sem melhoria</span>
              }
            </p>
          </div>
        </div>
      </div>

      {/* Botão de atualização */}
      <div className="pt-4">
        <button
          onClick={loadDebugData}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          🔄 Atualizar Dados Enriquecidos
        </button>
      </div>
    </div>
  );
};

export default EnrichedDataDebug;