'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function TestTrackingPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (test: string, status: 'success' | 'error' | 'warning', message: string, details?: any) => {
    setTestResults(prev => [...prev, { test, status, message, details, timestamp: new Date() }]);
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    // Test 1: Verificar se as bibliotecas estão carregadas
    addResult('Carregamento GTM', 
      typeof window !== 'undefined' && window.dataLayer ? 'success' : 'error',
      typeof window !== 'undefined' && window.dataLayer ? 'GTM carregado' : 'GTM não encontrado',
      { dataLayer: window.dataLayer?.length || 0 }
    );

    addResult('Carregamento GA4', 
      typeof window !== 'undefined' && window.gtag ? 'success' : 'error',
      typeof window !== 'undefined' && window.gtag ? 'GA4 carregado' : 'GA4 não encontrado',
      { gtag: !!window.gtag }
    );

    addResult('Carregamento Facebook Pixel', 
      typeof window !== 'undefined' && window.fbq ? 'warning' : 'success',
      typeof window !== 'undefined' && window.fbq ? 'Facebook Pixel carregado (mas desativado)' : 'Facebook Pixel não carregado (correto)',
      { fbq: !!window.fbq }
    );

    // Test 2: Verificar EventManager
    try {
      const { eventManager } = await import('@/lib/eventManager');
      const channel = eventManager.getPrimaryChannel();
      addResult('EventManager', 'success', `Canal primário: ${channel} (apenas GTM)`, { channel });
    } catch (error) {
      addResult('EventManager', 'error', 'Erro ao carregar EventManager', { error });
    }

    // Test 3: Verificar AdvancedTracking
    if (typeof window !== 'undefined' && window.advancedTracking) {
      addResult('AdvancedTracking', 'success', 'AdvancedTracking disponível', { 
        functions: Object.keys(window.advancedTracking) 
      });
    } else {
      addResult('AdvancedTracking', 'error', 'AdvancedTracking não encontrado');
    }

    // Test 4: Enviar PageView de teste
    if (typeof window !== 'undefined' && window.advancedTracking?.testPageView) {
      try {
        window.advancedTracking.testPageView();
        addResult('PageView Test', 'success', 'PageView de teste enviado');
      } catch (error) {
        addResult('PageView Test', 'error', 'Erro ao enviar PageView', { error });
      }
    }

    // Test 5: Enviar ViewContent de teste
    if (typeof window !== 'undefined' && window.advancedTracking?.testViewContent) {
      try {
        window.advancedTracking.testViewContent();
        addResult('ViewContent Test', 'success', 'ViewContent de teste enviado');
      } catch (error) {
        addResult('ViewContent Test', 'error', 'Erro ao enviar ViewContent', { error });
      }
    }

    // Test 6: Enviar Checkout de teste
    if (typeof window !== 'undefined' && window.advancedTracking?.testCheckout) {
      try {
        window.advancedTracking.testCheckout();
        addResult('Checkout Test', 'success', 'Checkout de teste enviado');
      } catch (error) {
        addResult('Checkout Test', 'error', 'Erro ao enviar Checkout', { error });
      }
    }

    // Test 7: Verificar status completo
    if (typeof window !== 'undefined' && window.advancedTracking?.checkTrackingStatus) {
      try {
        window.advancedTracking.checkTrackingStatus();
        addResult('Status Check', 'success', 'Status verificado com sucesso');
      } catch (error) {
        addResult('Status Check', 'error', 'Erro ao verificar status', { error });
      }
    }

    // Aguardar um pouco e verificar dataLayer
    setTimeout(() => {
      if (typeof window !== 'undefined' && window.dataLayer) {
        const eventCount = window.dataLayer.filter((item: any) => item.event).length;
        addResult('DataLayer Events', 'success', `${eventCount} eventos encontrados no dataLayer`, { 
          eventCount,
          lastEvents: window.dataLayer.slice(-5)
        });
      }
      setIsRunning(false);
    }, 3000);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'bg-green-100 text-green-800 border-green-200',
      error: 'bg-red-100 text-red-800 border-red-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || ''}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Teste de Tracking GTM/GA4</h1>
        <p className="text-muted-foreground">
          Teste e valide a configuração do Google Tag Manager, Google Analytics 4 e Facebook Pixel
        </p>
      </div>

      <div className="grid gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className={`h-5 w-5 ${isRunning ? 'animate-spin' : ''}`} />
              Controle de Testes
            </CardTitle>
            <CardDescription>
              Execute testes completos para validar o funcionamento do tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button 
                onClick={runTests} 
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
                {isRunning ? 'Executando Testes...' : 'Executar Testes'}
              </Button>
              <Button 
                variant="outline" 
                onClick={clearResults}
                disabled={isRunning}
              >
                Limpar Resultados
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuração Atual</CardTitle>
            <CardDescription>
              IDs e configurações de tracking implementadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium">Google Tag Manager</h4>
                <p className="text-sm text-muted-foreground">ID: GTM-567XZCDX</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Google Analytics 4</h4>
                <p className="text-sm text-muted-foreground">ID: G-CZ0XMXL3RX</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Facebook Pixel</h4>
                <p className="text-sm text-muted-foreground">ID: 714277868320104</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">URL de Dados</h4>
                <p className="text-sm text-muted-foreground">data.maracujazeropragas.com</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Resultados dos Testes</CardTitle>
              <CardDescription>
                Resultados detalhados dos testes de tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.status)}
                        <h4 className="font-medium">{result.test}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(result.status)}
                        <span className="text-xs text-muted-foreground">
                          {result.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{result.message}</p>
                    {result.details && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                          Ver detalhes
                        </summary>
                        <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Como Usar</CardTitle>
            <CardDescription>
              Instruções para testar o tracking manualmente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">1. Console do Navegador</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Abra o console do navegador (F12) e use os seguintes comandos:
                </p>
                <div className="bg-muted p-3 rounded text-sm font-mono">
                  <p>window.advancedTracking.checkTrackingStatus()</p>
                  <p>window.advancedTracking.testPageView()</p>
                  <p>window.advancedTracking.testViewContent()</p>
                  <p>window.advancedTracking.testCheckout()</p>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  ⚠️ Facebook Pixel direto desativado para evitar duplicidade com GTM/Stape
                </p>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-2">2. Google Tag Assistant</h4>
                <p className="text-sm text-muted-foreground">
                  Instale a extensão Google Tag Assistant para verificar os eventos em tempo real.
                </p>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-2">3. Facebook Events Manager</h4>
                <p className="text-sm text-muted-foreground">
                  Verifique os eventos no Facebook Events Manager. Apenas eventos via GTM/Stape devem aparecer.
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">4. GA4 Realtime</h4>
                <p className="text-sm text-muted-foreground">
                  Monitore eventos em tempo real no Google Analytics 4 → Relatórios → Tempo real.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}