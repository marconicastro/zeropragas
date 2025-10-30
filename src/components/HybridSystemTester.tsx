'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Rocket, TestTube, Database, Globe, Shield } from 'lucide-react';
import { saveUserData } from '@/lib/userDataPersistence';
import { createPreparedPurchaseEvent, storePreparedPurchaseEvent, storeFallbackUserData } from '@/lib/purchaseEventPreparation';

export default function HybridSystemTester() {
  const [testStatus, setTestStatus] = useState<string>('idle');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Dados de teste realistas
  const testUserData = {
    email: 'joao.silva.teste@email.com',
    phone: '11987654321',
    fullName: 'João Silva Teste',
    city: 'São Paulo',
    state: 'SP',
    cep: '01234567'
  };

  const addTestResult = (test: string, status: 'success' | 'error' | 'warning', message: string, details?: any) => {
    setTestResults(prev => [...prev, {
      test,
      status,
      message,
      details,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runTest = async () => {
    setIsLoading(true);
    setTestResults([]);
    setTestStatus('running');

    try {
      // Teste 1: Salvar dados no localStorage
      console.log('🧪 [TESTE-1] Salvando dados no localStorage...');
      saveUserData(testUserData, true);
      addTestResult('localStorage', 'success', 'Dados salvos no localStorage', testUserData);

      // Teste 2: Preparar Purchase Event
      console.log('🧪 [TESTE-2] Preparando Purchase Event...');
      const preparedEvent = createPreparedPurchaseEvent('test', {
        trigger_type: 'manual_test',
        test_mode: true
      });
      storePreparedPurchaseEvent(preparedEvent);
      addTestResult('purchase_preparation', 'success', 'Purchase Event preparado', {
        event_id: preparedEvent.id,
        has_user_data: !!preparedEvent.user_data,
        has_custom_data: !!preparedEvent.custom_data
      });

      // Teste 3: Armazenar dados fallback
      console.log('🧪 [TESTE-3] Armazenando dados fallback...');
      storeFallbackUserData({
        ...testUserData,
        timestamp: Date.now()
      });
      addTestResult('fallback_storage', 'success', 'Dados fallback armazenados', testUserData);

      // Teste 4: Verificar cache server-side
      console.log('🧪 [TESTE-4] Verificando cache server-side...');
      const cacheResponse = await fetch('/api/send-prepared-data', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (cacheResponse.ok) {
        const cacheData = await cacheResponse.json();
        addTestResult('cache_verification', 'success', 'Cache server-side verificado', {
          has_prepared_event: !!cacheData.preparedEvent,
          has_fallback_data: !!cacheData.fallbackData,
          cache_info: cacheData.cache_info
        });
      } else {
        addTestResult('cache_verification', 'error', 'Falha ao verificar cache');
      }

      // Teste 5: Simular webhook Cakto
      console.log('🧪 [TESTE-5] Simulando webhook Cakto...');
      const webhookResponse = await fetch('/api/webhook-cakto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: '12f4848f-35e9-41a8-8da4-1032642e3e89',
          event: 'purchase_approved',
          data: {
            id: `test_${Date.now()}`,
            customer: {
              name: testUserData.fullName,
              email: testUserData.email,
              phone: testUserData.phone
            },
            amount: 39.9,
            status: 'paid',
            product: {
              name: 'Sistema 4 Fases',
              short_id: 'hacr962'
            },
            paymentMethod: 'pix'
          }
        })
      });

      if (webhookResponse.ok) {
        const webhookData = await webhookResponse.json();
        addTestResult('webhook_simulation', 'success', 'Webhook Cakto processado', {
          event_id: webhookData.event_id,
          hybrid_system: webhookData.hybridSystem,
          guarantee: webhookData.guarantee
        });
      } else {
        const errorData = await webhookResponse.json();
        addTestResult('webhook_simulation', 'error', 'Falha no webhook', errorData);
      }

      setTestStatus('completed');
      console.log('✅ [TESTE] Todos os testes concluídos com sucesso!');

    } catch (error) {
      console.error('❌ [TESTE] Erro durante os testes:', error);
      addTestResult('general_error', 'error', 'Erro durante os testes', error);
      setTestStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
    setTestStatus('idle');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <TestTube className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'default',
      error: 'destructive',
      warning: 'secondary',
      idle: 'outline'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status}
      </Badge>
    );
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="w-5 h-5" />
          Testador do Sistema Híbrido Meta Events
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Teste completo do fluxo: localStorage → cache server-side → webhook Cakto → Meta Events
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status do Teste */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Status do Teste:</span>
            {getStatusBadge(testStatus)}
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={runTest}
              disabled={isLoading}
              variant="default"
              size="sm"
            >
              {isLoading ? 'Executando...' : 'Executar Teste Completo'}
            </Button>
            <Button
              onClick={clearResults}
              variant="outline"
              size="sm"
            >
              Limpar Resultados
            </Button>
          </div>
        </div>

        {/* Dados de Teste */}
        <Alert>
          <Database className="h-4 w-4" />
          <AlertDescription>
            <strong>Dados de Teste:</strong> {testUserData.email} | {testUserData.phone} | {testUserData.city}/{testUserData.state}
          </AlertDescription>
        </Alert>

        {/* Resultados dos Testes */}
        {testResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TestTube className="w-4 h-4" />
              Resultados dos Testes
            </h3>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                >
                  {getStatusIcon(result.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{result.test}</span>
                      {getStatusBadge(result.status)}
                      <span className="text-xs text-muted-foreground">{result.timestamp}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{result.message}</p>
                    {result.details && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                          Ver detalhes
                        </summary>
                        <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Informações do Sistema */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-sm">Client-Side</span>
              </div>
              <p className="text-xs text-muted-foreground">
                localStorage + PreparedDataSender
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-green-500" />
                <span className="font-medium text-sm">Server-Side</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Cache + Webhook Cakto
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-purple-500" />
                <span className="font-medium text-sm">Meta Events</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Purchase + Dados Enriquecidos
              </p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}