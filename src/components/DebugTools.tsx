'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bug, 
  Play, 
  Eye, 
  Settings, 
  RefreshCw,
  Terminal,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { eventManager } from '@/lib/eventManager';

interface DebugInfo {
  eventManager: any;
  performance: any;
  cookies: any;
  urlParams: any;
}

export default function DebugTools() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadDebugInfo();
    }
  }, []);

  const loadDebugInfo = async () => {
    try {
      setLoading(true);
      
      // Event Manager info
      const eventManagerInfo = {
        cacheStats: eventManager.getCacheStats(),
        realTimeMetrics: eventManager.getRealTimeMetrics(),
        config: eventManager.getPrimaryChannel()
      };

      // Performance info
      const performanceInfo = eventManager.getPerformanceMetrics();

      // Cookies info
      const cookies = document.cookie.split(';').reduce((acc: any, cookie) => {
        const [name, value] = cookie.trim().split('=');
        if (name.includes('_fb') || name.includes('_ga') || name.includes('utm_')) {
          acc[name] = value;
        }
        return acc;
      }, {});

      // URL params
      const urlParams = new URLSearchParams(window.location.search);
      const params: any = {};
      for (const [key, value] of urlParams.entries()) {
        params[key] = value;
      }

      setDebugInfo({
        eventManager: eventManagerInfo,
        performance: performanceInfo,
        cookies,
        urlParams: params
      });
    } catch (error) {
      console.error('Erro ao carregar debug info:', error);
    } finally {
      setLoading(false);
    }
  };

  const runTests = async () => {
    const results: any[] = [];
    
    // Test 1: ViewContent
    try {
      const result = await eventManager.sendViewContent({
        em: 'test@example.com',
        ph: '11999999999',
        fn: 'Test',
        ln: 'User',
        ct: 'São Paulo',
        st: 'SP',
        zp: '01310-100'
      });
      results.push({
        test: 'ViewContent',
        success: result.success,
        details: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      results.push({
        test: 'ViewContent',
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }

    // Test 2: InitiateCheckout
    try {
      const result = await eventManager.sendInitiateCheckout({
        em: 'test@example.com',
        ph: '11999999999',
        fn: 'Test',
        ln: 'User',
        ct: 'São Paulo',
        st: 'SP',
        zp: '01310-100'
      });
      results.push({
        test: 'InitiateCheckout',
        success: result.success,
        details: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      results.push({
        test: 'InitiateCheckout',
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }

    setTestResults(results);
  };

  const clearCache = () => {
    eventManager.clearCache();
    loadDebugInfo();
  };

  const switchChannel = (channel: string) => {
    eventManager.setPrimaryChannel(channel as any);
    loadDebugInfo();
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="p-4 text-center">
        <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
        <p className="text-yellow-600">Debug tools disponíveis apenas em desenvolvimento</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Bug className="h-6 w-6" />
          Debug Tools
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadDebugInfo}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm" onClick={() => setConsoleOpen(!consoleOpen)}>
            <Terminal className="h-4 w-4 mr-2" />
            Console
          </Button>
        </div>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button onClick={runTests} size="sm">
              <Play className="h-4 w-4 mr-2" />
              Rodar Testes
            </Button>
            <Button onClick={clearCache} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Limpar Cache
            </Button>
            <Button 
              onClick={() => switchChannel('gtm_server')} 
              variant="outline" 
              size="sm"
            >
              GTM Server
            </Button>
            <Button 
              onClick={() => switchChannel('gtm')} 
              variant="outline" 
              size="sm"
            >
              GTM
            </Button>
            <Button 
              onClick={() => switchChannel('server')} 
              variant="outline" 
              size="sm"
            >
              Server
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados dos Testes */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Resultados dos Testes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  {getStatusIcon(result.success)}
                  <div className="flex-1">
                    <div className="font-medium">{result.test}</div>
                    <div className="text-sm text-gray-600">
                      {result.timestamp}
                    </div>
                    {result.error && (
                      <div className="text-sm text-red-600 mt-1">
                        Erro: {result.error}
                      </div>
                    )}
                    {result.details && (
                      <details className="mt-2">
                        <summary className="text-sm cursor-pointer">Detalhes</summary>
                        <pre className="text-xs bg-gray-100 p-2 mt-1 rounded overflow-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Event Manager Info */}
      {debugInfo && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Event Manager
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Canal Atual:</span>
                  <Badge variant="outline">{debugInfo.eventManager.config}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Cache Size:</span>
                  <span>{debugInfo.eventManager.cacheStats.cacheSize}</span>
                </div>
                <div className="flex justify-between">
                  <span>Eventos (5min):</span>
                  <span>{debugInfo.eventManager.realTimeMetrics.eventsLast5Minutes}</span>
                </div>
                <div className="flex justify-between">
                  <span>EMQ Médio:</span>
                  <span className={debugInfo.eventManager.realTimeMetrics.averageEMQ >= 8 ? 'text-green-600' : 'text-yellow-600'}>
                    {debugInfo.eventManager.realTimeMetrics.averageEMQ.toFixed(1)}/10
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa de Sucesso:</span>
                  <span className={debugInfo.eventManager.realTimeMetrics.successRate >= 95 ? 'text-green-600' : 'text-yellow-600'}>
                    {debugInfo.eventManager.realTimeMetrics.successRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Cookies & Parâmetros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="font-medium mb-2">Cookies Relevantes:</div>
                  {Object.keys(debugInfo.cookies).length > 0 ? (
                    <div className="space-y-1">
                      {Object.entries(debugInfo.cookies).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="font-mono bg-gray-100 px-1 rounded">{key}:</span>
                          <span className="ml-2 text-gray-600">{value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">Nenhum cookie relevante encontrado</div>
                  )}
                </div>
                
                <div>
                  <div className="font-medium mb-2">Parâmetros URL:</div>
                  {Object.keys(debugInfo.urlParams).length > 0 ? (
                    <div className="space-y-1">
                      {Object.entries(debugInfo.urlParams).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="font-mono bg-gray-100 px-1 rounded">{key}:</span>
                          <span className="ml-2 text-gray-600">{value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">Nenhum parâmetro encontrado</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Console */}
      {consoleOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              Console
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded font-mono text-sm">
              <div>🚀 Sistema de Rastreamento Server-Side v2.0</div>
              <div>📊 Event Manager: {debugInfo?.eventManager.config || 'unknown'}</div>
              <div>🎯 EMQ Score: {debugInfo?.eventManager.realTimeMetrics.averageEMQ.toFixed(1) || '0'}/10</div>
              <div>✅ Health Score: {debugInfo?.performance.healthScore || '0'}/100</div>
              <div>🔄 Auto-refresh: ATIVO</div>
              <div>📈 Monitoring: ATIVO</div>
              <div>🔍 Debug Mode: ATIVO</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}