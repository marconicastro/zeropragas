'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, RefreshCw, Play, TestTube } from 'lucide-react';

interface TestResult {
  eventName: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  timestamp?: string;
}

export default function GTMFixTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (eventName: string, status: 'success' | 'error', message: string) => {
    setTestResults(prev => [...prev, {
      eventName,
      status,
      message,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testEvent = async (eventName: string) => {
    const eventId = `${eventName}_${Date.now()}_fix_test`;
    
    try {
      // Preparar evento
      let eventData: any = {
        event: eventName,
        event_id: eventId,
        timestamp: Date.now(),
        test_mode: true
      };

      // Adicionar estrutura específica
      if (['view_item', 'begin_checkout'].includes(eventName)) {
        eventData.ecommerce = {
          currency: 'BRL',
          value: 39.90,
          items: [{
            item_id: 'ebook-controle-trips',
            item_name: 'E-book Sistema de Controle de Trips',
            category: 'E-book',
            price: 39.90,
            quantity: 1
          }]
        };
      } else {
        eventData.content_name = 'E-book Sistema de Controle de Trips';
        eventData.content_category = 'E-book';
        eventData.value = 39.90;
        eventData.currency = 'BRL';
        if (eventName === 'ViewContent') {
          eventData.content_ids = ['ebook-controle-trips'];
          eventData.content_type = 'product';
        }
      }

      // Enviar para dataLayer
      if ((window as any).dataLayer) {
        (window as any).dataLayer.push(eventData);
        
        // Enviar para API GTM Server também
        const apiPayload = {
          event_name: eventName,
          event_id: eventId,
          user_data: {
            em: '',
            ph: '',
            fn: '',
            ln: '',
            ct: 'Caculé',
            st: 'BA',
            zp: '46300',
            country: 'BR',
            ga_client_id: '1693735685.1756655910',
            fbc: 'fb.1.1758764692857.IwAR2eX8Z7Y9w1L4K6P3Q8R5Tsndfijcbqwp978W6X9Y2Z3A7B8C1D2E3F4G5H6I7J8K9L0',
            fbp: 'fb.1.1756762072814.122089170647002687',
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

        const response = await fetch('/api/gtm-server', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(apiPayload)
        });

        if (response.ok) {
          const result = await response.json();
          addResult(eventName, 'success', `✅ Evento processado: ${result.message || 'Success'}`);
        } else {
          const error = await response.json();
          addResult(eventName, 'error', `❌ Erro API: ${error.error || 'Unknown error'}`);
        }
      } else {
        addResult(eventName, 'error', '❌ DataLayer não disponível');
      }
    } catch (error) {
      addResult(eventName, 'error', `❌ Erro: ${error.message}`);
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    const events = ['view_item', 'begin_checkout', 'ViewContent', 'InitiateCheckout'];
    
    for (const eventName of events) {
      await testEvent(eventName);
      // Pequena pausa entre testes
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setIsRunning(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            GTM Fix Test
          </CardTitle>
          <CardDescription>
            Teste para verificar se a correção do timestamp resolveu o problema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Problema Identificado:</strong> Os eventos estavam sendo rejeitados por falta do campo "timestamp".
              <br />
              <strong>Solução Aplicada:</strong> A API agora enriquece os eventos com timestamp antes da validação.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3 my-6">
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="flex-1"
            >
              {isRunning && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              {isRunning ? "Testando..." : "Testar Todos os Eventos"}
            </Button>
            <Button onClick={clearResults} variant="outline">
              Limpar Resultados
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
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Próximos Passos:</h4>
            <ol className="list-decimal list-inside text-sm space-y-1">
              <li>Execute os testes para verificar se a correção funcionou</li>
              <li>Se os eventos forem processados com sucesso, o problema está resolvido</li>
              <li>Use o GTM Preview Mode para confirmar que as tags estão disparando</li>
              <li>Monitore o console do navegador para mensagens de erro</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}