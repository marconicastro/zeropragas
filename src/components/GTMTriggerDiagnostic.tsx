'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Eye, Code, Target, Wrench } from 'lucide-react';

interface TriggerDiagnostic {
  triggerName: string;
  eventType: string;
  eventName: string;
  status: 'unknown' | 'configured' | 'not_configured' | 'blocked';
  lastTested?: string;
  recommendations: string[];
}

export default function GTMTriggerDiagnostic() {
  const [diagnostics, setDiagnostics] = useState<TriggerDiagnostic[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [dataLayerSnapshot, setDataLayerSnapshot] = useState<any[]>([]);

  const expectedTriggers: TriggerDiagnostic[] = [
    {
      triggerName: 'Evento - view_item',
      eventType: 'Evento Personalizado',
      eventName: 'view_item',
      status: 'unknown',
      recommendations: []
    },
    {
      triggerName: 'Evento - begin_checkout',
      eventType: 'Evento Personalizado',
      eventName: 'begin_checkout',
      status: 'unknown',
      recommendations: []
    },
    {
      triggerName: 'Evento - ViewContent',
      eventType: 'Evento Personalizado',
      eventName: 'ViewContent',
      status: 'unknown',
      recommendations: []
    },
    {
      triggerName: 'Evento - InitiateCheckout',
      eventType: 'Evento Personalizado',
      eventName: 'InitiateCheckout',
      status: 'unknown',
      recommendations: []
    }
  ];

  const addResult = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, `[${timestamp}] ${icon} ${message}`]);
  };

  const captureDataLayerSnapshot = () => {
    if ((window as any).dataLayer) {
      const snapshot = [...(window as any).dataLayer];
      setDataLayerSnapshot(snapshot);
      addResult(`DataLayer capturado com ${snapshot.length} itens`, 'info');
      return snapshot;
    }
    addResult('DataLayer não disponível', 'error');
    return [];
  };

  const testSingleTrigger = async (trigger: TriggerDiagnostic) => {
    addResult(`🔍 Testando gatilho: ${trigger.triggerName}`, 'info');
    
    const eventId = `${trigger.eventName}_${Date.now()}_trigger_test`;
    let eventData: any = {
      event: trigger.eventName,
      event_id: eventId,
      test_mode: true,
      timestamp: new Date().toISOString(),
      trigger_test: true
    };

    // Adicionar estrutura específica
    if (['view_item', 'begin_checkout'].includes(trigger.eventName)) {
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
      if (trigger.eventName === 'ViewContent') {
        eventData.content_ids = ['ebook-controle-trips'];
        eventData.content_type = 'product';
      }
    }

    // Capturar snapshot antes
    const beforeSnapshot = captureDataLayerSnapshot();
    
    // Enviar evento
    if ((window as any).dataLayer) {
      (window as any).dataLayer.push(eventData);
      addResult(`📤 Evento ${trigger.eventName} enviado`, 'success');
      
      // Aguardar processamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Capturar snapshot depois
      const afterSnapshot = captureDataLayerSnapshot();
      
      // Verificar se o evento foi processado
      const eventStillInDataLayer = afterSnapshot.some((item: any) => item.event_id === eventId);
      
      if (eventStillInDataLayer) {
        addResult(`⚠️ Evento ${trigger.eventName} ainda está no dataLayer (pode não ter sido processado)`, 'warning');
        trigger.recommendations.push('Verifique se o gatilho está configurado corretamente');
        trigger.status = 'not_configured';
      } else {
        addResult(`✅ Evento ${trigger.eventName} foi processado pelo GTM`, 'success');
        trigger.status = 'configured';
      }
      
      trigger.lastTested = new Date().toISOString();
    } else {
      addResult(`❌ Falha ao testar ${trigger.eventName} - dataLayer não disponível`, 'error');
      trigger.status = 'blocked';
      trigger.recommendations.push('Verifique se o dataLayer está inicializado');
    }
    
    return trigger;
  };

  const runDiagnostic = async () => {
    setIsRunning(true);
    setTestResults([]);
    setDiagnostics([]);
    
    addResult('🚀 Iniciando diagnóstico completo de gatilhos GTM...', 'info');
    
    // Verificar status inicial
    const gtmLoaded = !!(window as any).google_tag_manager;
    const dataLayerExists = !!(window as any).dataLayer;
    
    if (!gtmLoaded) {
      addResult('❌ GTM não está carregado', 'error');
      setIsRunning(false);
      return;
    }
    
    if (!dataLayerExists) {
      addResult('❌ DataLayer não está disponível', 'error');
      setIsRunning(false);
      return;
    }
    
    addResult('✅ GTM e DataLayer estão disponíveis', 'success');
    
    // Testar cada gatilho
    const results: TriggerDiagnostic[] = [];
    for (const trigger of expectedTriggers) {
      const result = await testSingleTrigger({...trigger});
      results.push(result);
      
      // Pequena pausa entre testes
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setDiagnostics(results);
    
    // Análise final
    addResult('📊 Análise final dos resultados...', 'info');
    
    const configured = results.filter(r => r.status === 'configured').length;
    const notConfigured = results.filter(r => r.status === 'not_configured').length;
    const blocked = results.filter(r => r.status === 'blocked').length;
    
    addResult(`✅ Gatilhos configurados: ${configured}`, 'success');
    addResult(`⚠️ Gatilhos não configurados: ${notConfigured}`, 'warning');
    addResult(`❌ Gatilhos bloqueados: ${blocked}`, 'error');
    
    if (notConfigured > 0) {
      addResult('🔧 Recomendações para gatilhos não configurados:', 'info');
      addResult('1. Verifique se o gatilho existe no GTM', 'info');
      addResult('2. Confirme se o nome do evento está exatamente igual', 'info');
      addResult('3. Verifique se o gatilho está ativo', 'info');
      addResult('4. Confirme se a tag está vinculada ao gatilho', 'info');
    }
    
    addResult('🏁 Diagnóstico concluído!', 'success');
    setIsRunning(false);
  };

  const generateGTMInstructions = () => {
    addResult('📋 Instruções detalhadas para configurar gatilhos no GTM:', 'info');
    addResult('', 'info');
    addResult('1. Acesse: tagmanager.google.com', 'info');
    addResult('2. Selecione seu container GTM-567XZCDX', 'info');
    addResult('3. No menu lateral, clique em "Gatilhos"', 'info');
    addResult('4. Clique em "Novo"', 'info');
    addResult('5. Configure o gatilho:', 'info');
    addResult('   - Nome: Evento - [nome do evento]', 'info');
    addResult('   - Tipo: Evento Personalizado', 'info');
    addResult('   - Nome do evento: [exatamente o nome do evento]', 'info');
    addResult('   - Este gatilho é acionado em: Todos os eventos personalizados', 'info');
    addResult('6. Salve o gatilho', 'info');
    addResult('7. Vá em "Tags" e vincule cada tag ao gatilho correspondente', 'info');
    addResult('8. Publique o container', 'info');
  };

  const clearResults = () => {
    setTestResults([]);
    setDiagnostics([]);
    setDataLayerSnapshot([]);
  };

  useEffect(() => {
    // Capturar snapshot inicial do dataLayer
    captureDataLayerSnapshot();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            GTM Trigger Diagnostic
          </CardTitle>
          <CardDescription>
            Diagnóstico especializado para identificar problemas com gatilhos do GTM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="diagnostic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="diagnostic">Diagnóstico</TabsTrigger>
              <TabsTrigger value="triggers">Gatilhos</TabsTrigger>
              <TabsTrigger value="datalogger">DataLayer</TabsTrigger>
              <TabsTrigger value="instructions">Instruções</TabsTrigger>
            </TabsList>

            <TabsContent value="diagnostic" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Diagnóstico de Gatilhos</h3>
                <Badge variant={isRunning ? "secondary" : "default"}>
                  {isRunning ? "Executando..." : "Pronto"}
                </Badge>
              </div>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Esta ferramenta testa cada gatilho individualmente para identificar 
                  problemas específicos de configuração no GTM.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button 
                  onClick={runDiagnostic} 
                  disabled={isRunning}
                  className="flex-1"
                >
                  {isRunning && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                  {isRunning ? "Executando Diagnóstico..." : "Iniciar Diagnóstico Completo"}
                </Button>
                <Button onClick={clearResults} variant="outline">
                  Limpar Resultados
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="triggers" className="space-y-4">
              <h3 className="text-lg font-semibold">Status dos Gatilhos</h3>
              {diagnostics.length > 0 ? (
                <div className="space-y-3">
                  {diagnostics.map((trigger, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-medium">{trigger.triggerName}</span>
                          <div className="text-sm text-gray-600">
                            Evento: {trigger.eventName} | Tipo: {trigger.eventType}
                          </div>
                        </div>
                        <Badge variant={
                          trigger.status === 'configured' ? 'default' :
                          trigger.status === 'not_configured' ? 'destructive' :
                          trigger.status === 'blocked' ? 'destructive' : 'secondary'
                        }>
                          {trigger.status === 'configured' ? 'Configurado' :
                           trigger.status === 'not_configured' ? 'Não Configurado' :
                           trigger.status === 'blocked' ? 'Bloqueado' : 'Desconhecido'}
                        </Badge>
                      </div>
                      {trigger.lastTested && (
                        <p className="text-sm text-gray-600 mb-2">
                          Testado em: {new Date(trigger.lastTested).toLocaleString()}
                        </p>
                      )}
                      {trigger.recommendations.length > 0 && (
                        <div className="text-sm">
                          <strong>Recomendações:</strong>
                          <ul className="list-disc list-inside mt-1">
                            {trigger.recommendations.map((rec, i) => (
                              <li key={i} className="text-gray-600">{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Execute o diagnóstico para ver o status dos gatilhos</p>
              )}
            </TabsContent>

            <TabsContent value="datalogger" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">DataLayer Logger</h3>
                <Button onClick={captureDataLayerSnapshot} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
              </div>
              
              <div className="max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg">
                {dataLayerSnapshot.length > 0 ? (
                  dataLayerSnapshot.map((item, index) => (
                    <div key={index} className="mb-3 p-3 bg-white rounded border">
                      <div className="text-xs text-gray-500 mb-1">Item {index + 1}</div>
                      <pre className="text-xs overflow-x-auto">
                        {JSON.stringify(item, null, 2)}
                      </pre>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">Nenhum item no DataLayer</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="instructions" className="space-y-4">
              <h3 className="text-lg font-semibold">Instruções Detalhadas</h3>
              
              <Alert>
                <Wrench className="h-4 w-4" />
                <AlertDescription>
                  <strong>Configuração Passo a Passo dos Gatilhos:</strong>
                  <ol className="mt-2 list-decimal list-inside text-sm space-y-2">
                    <li><strong>Acessar GTM:</strong> Vá para tagmanager.google.com</li>
                    <li><strong>Selecionar Container:</strong> Escolha GTM-567XZCDX</li>
                    <li><strong>Navegar para Gatilhos:</strong> Menu lateral → Gatilhos</li>
                    <li><strong>Criar Novo Gatilho:</strong> Clique em "Novo"</li>
                    <li><strong>Configurar Gatilho:</strong>
                      <ul className="list-disc list-inside ml-4 mt-1">
                        <li>Nome: <code>Evento - view_item</code></li>
                        <li>Tipo: <code>Evento Personalizado</code></li>
                        <li>Nome do evento: <code>view_item</code></li>
                        <li>Acionamento: <code>Todos os eventos personalizados</code></li>
                      </ul>
                    </li>
                    <li><strong>Repetir para outros eventos:</strong> begin_checkout, ViewContent, InitiateCheckout</li>
                    <li><strong>Vincular Tags:</strong> Em "Tags", vincule cada tag ao gatilho correspondente</li>
                    <li><strong>Publicar:</strong> Clique em "Enviar" para publicar as alterações</li>
                  </ol>
                </AlertDescription>
              </Alert>

              <Button onClick={generateGTMInstructions} variant="outline" className="w-full">
                Gerar Instruções no Log
              </Button>
            </TabsContent>
          </Tabs>

          {testResults.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Log de Execução</h3>
              <div className="max-h-64 overflow-y-auto p-4 bg-gray-50 rounded-lg">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono mb-1">
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}