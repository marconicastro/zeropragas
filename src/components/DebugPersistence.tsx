'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPersistedUserData, clearPersistedData, hasPersistedData } from '@/lib/userDataPersistence';
import { Trash2, Eye, RefreshCw } from 'lucide-react';

const DebugPersistence: React.FC = () => {
  const [persistedData, setPersistedData] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  const loadData = () => {
    const data = getPersistedUserData();
    setPersistedData(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClearData = () => {
    clearPersistedData();
    setPersistedData(null);
    loadData();
  };

  const handleRefresh = () => {
    loadData();
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          size="sm"
          variant="outline"
          className="bg-gray-100 border-gray-300"
        >
          <Eye className="w-4 h-4 mr-2" />
          Debug
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      <Card className="bg-white border-2 border-gray-200 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold">🔍 Debug Persistência</CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={handleRefresh}
                size="sm"
                variant="outline"
                className="h-6 px-2"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
              <Button
                onClick={() => setIsVisible(false)}
                size="sm"
                variant="outline"
                className="h-6 px-2"
              >
                ×
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Tem Dados:</span>
              <span className={`px-2 py-1 rounded text-xs ${
                hasPersistedData() 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {hasPersistedData() ? 'SIM' : 'NÃO'}
              </span>
            </div>
            
            {persistedData ? (
              <div className="space-y-2">
                <div className="bg-gray-50 p-2 rounded text-xs">
                  <div className="font-semibold mb-1">📋 Dados Armazenados:</div>
                  <div className="space-y-1">
                    <div><strong>Email:</strong> {persistedData.email || 'N/A'}</div>
                    <div><strong>Nome:</strong> {persistedData.fullName || 'N/A'}</div>
                    <div><strong>Telefone:</strong> {persistedData.phone || 'N/A'}</div>
                    <div><strong>Cidade:</strong> {persistedData.city || 'N/A'}</div>
                    <div><strong>Estado:</strong> {persistedData.state || 'N/A'}</div>
                    <div><strong>CEP:</strong> {persistedData.cep || 'N/A'}</div>
                    <div><strong>Sessão:</strong> {persistedData.sessionId || 'N/A'}</div>
                    <div><strong>Consent:</strong> {persistedData.consent ? 'SIM' : 'NÃO'}</div>
                    <div><strong>Armazenado há:</strong> {
                      Math.round((Date.now() - persistedData.timestamp) / (24 * 60 * 60 * 1000))
                    } dias</div>
                  </div>
                </div>
                
                <Button
                  onClick={handleClearData}
                  size="sm"
                  variant="destructive"
                  className="w-full h-8 text-xs"
                >
                  <Trash2 className="w-3 h-3 mr-2" />
                  Limpar Dados
                </Button>
              </div>
            ) : (
              <div className="bg-red-50 p-2 rounded text-xs text-red-800">
                Nenhum dado persistido encontrado
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugPersistence;