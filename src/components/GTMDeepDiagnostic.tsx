'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Eye, Code, Target, Wrench, Search, Bug } from 'lucide-react';

interface DiagnosticResult {
  step: string;
  status: 'pass' | 'fail' | 'warning';
  details: string;
  recommendations: string[];
}

export default function GTMDeepDiagnostic() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [dataLayerEvents, setDataLayerEvents] = useState<any[]>([]);
  const [gtmContainerInfo, setGtmContainerInfo] = useState<any>(null);

  const addResult = (step: string, status: 'pass' | 'fail' | 'warning', details: string, recommendations: string[] = []) => {
    setResults(prev => [...prev, { step, status, details, recommendations }]);
  };

  const captureDataLayerEvents = () => {
    if ((window as any).dataLayer) {
      const events = [...(window as any).dataLayer];
      setDataLayerEvents(events);
      return events;
    }
    return [];
  };

  const analyzeGTMContainer = () => {
    const gtm = (window as any).google_tag_manager;
    if (!gtm) {
      return null;
    }

    const containerInfo = {
      loaded: true,
      containerId: 'GTM-567XZCDX',
      containerExists: !!(gtm.GTM_567XZCDX),
      messageCallbacks: gtm.messageCallback ? 'Available' : 'Not Available',
      dataLayer: gtm.dataLayer ? 'Available' : 'Not Available',
      timestamp: new Date().toISOString()
    };

    setGtmContainerInfo(containerInfo);
    return containerInfo;
  };

  const runDeepDiagnostic = async () => {
    setIsRunning(true);
    setResults([]);
    setCurrentStep(0);
    
    addResult("Iniciando diagnóstico profundo GTM...", 'pass', "Verificação completa do sistema de rastreamento");

    // Passo 1: Verificar ambiente
    setCurrentStep(1);
    addResult(
      "Verificação do Ambiente", 
      'pass', 
      `URL: ${window.location.href}, User Agent: ${navigator.userAgent.substring(0, 50)}...`
    );

    // Passo 2: Verificar GTM
    setCurrentStep(2);
    const gtmLoaded = !!(window as any).google_tag_manager;
    if (gtmLoaded) {
      addResult(
        "GTM Carregado", 
        'pass', 
        "Google Tag Manager está carregado na página"
      );
      
      const containerInfo = analyzeGTMContainer();
      if (containerInfo?.containerExists) {
        addResult(
          "Container GTM-567XZCDX", 
          'pass', 
          "Container específico encontrado e ativo"
        );
      } else {
        addResult(
          "Container GTM-567XZCDX", 
          'fail', 
          "Container específico não encontrado",
          ["Verifique se o ID do container está correto", "Confirme se o script GTM está implementado"]
        );
      }
    } else {
      addResult(
        "GTM Carregado", 
        'fail', 
        "Google Tag Manager não encontrado",
        ["Verifique se o script GTM está implementado", "Confirme se não há bloqueadores de scripts"]
      );
      setIsRunning(false);
      return;
    }

    // Passo 3: Verificar DataLayer
    setCurrentStep(3);
    const dataLayerExists = !!(window as any).dataLayer;
    if (dataLayerExists) {
      const events = captureDataLayerEvents();
      addResult(
        "DataLayer Disponível", 
        'pass', 
        `DataLayer encontrado com ${events.length} itens`
      );
    } else {
      addResult(
        "DataLayer Disponível", 
        'fail', 
        "DataLayer não encontrado",
        ["Verifique se o dataLayer foi inicializado", "Confirme se não há conflitos de scripts"]
      );
      setIsRunning(false);
      return;
    }

    // Passo 4: Testar eventos básicos
    setCurrentStep(4);
    const testEvents = ['page_view', 'view_item', 'begin_checkout', 'ViewContent', 'InitiateCheckout'];
    
    for (const eventName of testEvents) {
      const eventId = `${eventName}_${Date.now()}_deep_test`;
      
      // Preparar evento
      let eventData: any = {
        event: eventName,
        event_id: eventId,
        diagnostic_mode: true,
        timestamp: new Date().toISOString()
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

      // Capturar estado antes
      const beforeEvents = captureDataLayerEvents();
      
      // Enviar evento
      (window as any).dataLayer.push(eventData);
      
      // Aguardar processamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Capturar estado depois
      const afterEvents = captureDataLayerEvents();
      
      // Verificar se o evento foi processado
      const eventStillInDataLayer = afterEvents.some((item: any) => item.event_id === eventId);
      
      if (eventStillInDataLayer) {
        addResult(
          `Evento ${eventName}`, 
          'warning', 
          `Evento enviado mas ainda está no dataLayer (pode não ter sido processado)`,
          [
            "Verifique se o gatilho para este evento existe no GTM",
            "Confirme se o nome do evento está exatamente igual",
            "Verifique se o gatilho está ativo"
          ]
        );
      } else {
        addResult(
          `Evento ${eventName}`, 
          'pass', 
          `Evento processado com sucesso pelo GTM`
        );
      }
    }

    // Passo 5: Análise final
    setCurrentStep(5);
    const passCount = results.filter(r => r.status === 'pass').length;
    const failCount = results.filter(r => r.status === 'fail').length;
    const warningCount = results.filter(r => r.status === 'warning').length;

    addResult(
      "Resumo do Diagnóstico", 
      failCount === 0 ? 'pass' : warningCount > 0 ? 'warning' : 'fail',
      `Resultados: ${passCount} passaram, ${warningCount} avisos, ${failCount} falharam`,
      failCount > 0 ? ["Corrija as falhas identificadas antes de continuar"] : 
      warningCount > 0 ? ["Verifique os avisos para otimizar o rastreamento"] : 
      ["Sistema está funcionando corretamente"]
    );

    setIsRunning(false);
  };

  const generateTroubleshootingGuide = () => {
    const guide = [
      "# Guia de Solução de Problemas GTM",
      "",
      "## Problemas Comuns e Soluções:",
      "",
      "### 1. Tags não são disparadas",
      "- **Causa:** Gatilhos não configurados corretamente",
      "- **Solução:** Verifique se os gatilhos existem e estão ativos",
      "",
      "### 2. Eventos não aparecem no dataLayer",
      "- **Causa:** Script de rastreamento não está sendo executado",
      "- **Solução:** Verifique se não há erros JavaScript no console",
      "",
      "### 3. GTM não carrega",
      "- **Causa:** Script GTM bloqueado ou incorreto",
      "- **Solução:** Verifique implementação do script GTM",
      "",
      "### 4. Eventos ficam presos no dataLayer",
      "- **Causa:** Gatilhos não correspondem aos eventos",
      "- **Solução:** Verifique nomes exatos dos eventos nos gatilhos",
      "",
      "## Próximos Passos:",
      "1. Use o GTM Preview Mode para debug em tempo real",
      "2. Verifique console do navegador para erros",
      "3. Teste cada evento individualmente",
      "4. Publique as alterações do container"
    ];

    console.log(guide.join('\n'));
    alert("Guia de solução de problemas gerado no console!");
  };

  const clearResults = () => {
    setResults([]);
    setDataLayerEvents([]);
    setGtmContainerInfo(null);
  };

  useEffect(() => {
    // Análise inicial
    captureDataLayerEvents();
    analyzeGTMContainer();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            GTM Deep Diagnostic
          </CardTitle>
          <CardDescription>
            Diagnóstico profundo para identificar problemas complexos no GTM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="diagnostic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="diagnostic">Diagnóstico</TabsTrigger>
              <TabsTrigger value="results">Resultados</TabsTrigger>
              <TabsTrigger value="analysis">Análise</TabsTrigger>
              <TabsTrigger value="troubleshoot">Soluções</TabsTrigger>
            </TabsList>

            <TabsContent value="diagnostic" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Diagnóstico Completo</h3>
                <Badge variant={isRunning ? "secondary" : "default"}>
                  {isRunning ? "Executando..." : "Pronto"}
                </Badge>
              </div>
              
              {isRunning && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${currentStep >= 1 ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm">Verificação do Ambiente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${currentStep >= 2 ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm">Verificação GTM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${currentStep >= 3 ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm">Verificação DataLayer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${currentStep >= 4 ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm">Teste de Eventos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${currentStep >= 5 ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm">Análise Final</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button 
                  onClick={runDeepDiagnostic} 
                  disabled={isRunning}
                  className="flex-1"
                >
                  {isRunning && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                  {isRunning ? "Executando Diagnóstico..." : "Iniciar Diagnóstico Profundo"}
                </Button>
                <Button onClick={clearResults} variant="outline">
                  Limpar
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              <h3 className="text-lg font-semibold">Resultados do Diagnóstico</h3>
              {results.length > 0 ? (
                <div className="space-y-3">
                  {results.map((result, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        {result.status === 'pass' && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {result.status === 'fail' && <XCircle className="h-4 w-4 text-red-500" />}
                        {result.status === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                        <span className="font-medium">{result.step}</span>
                        <Badge variant={
                          result.status === 'pass' ? 'default' :
                          result.status === 'fail' ? 'destructive' : 'secondary'
                        }>
                          {result.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{result.details}</p>
                      {result.recommendations.length > 0 && (
                        <div className="text-sm">
                          <strong>Recomendações:</strong>
                          <ul className="list-disc list-inside mt-1">
                            {result.recommendations.map((rec, i) => (
                              <li key={i} className="text-gray-600">{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Execute o diagnóstico para ver os resultados</p>
              )}
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <h3 className="text-lg font-semibold">Análise do Sistema</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Informações do Container GTM</h4>
                  {gtmContainerInfo ? (
                    <div className="p-3 bg-gray-50 rounded text-sm">
                      <div>Status: {gtmContainerInfo.loaded ? 'Carregado' : 'Não carregado'}</div>
                      <div>Container ID: {gtmContainerInfo.containerId}</div>
                      <div>Container Exists: {gtmContainerInfo.containerExists ? 'Sim' : 'Não'}</div>
                      <div>Message Callbacks: {gtmContainerInfo.messageCallbacks}</div>
                      <div>DataLayer: {gtmContainerInfo.dataLayer}</div>
                    </div>
                  ) : (
                    <p className="text-gray-500">Nenhuma informação disponível</p>
                  )}
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Eventos no DataLayer</h4>
                  <div className="p-3 bg-gray-50 rounded text-sm">
                    <div>Total de eventos: {dataLayerEvents.length}</div>
                    <div>Eventos de rastreamento: {
                      dataLayerEvents.filter(e => e.event && ['page_view', 'view_item', 'begin_checkout', 'ViewContent', 'InitiateCheckout'].includes(e.event)).length
                    }</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Últimos Eventos no DataLayer</h4>
                <div className="max-h-64 overflow-y-auto p-3 bg-gray-50 rounded">
                  {dataLayerEvents.slice(-5).map((event, index) => (
                    <div key={index} className="mb-2 p-2 bg-white rounded text-xs">
                      <pre className="overflow-x-auto">
                        {JSON.stringify(event, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="troubleshoot" className="space-y-4">
              <h3 className="text-lg font-semibold">Guia de Solução de Problemas</h3>
              
              <Alert>
                <Search className="h-4 w-4" />
                <AlertDescription>
                  <strong>Problemas Identificados e Soluções:</strong>
                  <div className="mt-3 space-y-3 text-sm">
                    <div>
                      <strong>1. Tags não são disparadas:</strong>
                      <p>Verifique se os gatilhos estão configurados corretamente no GTM. Os nomes dos eventos devem ser exatamente iguais.</p>
                    </div>
                    <div>
                      <strong>2. Eventos não são processados:</strong>
                      <p>Use o GTM Preview Mode para ver se os eventos estão chegando e se os gatilhos estão sendo ativados.</p>
                    </div>
                    <div>
                      <strong>3. Problemas de sincronização:</strong>
                      <p>Verifique a ordem de carregamento dos scripts. GTM deve carregar antes dos eventos.</p>
                    </div>
                    <div>
                      <strong>4. Conflitos de scripts:</strong>
                      <p>Verifique o console do navegador por erros JavaScript que possam interferir.</p>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h4 className="font-medium">Passos para Debug:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Abra o GTM Preview Mode</li>
                  <li>Digite a URL do seu site</li>
                  <li>Execute as ações que devem disparar os eventos</li>
                  <li>Verifique se os eventos aparecem no painel esquerdo</li>
                  <li>Clique nos eventos para ver os detalhes</li>
                  <li>Verifique se as tags são disparadas</li>
                  <li>Se não dispararem, verifique os gatilhos</li>
                </ol>
              </div>

              <Button onClick={generateTroubleshootingGuide} variant="outline" className="w-full">
                Gerar Guia Completo no Console
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}