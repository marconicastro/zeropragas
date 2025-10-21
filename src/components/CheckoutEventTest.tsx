'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, RefreshCw, Play, ShoppingCart, Timer } from 'lucide-react';

interface CheckoutTestResult {
  eventName: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  timestamp?: string;
  dataLayerFound?: boolean;
}

export default function CheckoutEventTest() {
  const [testResults, setTestResults] = useState<CheckoutTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (eventName: string, status: 'success' | 'error', message: string, dataLayerFound?: boolean) => {
    setTestResults(prev => [...prev, {
      eventName,
      status,
      message,
      timestamp: new Date().toLocaleTimeString(),
      dataLayerFound
    }]);
  };

  const testCheckoutEvents = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      // Verificar se o AdvancedTracking está disponível
      if (!window.advancedTracking) {
        addResult('Sistema', 'error', '❌ window.advancedTracking não encontrado');
        setIsRunning(false);
        return;
      }

      // Capturar dataLayer antes do teste
      const beforeDataLayer = (window as any).dataLayer ? [...(window as any).dataLayer] : [];
      
      // Preparar dados de teste
      const testUserData = {
        email: 'teste@exemplo.com',
        phone: '71999999999',
        firstName: 'João',
        lastName: 'Silva',
        city: 'Caculé',
        state: 'BA',
        zip: '46300'
      };

      addResult('Preparação', 'success', '✅ Dados de teste preparados');

      // 1. Testar begin_checkout
      console.log('🧪 Testando evento begin_checkout...');
      
      try {
        // Chamar a função trackCheckout diretamente
        await window.advancedTracking.trackCheckout(testUserData);
        
        // Aguardar um pouco para o processamento
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Verificar se os eventos foram adicionados ao dataLayer
        const afterDataLayer = (window as any).dataLayer ? [...(window as any).dataLayer] : [];
        
        // Procurar por eventos de checkout
        const beginCheckoutEvents = afterDataLayer.filter((item: any) => 
          item.event === 'begin_checkout' && 
          !beforeDataLayer.some((before: any) => before.event_id === item.event_id)
        );
        
        const initiateCheckoutEvents = afterDataLayer.filter((item: any) => 
          item.event === 'InitiateCheckout' && 
          !beforeDataLayer.some((before: any) => before.event_id === item.event_id)
        );

        if (beginCheckoutEvents.length > 0) {
          addResult('begin_checkout', 'success', `✅ Evento encontrado no dataLayer: ${beginCheckoutEvents.length} ocorrências`, true);
          console.log('✅ begin_checkout encontrado:', beginCheckoutEvents);
        } else {
          addResult('begin_checkout', 'error', '❌ Evento não encontrado no dataLayer após 2 segundos', false);
          console.log('❌ begin_checkout não encontrado no dataLayer');
        }

        if (initiateCheckoutEvents.length > 0) {
          addResult('InitiateCheckout', 'success', `✅ Evento encontrado no dataLayer: ${initiateCheckoutEvents.length} ocorrências`, true);
          console.log('✅ InitiateCheckout encontrado:', initiateCheckoutEvents);
        } else {
          addResult('InitiateCheckout', 'error', '❌ Evento não encontrado no dataLayer após 2 segundos', false);
          console.log('❌ InitiateCheckout não encontrado no dataLayer');
        }

        // 2. Verificar se os eventos foram enviados para a API
        console.log('🧪 Testando envio para API...');
        
        // Testar envio direto para API
        const apiPayload = {
          event_name: 'begin_checkout',
          event_id: `test_begin_checkout_${Date.now()}`,
          user_data: {
            em: 'teste@exemplo.com',
            ph: '71999999999',
            fn: 'João',
            ln: 'Silva',
            ct: 'Caculé',
            st: 'BA',
            zp: '46300',
            country: 'BR',
            ga_client_id: 'test_client_id',
            fbc: 'test_fbc',
            fbp: 'test_fbp',
            external_id: null
          },
          custom_data: {
            currency: 'BRL',
            value: 39.9,
            content_name: 'E-book Sistema de Controle de Trips',
            content_category: 'E-book',
            content_ids: ['6080425'],
            items: []
          }
        };

        const apiResponse = await fetch('/api/gtm-server', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(apiPayload)
        });

        if (apiResponse.ok) {
          const apiResult = await apiResponse.json();
          addResult('API GTM Server', 'success', `✅ API respondeu: ${apiResult.message || 'Success'}`);
        } else {
          const apiError = await apiResponse.json();
          addResult('API GTM Server', 'error', `❌ Erro na API: ${apiError.error || 'Unknown error'}`);
        }

      } catch (error) {
        addResult('trackCheckout', 'error', `❌ Erro ao executar trackCheckout: ${error.message}`);
        console.error('Erro no trackCheckout:', error);
      }

    } catch (error) {
      addResult('Sistema', 'error', `❌ Erro geral: ${error.message}`);
    }
    
    setIsRunning(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testManualDataLayer = () => {
    console.log('🧪 Testando envio manual para dataLayer...');
    
    const testEvent = {
      event: 'begin_checkout',
      event_id: `manual_test_${Date.now()}`,
      ecommerce: {
        currency: 'BRL',
        value: 39.90,
        items: [{
          item_id: 'ebook-controle-trips',
          item_name: 'E-book Sistema de Controle de Trips',
          category: 'E-book',
          price: 39.90,
          quantity: 1
        }]
      },
      timestamp: new Date().toISOString()
    };

    if ((window as any).dataLayer) {
      (window as any).dataLayer.push(testEvent);
      addResult('Manual Test', 'success', `✅ Evento manual enviado: ${testEvent.event_id}`);
      console.log('✅ Evento manual enviado:', testEvent);
    } else {
      addResult('Manual Test', 'error', '❌ dataLayer não encontrado');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Checkout Event Test
          </CardTitle>
          <CardDescription>
            Teste específico para eventos de checkout (begin_checkout e InitiateCheckout)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Timer className="h-4 w-4" />
            <AlertDescription>
              <strong>Problema Identificado:</strong> Os eventos de checkout não estão disparando no GTM.
              <br />
              <strong>Possível Causa:</strong> Redirecionamento muito rápido ou eventos não sendo enviados.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3 my-6">
            <Button 
              onClick={testCheckoutEvents} 
              disabled={isRunning}
              className="flex-1"
            >
              {isRunning && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              {isRunning ? "Testando..." : "Testar Eventos de Checkout"}
            </Button>
            <Button onClick={testManualDataLayer} variant="outline">
              Teste Manual
            </Button>
            <Button onClick={clearResults} variant="outline">
              Limpar
            </Button>
          </div>

          {testResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Resultados do Teste</h3>
              {testResults.map((result, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {result.status === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="font-medium">{result.eventName}</span>
                    </div>
                    <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                      {result.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{result.message}</p>
                  {result.timestamp && (
                    <p className="text-xs text-gray-500">Testado em: {result.timestamp}</p>
                  )}
                  {result.dataLayerFound !== undefined && (
                    <p className="text-xs text-blue-600">
                      DataLayer: {result.dataLayerFound ? 'Encontrado' : 'Não encontrado'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Instruções:</h4>
            <ol className="list-decimal list-inside text-sm space-y-1">
              <li>Clique em "Testar Eventos de Checkout" para simular o processo</li>
              <li>Verifique no console do navegador os logs detalhados</li>
              <li>Use o GTM Preview Mode para ver se os eventos chegam</li>
              <li>Se os eventos não forem encontrados, pode haver um problema de timing</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}